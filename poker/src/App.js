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

  isOrdered(){
    let values = [];
    for(let i=0;i<this.fullHand.length; i++){
      values.push(this.fullHand[i].value);
    }
    values.sort();
    let flag = true;
    for(let i=0; i<values.length-1; i++){
      if(values[i+1] - values[i] !== 1){
        flag = false;
        break;
      }
    }
    return flag;
  }

  type(){ // Determines the type of hand that the player has, assigns it to handType
    let suitFlag = true;
    for(let i=1; i<this.fullHand.length;i++){
      if (this.fullHand[i].suit !== this.fullHand[i-1].suit){
        suitFlag = false;
        break;
      }
    }
    if (suitFlag){ //if suits are the same
      this.handType="flush";
      let determineRoyal = ["Ace", "King", "Queen", "Jack", "10"];
      let determineRoyalFlag=true;
      for(let i=0; i<this.fullHand.length;i++){
        if (!determineRoyal.includes(this.fullHand[i].name)){
          determineRoyalFlag = false;
          break;
        }
      }
      if (determineRoyalFlag){
        this.handType="royal flush";
      }else if(this.isOrdered()){
        this.handType="straight flush";
      }
    }else{ //if suits are NOT the same
      let countsOfEach = [0,0,0,0,0,0,0,0,0,0,0,0,0]
      for(let i=0; i<this.fullHand.length;i++){
        countsOfEach[this.fullHand[i].value-1] +=1;
      }
      let pairs = 0;
      let triple = false;
      let quad = false;
      for(let i=0; i<countsOfEach.length;i++){
        if (countsOfEach[i] === 2){
          pairs+=1;
        }else if(countsOfEach[i] === 3){
          triple = true
        }else if(countsOfEach[i] === 4){
          quad = true
          break
        }
      }
      if (quad){
        this.handType="four of a kind";
      }else if(triple){
        if(pairs === 1){
          this.handType="full house"
        }else{
          this.handType="three of a kind"
        }
      }else if(pairs > 0){
        this.handType = "pair"
        if (pairs === 2){
          this.handType="two pair"
        }
      }else{
        this.handType="high card"
      }
    }
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