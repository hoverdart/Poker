import { useState } from "react";
import GameForm from "./components/GameForm";
import GameDisplay from "./components/GameDisplay";

class Card {
  constructor(suit, value) {
    this.suit = suit;
    if (this.suit === "Clubs"){
      this.symbol = "♣";
    }else if(this.suit === "Diamonds"){
      this.symbol = "♦";
    }else if(this.suit === "Hearts"){
      this.symbol = "♥"
    }else{
      this.symbol = "♠"
    }
    this.value = value;
    this.name = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"][value - 1];
  }
}
class Deck {
  constructor() {
    this.fullDeck = [];
    ["Spades", "Hearts", "Diamonds", "Clubs"].forEach((suit) => {
      for (let value = 1; value <= 13; value++) {
        this.fullDeck.push(new Card(suit, value));
      }
    });
  }
  shuffle() {
    for (let i = this.fullDeck.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [this.fullDeck[i], this.fullDeck[j]] = [this.fullDeck[j], this.fullDeck[i]];
    }
  }
}
class Player {
  constructor(id) {
    this.id = id;
    this.playerBlind = "";
    this.playerMoney = 0;
    this.playerHand = [];
    this.fullHand=[];
    this.handType = "N/A";
  }

  createHand(communityCards){
    this.fullHand = []; //fullHand has the entire hand
    for(let i=0;i<this.playerHand.length;i++){
      this.fullHand.push(this.playerHand[i])
    }
    for(let i=0;i<communityCards.length;i++){
      this.fullHand.push(communityCards[i])
    }
  }

  getCombinations(arr, k) { //gets all possible combos of hand
    let result = [];
    const combine = (start, combo) => {
      if (combo.length === k) {
        result.push([...combo]);
        return;
      }
      for (let i = start; i < arr.length; i++) {
        combine(i + 1, [...combo, arr[i]]);
      }
    };
    combine(0, []);
    return result;
  }
  isOrdered(hand) { //checks if the card is a straight
    let values = hand.map(card => card.value);
    if (values.includes(1)) {
      values.push(14); // Add Ace as 14 for high straights
    }
    values = [...new Set(values)]; // Remove duplicates
    values.sort((a, b) => a - b); // Sort numerically
    for (let i = 0; i <= values.length - 5; i++) {
      if (values[i + 4] - values[i] === 4) {
        return true;
      }
    }
    if (values.includes(1) && values.includes(2) && values.includes(3) && values.includes(4) && values.includes(5)) {
      return true;
    }
    return false;
  }
  
  type() { 
    let bestHandType = "high card"; // Default lowest hand
    // Get all possible 5-card combinations from the 7-card hand
    let possibleHands = this.getCombinations(this.fullHand, 5);
    for (let hand of possibleHands) {
        let suitFlag = true;
        for (let i = 1; i < hand.length; i++) {
            if (hand[i].suit !== hand[i - 1].suit) {
                suitFlag = false;
                break;
            }
        }
        let handRank = 0; // Stores rank (higher = stronger hand)
        // **Check for Royal Flush**
        if (suitFlag) { // If suit are same
            let royalFlush = ["Ace", "King", "Queen", "Jack", "10"];
            if (hand.every(card => royalFlush.includes(card.name))) { //checks every card in hand, if its in royalFlush
                handRank = 10;
            } 
        }
        // **Check for Straight Flush**
        if (suitFlag && this.isOrdered(hand)) {
            handRank = Math.max(handRank, 9);
        }
        // Count occurrences of each card value
        let countsOfEach = new Array(13).fill(0);
        for (let card of hand) {
            countsOfEach[card.value - 1]++;
        }
        let pairs = 0, triple = false, quad = false;
        for (let count of countsOfEach) {
            if (count === 2) pairs++;
            else if (count === 3) triple = true;
            else if (count === 4) quad = true;
        }
        // **Four of a Kind**
        if (quad) handRank = Math.max(handRank, 8);
        // **Full House**
        if (triple && pairs === 1) handRank = Math.max(handRank, 7);
        // **Flush**
        if (suitFlag) handRank = Math.max(handRank, 6);
        // **Straight**
        if (this.isOrdered(hand)) handRank = Math.max(handRank, 5);
        // **Three of a Kind**
        if (triple) handRank = Math.max(handRank, 4);
        // **Two Pair**
        if (pairs === 2) handRank = Math.max(handRank, 3);
        // **One Pair**
        if (pairs === 1) handRank = Math.max(handRank, 2);

        // Update best hand if this hand is stronger
        const handRankings = [
            "high card", "pair", "two pair", "three of a kind",
            "straight", "flush", "full house", "four of a kind",
            "straight flush", "royal flush"
        ];
        if (handRank > handRankings.indexOf(bestHandType)) {
            bestHandType = handRankings[handRank-1];
        }
    }
    this.handType = bestHandType;
  }
}

class Game {
  constructor() {
    this.players = 0;
    this.deck = new Deck();
    this.allPlayers = [];
    this.pot = 0;
    this.small = 0;
    this.big = 0;
    this.startingMoney = 0;
    this.game = 0;
    this.round=1;
    this.boardCards = [];
    this.winner=0;
  }

  start(players, small, big, startingMoney) {
    this.players = players;
    this.small = small;
    this.big = big;
    this.startingMoney = startingMoney;
    this.deck.shuffle();
    for (let i = 0; i < this.players; i++) {
      let newPlayer = new Player(i);
      if (i === 0) newPlayer.playerBlind = "small";
      else if (i === 1) newPlayer.playerBlind = "big";
      newPlayer.playerHand = [this.deck.fullDeck.shift(), this.deck.fullDeck.shift()];
      newPlayer.playerMoney = this.startingMoney;
      this.allPlayers.push(newPlayer);
    }
    this.nextGame()
  }

  nextGame() { // essentially start of a new game; this should be run directly after "start" to get to the "preflop" stage
    this.game +=1;
    this.round = 1;
    this.deck = new Deck(); // Deck is reset
    this.deck.shuffle(); // Cards reshuffled
    this.boardCards = [] //Board Cards Set to NADA

    for (let i = 0; i < this.players; i++) { // Player's decks are remade
      this.allPlayers[i].playerHand = [this.deck.fullDeck.shift(), this.deck.fullDeck.shift()];
      this.allPlayers[i].handType="N/A"
    }
    for (let i = 0; i < this.allPlayers.length; i++) { // Moving the small/big blinds up
      if (this.allPlayers[i].playerBlind === "big"){
        for (let i=0;i<this.allPlayers.length;i++){
          this.allPlayers[i].playerBlind=""
        }
        this.allPlayers[i].playerBlind = "small";
        if (i+1 === this.allPlayers.length){
          this.allPlayers[0].playerBlind = "big";
        }else{
          this.allPlayers[i+1].playerBlind = "big";
        }
        break;
      }
    }
    this.deck.fullDeck.shift(); // Burn a card
    for (let i = 0; i < this.allPlayers.length; i++) { //The pot is set 
      if (this.allPlayers[i].playerBlind === "small") {
        this.allPlayers[i].playerMoney -= this.small;
        this.pot += this.small;
        if (i === this.allPlayers.length - 1) {
          this.allPlayers[0].playerMoney -= this.big;
          this.pot += this.big;
        } else {
          this.allPlayers[i + 1].playerMoney -= this.big;
          this.pot += this.big;
        }
      }
    }
    this.print()
  }

  nextRound() { // This starts creating community cards
    this.round+=1;
    if (this.round === 2) { // adding cards to community cards
      this.boardCards = this.deck.fullDeck.splice(0, 3);

      for (var i=0; i<this.allPlayers.length; i++){
        this.allPlayers[i].createHand(this.boardCards);
        this.allPlayers[i].type();
      }
    }else if(this.round === 3 || this.round === 4){
      this.boardCards.push(this.deck.fullDeck.splice(0, 1)[0]);

      for (let i=0; i<this.allPlayers.length; i++){
        this.allPlayers[i].createHand(this.boardCards);
        this.allPlayers[i].type();
      }
      if (this.round === 4){
        this.winner = this.determineRanking();
        console.log("THIS IS THE WINNER: ")
        console.log(this.winner);
      }
    }
    this.print()
  }
  determineRanking() {
    function comparePlayers(playerA, playerB) {
        let handRanking = ["high card", "pair", "two pair", "three of a kind", "straight", "flush", "full house", "four of a kind", "straight flush", "royal flush"];
        // Get numerical rank of hand type
        let rankA = handRanking.indexOf(playerA.handType);
        let rankB = handRanking.indexOf(playerB.handType);
        if (rankA !== rankB) {
            return rankB - rankA; // Reverse order so highest rank is first
        }
        // Sum the card values, treating Aces properly
        let valueA = playerA.fullHand.reduce((sum, card) => sum + (card.value === 1 ? 11 : card.value), 0);
        let valueB = playerB.fullHand.reduce((sum, card) => sum + (card.value === 1 ? 11 : card.value), 0);
        if (valueA !== valueB) {
            return valueB - valueA; // Higher card sum wins
        }
        // Suit ranking for tiebreakers (spades > hearts > diamonds > clubs)
        const suitRank = { clubs: 1, diamonds: 2, hearts: 3, spades: 4 };
        for (let i = 0; i < playerA.fullHand.length; i++) {
            let suitA = suitRank[playerA.fullHand[i].suit];
            let suitB = suitRank[playerB.fullHand[i].suit];
            if (suitA !== suitB) {
                return suitB - suitA; // Higher suit wins
            }
        }
        return 0; // Completely tied
    }

    let playas = [...this.allPlayers]; // Copy players list
    playas.sort(comparePlayers); // Sort from best to worst
    return playas[0]; // The best player is now at index 0
  }
  print() {
    console.log("Players Info:", this.allPlayers);
    console.log("Community Cards: ",this.boardCards);
    console.log("Pot: ",this.pot);
  }
}

function App() {
  const [game, setGame] = useState(null);
  const [gameNum, setGameNum] = useState(1);
  const [round, setRound] = useState(1);
  
  function initializeValues(playerCt, smallAmt, largeAmt, money) {
    const newGame = new Game();
    newGame.start(playerCt, smallAmt, largeAmt, money);
    setGame(newGame);
    setGameNum(1);
    setRound(1);
  }
  function handleNextRound() {
    if (game) {
      game.nextRound();
      setGame(game);
      setRound(game.round);
    }
  }

  function handleNextGame() {
    if (game) {
      game.nextGame();
      setGame(game);
      setGameNum(game.game);
      setRound(game.round);
    }
  }

  return (
    <div className="App">
      <GameForm onSubmit={initializeValues} />
      {game && (<GameDisplay gameNum={gameNum} round={round} game={game} handleNextRound={handleNextRound} handleNextGame={handleNextGame} />)}
    </div>
  );
}
export default App;