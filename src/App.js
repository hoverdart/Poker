import { useState, useEffect } from "react";
import GameForm from "./components/GameForm";
import GameDisplay from "./components/GameDisplay";

class Card {
  constructor(suit, value) {
    this.suit = suit;
    if (this.suit === "Clubs") {
      this.symbol = "♣";
    } else if (this.suit === "Diamonds") {
      this.symbol = "♦";
    } else if (this.suit === "Hearts") {
      this.symbol = "♥"
    } else {
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
    this.fullHand = [];
    this.handType = "N/A";
    this.folded = false;
    this.moneyIn = 0;
    this.turn = "";
    this.isSpectating = false;
    this.allIn = false;
    this.isWinner=false;
    this.totalMoneyIn = 0;
    this.tempMoneyIn = 0;
  }
  //creates "full hand" w/ community cards
  createHand(communityCards) {
    this.fullHand = [];
    for (let i = 0; i < this.playerHand.length; i++) {
      this.fullHand.push(this.playerHand[i])
    }
    for (let i = 0; i < communityCards.length; i++) {
      this.fullHand.push(communityCards[i])
    }
  }
  //gets all possible combos of an array of length k
  getCombinations(arr, k) {
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
  //checks if the card is a straight
  isOrdered(hand) {
    let values = hand.map(card => card.value);
    if (values.includes(1)) {
      values.push(14); // Ace = 14 for high straights
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
  // ** RETURNS BEST HAND TYPE **
  type() {
    const handRankings = ["high card", "pair", "two pair", "three of a kind", "straight", "flush", "full house", "four of a kind", "straight flush", "royal flush"];
    let best = { rank: -1, values: [], combo: [], type: "high card" };
    function compareValueArrays(arr1, arr2) {
      for (let i = 0; i < Math.min(arr1.length, arr2.length); i++) {
        if (arr1[i] !== arr2[i]) return arr1[i] - arr2[i];
      }
      return 0;
    }
    function isRoyal(values){
      const royal = [10, 11, 12, 13, 14];
      return royal.every(v => values.includes(v));
    }
    function isOrdered(cards){
      const values = [...new Set(cards.map(c => c.value === 1 ? 14 : c.value))].sort((a, b) => a - b);
      if (values.length < 5) return false;
      for (let i = 0; i < values.length - 1; i++) 
        if (values[i + 1] !== values[i] + 1) return false;
      return true;
    }
    const possibleHands = this.getCombinations(this.fullHand, 5);
    for (let hand of possibleHands) {
      const sorted = [...hand].sort((a, b) => {
        const valA = a.value === 1 ? 14 : a.value;
        const valB = b.value === 1 ? 14 : b.value;
        return valB - valA;
      });
      const values = sorted.map(c => c.value === 1 ? 14 : c.value);
      const suits = sorted.map(c => c.suit);
      const counts = {};
      for (let val of values) counts[val] = (counts[val] || 0) + 1;
      const isFlush = suits.every(s => s === suits[0]);
      const isStraight = isOrdered(sorted);
      let rank = 0;
      let handVals = [];
      // Royal Flush
      if (isFlush && isRoyal(values)) {
        rank = 10;
        handVals = [14, 13, 12, 11, 10];
      }
      // Straight Flush
      else if (isFlush && isStraight) {
        rank = 9;
        handVals = values;
      }
      // Four of a Kind
      else if (Object.values(counts).includes(4)) {
        rank = 8;
        const quad = parseInt(Object.keys(counts).find(k => counts[k] === 4));
        const kicker = Math.max(...Object.keys(counts).filter(k => k !== quad).map(Number));
        handVals = [quad, quad, quad, quad, kicker];
      }
      // Full House
      else if (Object.values(counts).includes(3) && Object.values(counts).includes(2)) {
        rank = 7;
        const three = parseInt(Object.keys(counts).find(k => counts[k] === 3));
        const pair = parseInt(Object.keys(counts).find(k => counts[k] === 2));
        handVals = [three, three, three, pair, pair];
      }
      // Flush
      else if (isFlush) {
        rank = 6;
        handVals = values;
      }
      //Straight
      else if (isStraight) {
        rank = 5;
        handVals = values;
      }
      //Three of a Kind
      else if (Object.values(counts).includes(3)) {
        rank = 4;
        const three = parseInt(Object.keys(counts).find(k => counts[k] === 3));
        const kickers = Object.keys(counts).filter(k => k !== three).map(Number).sort((a, b) => b - a);
        handVals = [three, three, three, ...kickers];
      }
      // Two Pair
      else if (Object.values(counts).filter(v => v === 2).length === 2) {
        rank = 3;
        const pairs = Object.keys(counts).filter(k => counts[k] === 2).map(Number).sort((a, b) => b - a);
        const kicker = parseInt(Object.keys(counts).find(k => counts[k] === 1));
        handVals = [pairs[0], pairs[0], pairs[1], pairs[1], kicker];
      }
      // One Pair
      else if (Object.values(counts).includes(2)) {
        rank = 2;
        const pair = parseInt(Object.keys(counts).find(k => counts[k] === 2));
        const kickers = Object.keys(counts).filter(k => k !== pair).map(Number).sort((a, b) => b - a);
        handVals = [pair, pair, ...kickers];
      }
      // High Card
      else{
        rank = 1;
        handVals = values;
      }
      // Update best if stronger
      if (rank > best.rank ||(rank === best.rank && compareValueArrays(handVals, best.values) > 0)) {
        best = {
          rank,
          values: handVals,
          combo: sorted,
          type: handRankings[rank - 1],
        };
      }
    }
    this.handType = best.type;
    this.bestCombo = best.combo;
  }

  goAllIn(game) {
    this.allIn = true;
    let tempMoney = this.playerMoney;
    game.pot += tempMoney;
    this.moneyIn += this.playerMoney;
    this.totalMoneyIn += this.playerMoney;
    this.playerMoney = 0;
    game.handleAllPots();
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
    this.round = 1;
    this.boardCards = [];
    this.winner = 0;
    this.playerID = 0;
    this.currentBet = 0;
    this.spectatingPlayers = [];
    this.activePlayers = [];
    this.allPots = [];
    this.eligiblePlayers = [];
    this.aiDifficulty = 1;
    this.redoTurn = -999;
  }
  //Initializes game by setting values
  start(players, small, big, aiDifficulty, startingMoney) {
    this.players = players;
    this.small = small;
    this.big = big;
    this.aiDifficulty = parseInt(aiDifficulty);
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
    this.playerID = Math.floor(Math.random() * this.allPlayers.length); // Creates user player
    this.raiseActivePlayers = this.allPlayers;
    this.nextGame()
  }
  nextGame() { // Essentially start of a new game, resetting values
    this.game += 1;
    this.round = 1;
    this.spectatingPlayers = [];
    this.activePlayers = [];
    this.redoTurn = -999;
    //Depositing money for the winnah
    if (this.winner !== 0) {
      for(let i=0; i<this.allPots.length; i++){
        this.winner[i].playerMoney += this.allPots[i];
      }
      this.pot=0;
    }
    this.allPots=[];
    this.eligiblePlayers=[];
    this.deck = new Deck(); // Deck is reset
    this.deck.shuffle(); // Cards reshuffled
    this.boardCards = [] //Board Cards Set to NADA
    this.currentBet = this.big;

    for (let i = 0; i < this.allPlayers.length; i++) {
      this.allPlayers[i].handType = "N/A";
      this.allPlayers[i].fullHand = []
      this.allPlayers[i].folded = false;
      this.allPlayers[i].moneyIn = 0;
      this.allPlayers[i].totalMoneyIn = 0;
      this.allPlayers[i].turn = "";
      this.allPlayers[i].allIn = false;
      this.allPlayers[i].isWinner = false;
      if (this.allPlayers[i].playerMoney <= 0) {
        this.allPlayers[i].isSpectating = true;
      }
      if (this.allPlayers[i].isSpectating === true) {
        this.spectatingPlayers.push(this.allPlayers[i]);
      }
      else {
        this.activePlayers.push(this.allPlayers[i]);
      }
    }
    //The Changes Below ONLY APPLY TO ACTIVE PLAYERS.
    for (let i = 0; i < this.activePlayers.length; i++) { // Player's decks are remade, resets everything, moves small/big blinds up
      this.activePlayers[i].playerHand = [this.deck.fullDeck.shift(), this.deck.fullDeck.shift()];
    }

    //Assigning blinds (NOT subtracting money yet) (ONLY ASSIGN AFTER 1ST GAME)
    if (this.game > 1) {
      for (let i = 0; i < this.activePlayers.length; i++) {
        if (this.activePlayers[i].playerBlind === "big") {
          this.activePlayers.forEach(player => player.playerBlind = "");
          this.activePlayers[i].playerBlind = "small";
          let nextIndex = (i + 1) % this.activePlayers.length;
          this.activePlayers[nextIndex].playerBlind = "big";
          break;
        }
      }
      this.deck.fullDeck.shift(); // Burn a card 
    }

    for (let i = 0; i < this.activePlayers.length; i++) { // NOW assigning blind money, setting pot
      if (this.activePlayers[i].playerBlind === "small") {
        // Small blind: Check if player is all-in
        if (this.activePlayers[i].playerMoney < this.small) {
          this.pot += this.activePlayers[i].playerMoney;
          this.activePlayers[i].moneyIn += this.activePlayers[i].playerMoney;
          this.activePlayers[i].playerMoney = 0;
          this.activePlayers[i].allIn = true;
        } else {
          this.activePlayers[i].playerMoney -= this.small;
          this.activePlayers[i].moneyIn += this.small;
          this.pot += this.small;
        }

        let playerWithBigBlind = (i + 1) % this.activePlayers.length;
        // Big blind: Check if player is all-in
        if (this.activePlayers[playerWithBigBlind].playerMoney < this.big) {
          this.pot += this.activePlayers[playerWithBigBlind].playerMoney;
          this.activePlayers[playerWithBigBlind].moneyIn += this.activePlayers[playerWithBigBlind].playerMoney;
          this.activePlayers[playerWithBigBlind].playerMoney = 0;
          this.activePlayers[playerWithBigBlind].allIn = true;
        } else {
          this.activePlayers[playerWithBigBlind].playerMoney -= this.big;
          this.activePlayers[playerWithBigBlind].moneyIn += this.big;
          this.pot += this.big;
        }

        //Adding to totalMoneyIn
        this.activePlayers[i].totalMoneyIn += this.activePlayers[i].moneyIn;
        this.activePlayers[playerWithBigBlind].totalMoneyIn += this.activePlayers[playerWithBigBlind].moneyIn;

        //I'm starting the turn from the person after the big blind.
        this.redoTurn = (i + 2) % this.activePlayers.length;
        break;
      }
    }
  }
  //Moves on round, creates community cards, gets the winner, resets current bet/money In if round isn't first round
  nextRound() { 
    this.round += 1;
    this.redoTurn = -999;
    this.handleAllPots();

    //Handles the events of the round 
    if (this.round === 1) {
      this.currentBet = this.big;
    } else {
      this.currentBet = 0;
    }
    if(this.round === 2) { // adding cards to community cards
      this.boardCards = this.deck.fullDeck.splice(0, 3);
      for (let i = 0; i < this.activePlayers.length; i++) {
        this.activePlayers[i].createHand(this.boardCards);
        this.activePlayers[i].type();
        this.activePlayers[i].moneyIn = 0;
        this.activePlayers[i].turn = "";
      }
    }else if (this.round >= 3) {
      if(this.round !== 5) this.boardCards.push(this.deck.fullDeck.splice(0, 1)[0]);
      for (let i = 0; i < this.activePlayers.length; i++) {
        this.activePlayers[i].createHand(this.boardCards);
        this.activePlayers[i].type();
        this.activePlayers[i].moneyIn = 0;
        this.activePlayers[i].turn = "";
      }
      if (this.round === 5) { //we need to go through allPots and eligiblePlayers
        this.winner = [];
        for(let i=0; i<this.eligiblePlayers.length; i++){
          this.winner.push(this.determineRanking(this.eligiblePlayers[i]));
          this.winner[i].isWinner = true;
        }
      }
    }
  }
  //Finds the winners by ranking hands, then card values, then suits.
  determineRanking(playerList = this.activePlayers) {
    function comparePlayers(playerA, playerB) {
      const handRanking = ["high card", "pair", "two pair", "three of a kind", "straight", "flush", "full house", "four of a kind", "straight flush", "royal flush"];
      const suitRank = { clubs: 1, diamonds: 2, hearts: 3, spades: 4 };
      // Step 1: Compare hand type
      let rankA = handRanking.indexOf(playerA.handType);
      let rankB = handRanking.indexOf(playerB.handType);
      if (rankA !== rankB) return rankB - rankA;
      // Step 2: Compare bestCombo card-by-card
      for (let i = 0; i < 5; i++) {
        let valA = playerA.bestCombo[i].value === 1 ? 14 : playerA.bestCombo[i].value;
        let valB = playerB.bestCombo[i].value === 1 ? 14 : playerB.bestCombo[i].value;
        if (valA !== valB) return valB - valA;
      }
      // Step 3: Tiebreaker by suits (only if exact card values are equal)
      for (let i = 0; i < 5; i++) {
        let suitA = suitRank[playerA.bestCombo[i].suit];
        let suitB = suitRank[playerB.bestCombo[i].suit];
        if (suitA !== suitB) return suitB - suitA;
      }
      // Step 4: Fallback (sum of full hand — not really poker-accurate but good backup)
      let valueA = playerA.fullHand.reduce((sum, c) => sum + (c.value === 1 ? 14 : c.value), 0);
      let valueB = playerB.fullHand.reduce((sum, c) => sum + (c.value === 1 ? 14 : c.value), 0);
      return valueB - valueA;
    }
    let playas = [];
    for (let i = 0; i < playerList.length; i++) {
      if (!playerList[i].folded) playas.push(playerList[i]);
    }
    return playas.sort(comparePlayers)[0];
  }
  //Runs a Simulation of the Game with Varying Difficulties, Finds Winning Probability
  runSimulation(bot, difficulty = 2, trials = 5000) {
    function deepCopy(obj) {
      if (typeof obj !== "object" || obj === null) {
        return obj; // Return primitive values or null directly
      }
      let newObj = Array.isArray(obj) ? [] : Object.create(Object.getPrototypeOf(obj));
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          newObj[key] = typeof obj[key] === 'function' ? obj[key] : deepCopy(obj[key]);
        }
      }
      return newObj;
    }
    let winCt = 0;
    for (let i = 0; i < trials; i++) {
      //define variables
      let tempDeck = deepCopy(this.deck);
      tempDeck.shuffle();
      let tempCards = [];
      let tempPlayers = [];
      //Assign temp players as player objects
      for (let i = 0; i < this.activePlayers.length; i++) {
        tempPlayers[i] = new Player(i); //this ensures that the temp player's IDs are always larger than the possible IDs in the game
      }
      if (difficulty === 4) { //IMPOSSIBLE MODE: one trial needed, as the cards are EXACTLY the same.
        trials = 1;
        tempCards = [...this.boardCards]; //copies board cards
        tempDeck = deepCopy(this.deck);
        while (tempCards.length !== 5) {
          //tempDeck.fullDeck.shift() //burns card
          tempCards.push(tempDeck.fullDeck.splice(0, 1)[0]); //adds THE EXACT CARDS, AS THEY APPEAR IN REAL GAME
        }
        for (let i = 0; i < tempPlayers.length; i++) { //assigns cards to playas
          tempPlayers[i].playerHand = [...this.activePlayers[i].playerHand]; //should be same hands
        }
        tempCards = [...this.boardCards];
        while (tempCards.length !== 5) {
          tempCards.push(tempDeck.fullDeck.splice(0, 1)[0]); //adds one card till full community cards
        }
        for (let i = 0; i < tempPlayers.length; i++) { //assigns cards to playas
          tempPlayers[i].playerHand = [...this.activePlayers[i].playerHand]; //should be same hands
        }
      } else if (difficulty === 3) { //Hard Mode: Player Hands are the Same in Each Trial
        while (tempCards.length !== 5) {
          tempCards.push(tempDeck.fullDeck.splice(Math.floor(Math.random() * tempDeck.fullDeck.length), 1)[0]); //adds one RANDOM card till full community cards
        }
        for (let i = 0; i < tempPlayers.length; i++) { //assigns cards to playas
          tempPlayers[i].playerHand = [...this.activePlayers[i].playerHand]; //should be same hands
        }
      } else if (difficulty === 2) { //Medium Mode: All Cards Randomized in Each Trial
        while (tempCards.length !== 5) {
          tempCards.push(tempDeck.fullDeck.splice(Math.floor(Math.random() * tempDeck.fullDeck.length), 1)[0]); //adds one RANDOM card till full community cards
        }
        for (let i = 0; i < tempPlayers.length; i++) { //assigns cards to playas
          if (i !== bot.id) {
            tempPlayers[i].playerHand.push(tempDeck.fullDeck.splice(Math.floor(Math.random() * tempDeck.fullDeck.length), 1)[0]);
            tempPlayers[i].playerHand.push(tempDeck.fullDeck.splice(Math.floor(Math.random() * tempDeck.fullDeck.length), 1)[0]);
          } else {
            tempPlayers[i].playerHand = [...this.activePlayers[i].playerHand]; //should be same hand for bot
          }

        }
      } else { //Easy Mode: Returns Random Percentages
        return ((Math.random() * 150 - 50) / 100).toFixed(2); //ranges from -20 to 99
      }
      let testThesePlayers = []; //Removes all folded players.
      for (let i = 0; i < tempPlayers.length; i++) {
        if (!this.activePlayers[i].folded) {
          tempPlayers[i].createHand(tempCards);
          tempPlayers[i].type();
          testThesePlayers.push(tempPlayers[i]);
        }
      }
      if (this.determineRanking(testThesePlayers).id === bot.id) {
        winCt += 1;
      }
    }
    return +((winCt * 1.0) / trials).toFixed(2);
  }
  handleAllPots(){ // **THIS IS THE SIDE POT CREATION CODE STUFF!! ITS HERE!!! LOOK AT ME!!!
    //**SIDE POT CREATION CODE STARTS HERE **
    //First, let's assign player.tempMoneyIn
    this.allPots=[];
    this.eligiblePlayers=[];
    for (let i = 0; i < this.activePlayers.length; i++) {
      this.activePlayers[i].tempMoneyIn = this.activePlayers[i].totalMoneyIn
    }
    //This conditional will be reset every time an iteration is run. it'll ensure that there's at least one player that still has money.
    let sum = 0; this.activePlayers.forEach((player) => { if (!player.folded) sum += player.tempMoneyIn });
    while (sum > 0) {
      //Second, find the lowest totalMoneyIn of the active players
      let minMoneyIn = 99999;
      for (let i = 0; i < this.activePlayers.length; i++) {
        if (this.activePlayers[i].tempMoneyIn !== 0 && !this.activePlayers[i].folded) { minMoneyIn = this.activePlayers[i].tempMoneyIn; }
      }
      for (let i = 0; i < this.activePlayers.length; i++) {
        if (this.activePlayers[i].tempMoneyIn > 0 && !this.activePlayers[i].folded) {
          minMoneyIn = Math.min(this.activePlayers[i].tempMoneyIn, minMoneyIn)
        }
      }
      let tempSidePot = 0
      let listOfPlayers = []
      for (let i = 0; i < this.activePlayers.length; i++) {
        //The conditional will check if the player even can put money in. If they can, it'll subtract the minimum and add them to the list of ppl who can claim this.
        if (this.activePlayers[i].tempMoneyIn > 0) { //this'll subtract the minimum amount of money somoene has put in from the total amt of money this specific player has put in.
          const amountContributed = Math.min(this.activePlayers[i].tempMoneyIn, minMoneyIn);
          this.activePlayers[i].tempMoneyIn -= amountContributed;
          tempSidePot += amountContributed;
          if(!this.activePlayers[i].folded) listOfPlayers.push(this.activePlayers[i]);
        }
      }
      this.allPots.push(tempSidePot);
      this.eligiblePlayers.push(listOfPlayers); //THE INDEX OF EACH CORRESPONDS TO THE OTHER (index of each element in allPots matches the index of each element in eligiblePlayers)
      sum = 0; this.activePlayers.forEach((player) => { if (!player.folded) sum += player.tempMoneyIn }); //One thing idk if i need to change; remove the player.folded condition from here
    }
    // **SIDE POT CREATION CODE ENDS HERE **
  }
}

function App() {
  // **All Useful States**
  const [game, setGame] = useState(null);
  const [gameNum, setGameNum] = useState(1); //sets game number
  const [round, setRound] = useState(1); //sets round number
  const [turn, setTurn] = useState(0); // First player after dealer, FIX THIS
  const [time, toGo] = useState(0); //makes it so players are cycled after rounds
  const [message, newMessage] = useState('');
  const [nextR, changeNextR] = useState(false); //un-disables round button after round 4/player cycling

  // **IMPORTANT FUNCTIONS FOR GAME HANDLING **
  //Handles GameForm input, initializes new Game object, starts game
  function initializeValues(playerCt, smallAmt, aiDifficulty, money) {
    const newGame = new Game();
    newGame.start(playerCt, smallAmt, smallAmt*2, aiDifficulty, money);
    setGame(newGame);
    setGameNum(1);
    setRound(1);
    setTurn(newGame.redoTurn); //STARTING FROM THE GUY WITH REDOTURN
    toGo(time + 1)
  }
  //Moves to Next Round, disables Round Button, decides next player to cycle
  function handleNextRound() {
    if (game) {
      game.nextRound();
      newMessage('');
      setGame(game);
      setRound(game.round);
      changeNextR(false);
      for (let i = 0; i < game.activePlayers.length; i++) { //sets the turn to the next player who hasn't gone all in or folded.
        if (!game.activePlayers[i].folded && !game.activePlayers[i].allIn) { setTurn(i); break; }
      }
      toGo(time + 1);
    }
  }
  //Runs once 4 Rounds Conclude. Uses Game functions to reset everyone's hands/round #, starts game again.
  function handleNextGame() {
    if (game) {
      console.log("Creating the new game")
      game.nextGame();
      //Before we do EVERYTHING ELSE, it's time that we check if there's the SOLE WINNAH.
      if (game.activePlayers.length === 1) {
        let proString = "Player " + (game.activePlayers[0].id + 1) + " has won!!"
        window.alert(proString);
        proString = "Over " + (game.game - 1) + " games, this player has amassed $" + game.activePlayers[0].playerMoney + "!!!"
        window.alert(proString);
        window.alert("We need to make a proper `winning` page. For now, you get to restart the game.");
        setGame(null);
      } else {
        console.log("Next Game Time!")
        setGame(game);
        setGameNum(game.game);
        setRound(game.round);
        changeNextR(false);
        setTurn(game.redoTurn);
        toGo(time + 1);
      }
    }
  }

  //**TURNS AND AI FUNCTIONS - NEEDS FIXING FOR LATER**
  const nextTurn = () => {
    let i = 1;
    let tempTurn = turn;
    while (tempTurn + i < game.activePlayers.length || game.redoTurn > 0) {
      if (tempTurn + i >= game.activePlayers.length) { console.log("Resetting Iteration 'Till Player ", game.redoTurn + 1); tempTurn = 0; i = 0; }
      if (tempTurn + i === game.redoTurn) { console.log("Last Player Who Raised has been Reached!!"); break; }
      if (!game.activePlayers[tempTurn + i].folded && !game.activePlayers[tempTurn + i].allIn) {
        setTurn(tempTurn + i);
        return;
      }
      i += 1;
    }
    changeNextR(true);
  };
  //Handles AI Moves 
  const aiMove = () => {
    setTimeout(() => {
      const player = game.activePlayers[turn];
      const { card1, card2 } = player.playerHand; // Assuming player has card1 and card2
      const stackSize = player.playerMoney;
      const totalInvested = player.moneyIn;
      const pot = game.pot;
      const currentBet = game.currentBet;

      // Pot odds calculation
      const potOdds = (currentBet - totalInvested) / (pot + currentBet - totalInvested);
      // AI behavior profiles by difficulty
      const aiProfiles = {
        1: { bluffChance: 0.05, raiseAggression: 0.6 },
        2: { bluffChance: 0.1, raiseAggression: 1.0 },
        3: { bluffChance: 0.15, raiseAggression: 1.3 },
        4: { bluffChance: 0.25, raiseAggression: 2.0 },
      };
      const profile = aiProfiles[game.aiDifficulty] || aiProfiles[2];
      // Round thresholds for dynamic play
      const baseThreshold = game.round >= 3 ? 0.70 : game.round >= 2 ? 0.50 : 0.35;
      // Adjust aggression based on chip stack
      const isShortStacked = stackSize < pot * 0.5;
      const aggressionMultiplier = isShortStacked ? 0.8 : 1.2;
      const dynamicWinComparison = baseThreshold * aggressionMultiplier;
      // --- Preflop logic using basic hand strength ---
      const getPreflopStrength = (c1, c2) => {
        const ranks = [c1.value, c2.value].sort((a, b) => b - a);
        const suited = c1.suit === c2.suit;
        const gap = Math.abs(ranks[0] - ranks[1]);

        if (ranks[0] === ranks[1]) return 0.9; // pocket pair
        if (suited && gap === 1) return 0.7; // suited connectors
        if (ranks.includes(14) && ranks.includes(13)) return 0.75; // AK
        if (suited && gap <= 2) return 0.6; // semi-connectors
        return 0.4; // default
      };

      // Get win probability
      let winningProbability;
      if (game.round === 0) {
        winningProbability = getPreflopStrength(card1, card2);
      } else {
        const simCount = game.round >= 3 ? 6000 : game.round >= 2 ? 4000 : 2000;
        winningProbability = game.runSimulation(player, game.aiDifficulty, simCount);
      }
      //console.log(`AI Player ${turn + 1} | Win %: ${(winningProbability * 100).toFixed(2)} | Pot Odds: ${(potOdds * 100).toFixed(2)}`);
      // --- Bluffing ---
      if (!player.hasBluffed && Math.random() < profile.bluffChance && game.round >= 2) {
        player.hasBluffed = true;
        const bluffRaise = Math.floor(pot * 0.4);
        raise(Math.min(bluffRaise, stackSize - currentBet));
        return;
      }
      // --- Core Decision Logic ---
      if (winningProbability > potOdds) {
        // Worth it to stay in
        if (winningProbability >= dynamicWinComparison) {
          // Raise with more confidence
          const raiseAmount = Math.floor((winningProbability - potOdds) * pot * profile.raiseAggression);
          const cappedRaise = Math.min(raiseAmount, stackSize - currentBet);
          if (cappedRaise > 0) raise(cappedRaise);
          else call();
        }else{
          call();
        }
      }else{
        // Risky call — fold or call depending on chance
        if (winningProbability < 0.1 && potOdds > 0.5) {
          fold();
        } else if (winningProbability < 0.2 && Math.random() > 0.7) {
          fold(); // random folds for realism
        } else {
          call();
        }
      }
    }, game.aiDifficulty === 1 || game.aiDifficulty === 4 ? 2000 : 500);
  };

  //Runs the aiMove() every time the turn switches/the round starts/the game starts till rounds end
  useEffect(() => {
    if (game && game.activePlayers[turn].id !== game.playerID && game.round !== 5) {
      aiMove();
    }
  }, [turn, time]); //Any changes to turn or time vars will make the aiMove() run again.


  // **ALL PLAYER/AI FUNCTIONS**
  function raise(money = game.big) { //Bets the equivalent of the LARGE BLIND to whatever the highest bet currently is
    const mes = ("Player "+ (game.activePlayers[turn].id + 1)+ " has 'raised'");
    newMessage(mes);
    game.activePlayers[turn].turn = "raise";
    if (game.activePlayers[turn].id !== game.playerID) money = Math.floor(Math.random() * money + 1);
    let betAmount = game.currentBet + money;
    if (game.activePlayers[turn].playerMoney < betAmount - game.activePlayers[turn].moneyIn) {
      console.log("Player", game.activePlayers[turn].id + 1, "doesn't have enough money to raise. Will CALL instead.");
      call();
    } else {
      game.activePlayers[turn].playerMoney -= (betAmount - game.activePlayers[turn].moneyIn);
      game.activePlayers[turn].totalMoneyIn += (betAmount - game.activePlayers[turn].moneyIn);
      game.activePlayers[turn].moneyIn = betAmount;
      game.pot += betAmount - game.activePlayers[turn].moneyIn;
      game.currentBet = betAmount;
      game.redoTurn = turn;
      game.handleAllPots();
      nextTurn();
    }
  }
  function call() {
    //Check if they have enough money
    if (game.activePlayers[turn].playerMoney - (game.currentBet - game.activePlayers[turn].moneyIn) < 0) {
      const mes = ("Player " + (game.activePlayers[turn].id + 1) + " is going ALL IN.");
      newMessage(mes);
      game.activePlayers[turn].goAllIn(game);
      nextTurn();
    } else {
      const mes = ("Player "+ (game.activePlayers[turn].id + 1) + " has 'called'");
      newMessage(mes);
      game.activePlayers[turn].turn = "call";
      // Find highest bet
      let highestBet = 0;
      for (let player of game.activePlayers) {
        if (!player.folded) {
          highestBet = Math.max(highestBet, player.moneyIn);
        }
      }
      let player = game.activePlayers[turn];
      // Ensure the calling player matches the highest bet
      let callAmount = highestBet - player.moneyIn;
      if (callAmount > 0) {
        if (player.playerMoney >= callAmount) {
          player.playerMoney -= callAmount;
          //Adding to totalMoneyIn
          player.moneyIn += callAmount;
          player.totalMoneyIn += callAmount;

          // RUN THE SIDE POT CREATION CODE HERE INSTEAD OF THE BELOW!!!
          game.pot += callAmount;
          game.handleAllPots();
        }
      }else{
        const mes = "Player " + (game.activePlayers[turn].id+1) + " has checked.";
        newMessage(mes);
      }
      game.currentBet = highestBet;
      nextTurn();
    }
  }
  function check() {
    const mes = "Player "+( game.activePlayers[turn].id + 1)+ " has 'checked'";
    newMessage(mes);
    game.activePlayers[turn].turn = "check";
    nextTurn();
  }
  function fold() { //Prints the player who folded, sets their .folded value to True, CHECKS IF OTHER PPL FOLDED TOO 
    const mes = ("Player "+ (game.activePlayers[turn].id + 1)+ " has 'folded'");
    newMessage(mes);
    game.activePlayers[turn].folded = true; // This renders them unable to play/be selected, and adds a red border to show it.

    //CHECKING IF OTHER PPL FOLDED. SIMILAR CODE SHOULD BE ADDED TO THE ALL-IN PORTION. 
    const activePlayers = game.activePlayers.filter(player => !player.folded && !player.allIn);
    if (activePlayers.length === 1) {
      game.handleAllPots();
      game.winner = [];
      for(let i=0; i<game.eligiblePlayers.length; i++){
        game.winner.push(game.determineRanking(game.eligiblePlayers[i]));
        game.winner[i].isWinner = true;
        console.log(`Player ${game.winner[i].id + 1} wins because every other idiot folded!`);
      }
      game.round = 5;
      setRound(game.round) //YOU GOTA ADD THE SIDE POT CREATION CODE HERE AS WELL!!! 
    } else {
      nextTurn();
    }
  }

  //**ALL CODE DISPLAYED (WILL BE CHANGED LATER, FOCUS ON GAME LOGIC FIRST)**
  return (
    <div className="App">
      {/* Navbar - Will be Implemented in the FUTURE */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        <a className="navbar-brand fs-3 fw-bold" href="/">🃏</a>
        {/* 
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="#">Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">How to Play</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Leaderboard</a>
            </li>
            <li className="nav-item">
              <a className="btn btn-outline-primary ms-3" href="#game-setup">Start Game</a>
            </li>
          </ul>
        </div>
        */}
      </nav>

      {/* Hero Section */}
      <header className="bg-dark text-light text-center py-1">
        <h1 className="display-3 fw-bold">Poker!</h1>
        <p className="lead">The Ultimate Texas Hold'em experience. Are you ready to go all in?</p>
      </header>

      {/* Game Setup Section */}
      <section id="game-setup" className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <GameForm onSubmit={initializeValues} />
          </div>
        </div>
      </section>

      {/* Game Display Section */}
      <section className="container mt-4">
        {game && (
          <>
            <GameDisplay gameNum={gameNum} round={round} game={game} handleNextRound={handleNextRound} handleNextGame={handleNextGame} turn={turn} check={check} fold={fold} raise={raise} call={call} nextR={nextR} message={message} />
          </>
        )}
      </section>
    </div>
  );
}
export default App;