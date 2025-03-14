import { useState, useEffect } from "react";
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
    this.folded=false;
    this.moneyIn = 0;
    this.turn="";
    this.isSpectating = false;
    this.allIn = false;
    this.sidePotChecked = false;
    this.totalMoneyIn = 0;
  }
  //creates "full hand" w/ community cards
  createHand(communityCards){ 
    this.fullHand = []; 
    for(let i=0;i<this.playerHand.length;i++){
      this.fullHand.push(this.playerHand[i])
    }
    for(let i=0;i<communityCards.length;i++){
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
  //finds out the best hand type out of all possible hand combos
  type() { 
    let bestHandType = "high card"; // Default lowest hand
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
        if (suitFlag) {
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
        const handRankings = [ "high card", "pair", "two pair", "three of a kind", "straight", "flush", "full house", "four of a kind","straight flush", "royal flush"];
        if (handRank > handRankings.indexOf(bestHandType)) {
            bestHandType = handRankings[handRank-1];
        }
    }
    this.handType = bestHandType;
  }

  goAllIn(game){
    this.allIn = true;
    if(game.sidePot.length>0){
      game.pot += game.pot;
      this.playerMoney-= game.pot;
      for(let i=0;i<game.sidePot.length; i++){
        if(i===game.sidePot.length-1){
          game.sidePot[i]+=this.playerMoney;
        }
        else{
          game.sidePot[i]+=game.sidePot[i];
          this.playerMoney-=game.sidePot[i];
        }
      }
    }
    else{
      game.pot += this.playerMoney;
    }
    this.moneyIn += this.playerMoney;
    this.totalMoneyIn += this.playerMoney;
    this.playerMoney = 0;
  }
}
class Bot extends Player{
  constructor(botID) {
    this.botID=botID; //Assign a different ID to the bot than the player to prevent interference with turns
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
    this.playerID=0;
    this.currentBet=0;
    this.spectatingPlayers = [];
    this.activePlayers = [];
    this.sidePotPlayers = [];
    this.sidePot = [];
    this.redoTurn=-999;
  }
  //Initializes game by setting values
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
    this.playerID = Math.floor(Math.random()*this.allPlayers.length); // Creates user player
    this.raiseActivePlayers = this.allPlayers;
    this.nextGame()
  }
  nextGame() { // Essentially start of a new game, resetting values
    this.game +=1;
    this.round = 1;
    this.spectatingPlayers = [];
    this.activePlayers = [];
    this.redoTurn=-999;
    
    //Depositing money for the winnah
    if (this.winner !== 0){
      this.winner.playerMoney +=  this.pot;
      this.pot = 0;
      this.winner = 0;
    }
    this.deck = new Deck(); // Deck is reset
    this.deck.shuffle(); // Cards reshuffled
    this.boardCards = [] //Board Cards Set to NADA
    this.currentBet=this.big;

    for (let i = 0; i < this.allPlayers.length; i++) {
      this.allPlayers[i].handType="N/A";
      this.allPlayers[i].fullHand=[]
      this.allPlayers[i].folded=false;
      this.allPlayers[i].moneyIn = 0;
      this.allPlayers[i].totalMoneyIn = 0;
      this.allPlayers[i].turn = "";
      this.allPlayers[i].allIn=false;
      this.allPlayers[i].sidePotChecked = false;
      if(this.allPlayers[i].playerMoney <= 0){
        this.allPlayers[i].isSpectating = true;
      }
      if(this.allPlayers[i].isSpectating===true){
        this.spectatingPlayers.push(this.allPlayers[i]);
      }
      else{
        this.activePlayers.push(this.allPlayers[i]);
      }
    }

    console.log("The Active Players Are: ",this.activePlayers);
    //The Changes Below ONLY APPLY TO ACTIVE PLAYERS.
    for (let i = 0; i < this.activePlayers.length; i++) { // Player's decks are remade, resets everything, moves small/big blinds up
      this.activePlayers[i].playerHand = [this.deck.fullDeck.shift(), this.deck.fullDeck.shift()];
    }

    //Assigning blinds (NOT subtracting money yet) (ONLY ASSIGN AFTER 1ST GAME)
    if (this.game > 1){
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
          console.log("Small blind player",i+1,"is all in")
        }else{
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
          console.log("Big blind player",playerWithBigBlind+1,"is all in")
        }else{
          this.activePlayers[playerWithBigBlind].playerMoney -= this.big;
          this.activePlayers[playerWithBigBlind].moneyIn += this.big;
          this.pot += this.big;
        }

        //I'm starting the turn from the person after the big blind.
        this.redoTurn = (i + 2) % this.activePlayers.length;
        break;
      }
    }
    console.log(this.allPlayers)
    console.log(this.activePlayers)
    console.log(this.spectatingPlayers)

    this.print()
  }
  //Moves on round, creates community cards, gets the winner, resets current bet/money In if round isn't first round
  nextRound() {
    this.round+=1;
    this.redoTurn=-999;
    if(this.round === 1){
      this.currentBet=this.big;
    }else{
      this.currentBet=0;
    }
    if (this.round === 2) { // adding cards to community cards
      this.boardCards = this.deck.fullDeck.splice(0, 3);

      for (var i=0; i<this.activePlayers.length; i++){
        this.activePlayers[i].createHand(this.boardCards);
        this.activePlayers[i].type();
        this.activePlayers[i].moneyIn=0;
        this.activePlayers[i].turn = "";
      }
    }else if(this.round === 3 || this.round === 4){
      this.boardCards.push(this.deck.fullDeck.splice(0, 1)[0]);

      for (let i=0; i<this.activePlayers.length; i++){
        this.activePlayers[i].createHand(this.boardCards);
        this.activePlayers[i].type();
        this.activePlayers[i].moneyIn=0;
        this.activePlayers[i].turn = "";
      }
      if (this.round === 4){
        this.winner = this.determineRanking();
      }
    }
    this.print()
  }
  //Finds the winner by ranking hands, then card values, then suits.
  determineRanking() {
    function comparePlayers(playerA, playerB) {
        let handRanking = ["high card", "pair", "two pair", "three of a kind", "straight", "flush", "full house", "four of a kind", "straight flush", "royal flush"];
        // First Test: Compare Hand Types
        let rankA = handRanking.indexOf(playerA.handType);
        let rankB = handRanking.indexOf(playerB.handType);
        if (rankA !== rankB) return rankB - rankA; // Reverse order so highest rank is first
        //Second Test: Compare Highest Valued Card
        let maxValA = Math.max((playerA.playerHand[0].value === 1 ? 14 : playerA.playerHand[0].value), (playerA.playerHand[1].value === 1 ? 14 : playerA.playerHand[1].value)); 
        let maxValB = Math.max((playerB.playerHand[0].value === 1 ? 14 : playerB.playerHand[0].value), (playerB.playerHand[1].value === 1 ? 14 : playerB.playerHand[1].value)); 
        if(maxValA !== maxValB) return maxValB - maxValA;
        // Third Test: Compare Suits(spades > hearts > diamonds > clubs)
        const suitRank = { clubs: 1, diamonds: 2, hearts: 3, spades: 4 };
        if(playerA.playerHand[0].value > playerA.playerHand[1].value){ maxValA = suitRank[playerA.playerHand[0].suit];}else{ maxValA = suitRank[playerA.playerHand[1].suit];}
        if(playerB.playerHand[0].value > playerB.playerHand[1].value){ maxValB = suitRank[playerB.playerHand[0].suit];}else{ maxValB = suitRank[playerB.playerHand[1].suit];}
        if (maxValA !== maxValB) {
          return maxValB - maxValA;
        }
        //FINAL Test: Sum Total Card Values
        let valueA = playerA.fullHand.reduce((sum, card) => sum + (card.value === 1 ? 14 : card.value), 0);
        let valueB = playerB.fullHand.reduce((sum, card) => sum + (card.value === 1 ? 14 : card.value), 0);
        if (valueA !== valueB) {
            return valueB - valueA; // Higher card sum wins
        }
        return 0; 
    }
    let playas = [[]];
    for(let x=0; x<this.sidePot.length; x++){
      for (let i=0; i<this.activePlayers.length; i++){
        if(this.activePlayers[i].totalMoneyIn >= this.sidePot[i]){
          this.activePlayers[i].totalMoneyIn-=this.sidePot[i];
          if (!this.activePlayers[i].folded) playas[x].push(this.activePlayers[i]);
        }
      }
      playas[x].sort(comparePlayers); 
    }
    let plaaaayas = [];
    for(let i=0; i<playas.length; i++){
      plaaaayas.push(playas[i][0]);
    } 
    return plaaaayas;
  }

  //Prints out all info
  print() {
    console.log("Players Info:", this.activePlayers);
    console.log("Community Cards: ",this.boardCards);
    console.log("Pot: ",this.pot);
  
  }
}

function App() {
  // **All Useful States**
  const [game, setGame] = useState(null);
  const [gameNum, setGameNum] = useState(1); //sets game number
  const [round, setRound] = useState(1); //sets round number
  const [turn, setTurn] = useState(0); // First player after dealer, FIX THIS
  const [time, toGo] = useState(0); //makes it so players are cycled after rounds
  const [nextR, changeNextR] = useState(false); //un-disables round button after round 4/player cycling
  
  // **IMPORTANT FUNCTIONS FOR GAME HANDLING **
  //Handles GameForm input, initializes new Game object, starts game
  function initializeValues(playerCt, smallAmt, largeAmt, money) {
    const newGame = new Game();
    newGame.start(playerCt, smallAmt, largeAmt, money);
    setGame(newGame);
    setGameNum(1);
    setRound(1);
    setTurn(newGame.redoTurn); //STARTING FROM THE GUY WITH REDOTURN
    toGo(time+1)
  }
  //Moves to Next Round, disables Round Button, decides next player to cycle
  function handleNextRound() {
    if (game) {
      game.nextRound();
      setGame(game);
      setRound(game.round);
      changeNextR(false);
      for(let i=0; i<game.activePlayers.length; i++){
        if(!game.activePlayers[i].folded){ setTurn(i); break;}
      }
      toGo(time+1);
    }
  }
  //Runs once 4 Rounds Conclude. Uses Game functions to reset everyone's hands/round #, starts game again.
  function handleNextGame() {
    if (game) {
      console.log("Creating the new game")
      game.nextGame();
      //Before we do EVERYTHING ELSE, it's time that we check if there's the SOLE WINNAH.
      if(game.activePlayers.length === 1){
        let proString = "Player " + (game.activePlayers[0].id+1) + " has won!!"
        window.alert(proString);
        proString = "Over "+(game.game-1)+" games, this player has amassed $"+game.activePlayers[0].playerMoney+"!!!"
        window.alert(proString);
        window.alert("We need to make a proper `winning` page. For now, you get to restart the game.");
        setGame(null);
      }else{
        console.log("Next Game Time!")
        setGame(game);
        setGameNum(game.game);
        setRound(game.round);
        changeNextR(false);
        console.log(game);
        setTurn(game.redoTurn);
        toGo(time+1);
      } 
    }
  }

  //**TURNS AND AI FUNCTIONS - NEEDS FIXING FOR LATER**
  //Handles player switching. FIX LATER! NEEDS TO START AFTER DEALER, AND NEEDS TO CYCLE AFTER BETS/RAISES!
  const nextTurn = () => {
    let i = 1;
    let tempTurn=turn;
    while (tempTurn + i < game.activePlayers.length || game.redoTurn > 0) {
      if(tempTurn+i >= game.activePlayers.length){console.log("Resetting Iteration 'Till Player ", game.redoTurn+1); tempTurn=0; i=0;} 
      if(tempTurn+i === game.redoTurn) {console.log("Last Player Who Raised has been Reached!!"); break;}
      if (!game.activePlayers[tempTurn + i].folded) {
        setTurn(tempTurn + i);
        return; 
      }
      i += 1;
    }
    changeNextR(true);
  };
  //Handles "AI" Moves (Random Choice between options)
  const aiMove = () => {
    setTimeout(() => {
      let actions = ["raise","call", "fold", "check"];
      if(game.currentBet !== 0) actions[3] = "call";
      else actions[1] = "check";
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      if (randomAction === "raise") raise();
      if (randomAction === "call") call();
      if (randomAction === "check") check();
      if (randomAction === "fold") fold();
    }, 1000); 
  };
  //Runs the aiMove() every time the turn switches/the round starts/the game starts till rounds end
  useEffect(() => {
    if (game && game.activePlayers[turn].id !== game.playerID && game.round !== 4) {
      aiMove();
    }
  }, [turn, time]); //Any changes to turn or time vars will make the aiMove() run again.

  // **ALL PLAYER/AI FUNCTIONS**
  function raise(money=game.big){ //Bets the equivalent of the LARGE BLIND to whatever the highest bet currently is
    console.log("Player ",game.activePlayers[turn].id+1,"has 'raised'");
    game.activePlayers[turn].turn="raise";
    if(game.activePlayers[turn].id !== game.playerID) money=Math.floor(Math.random()*money+1);
    let betAmount = game.currentBet + money; 
    if (game.activePlayers[turn].playerMoney < betAmount) {
        console.log("Player", game.activePlayers[turn].id+1, "doesn't have enough money to raise. will CALL instead.");
        call();
    }else{
    for(let i=0; i<game.activePlayers.length; i++){
      if(game.activePlayers[i].allIn === true && game.activePlayers[i].sidePotChecked === false){
        game.activePlayers[i].sidePotChecked = true;
        game.sidePot.push(money-game.pot);
        break;
        //side pot created, check who is eligible for it player b creates side pot, player c rsaises beyond side pot, player a check bc he went all in, 
      }
    }
    game.activePlayers[turn].totalMoneyIn += money;
    game.activePlayers[turn].playerMoney -= (betAmount - game.activePlayers[turn].moneyIn);
    game.pot += betAmount - game.activePlayers[turn].moneyIn;
    game.activePlayers[turn].moneyIn = betAmount;
    game.currentBet = betAmount;
    console.log("Raise Amount: ", game.currentBet);
    game.redoTurn = turn;
    nextTurn();
  }}
  function call() { 
    //Check if they have enough money
    if(game.activePlayers[turn].playerMoney - (game.currentBet - game.activePlayers[turn].moneyIn) < 0){
      game.activePlayers[turn].goAllIn(game);
      nextTurn();
    }else{
      console.log("Player", game.activePlayers[turn].id + 1, "has 'called'");
      game.activePlayers[turn].turn="call";
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
              player.moneyIn += callAmount;
              player.totalMoneyIn += callAmount;
              if(game.sidePot.length>0){
                game.pot += game.pot;
                callAmount-= game.pot;
                for(let i=0;i<game.sidePot.length; i++){
                  if(i===game.sidePot.length-1){
                    game.sidePot[i]+=callAmount;
                  }
                  else{
                    game.sidePot[i]+=game.sidePot[i];
                    callAmount-=game.sidePot[i];
                  }
                }
              }
              else{
                game.pot += callAmount;
              }
          } else {
              console.log("Player", player.id + 1, "does not have enough money to call ALL IN instead.");
              player.goAllIn(game);
          }
      } else {
          console.log("Player", player.id + 1, "is already at the highest bet.");
      }
      game.currentBet = highestBet;
      nextTurn();
  }
  }
  function check(){ //MUST BE IMPLEMENTED!
    console.log("Player ",game.activePlayers[turn].id+1,"has 'checked'");
    game.activePlayers[turn].turn="check";
    nextTurn();
  }
  function fold(){ //Prints the player who folded, sets their .folded value to True, CHECKS IF OTHER PPL FOLDED TOO 
    console.log("Player ",game.activePlayers[turn].id+1,"has 'folded'");
    game.activePlayers[turn].folded=true; // This renders them unable to play/be selected, and adds a red border to show it.

    //CHECKING IF OTHER PPL FOLDED
    const activePlayers = game.activePlayers.filter(player => !player.folded);
    if (activePlayers.length === 1) {
        game.winner = activePlayers[0];
        game.round = 4; 
        setRound(game.round)
        console.log(`Player ${game.winner.id+1} wins because every other idiot folded!`);
    }else{
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
          <GameDisplay gameNum={gameNum} round={round} game={game} handleNextRound={handleNextRound} handleNextGame={handleNextGame} turn={turn} check={check} fold={fold} raise={raise} call={call} nextR={nextR}/>
          </>
        )}
      </section>
    </div>
  );
}
export default App;