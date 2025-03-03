import { useState } from "react";
import GameForm from "./components/GameForm";

class Card {
  constructor(suit, value) {
    this.suit = suit;
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
    this.nextGame() // this will move the small/big blinds, make the ppl pay for them, and add to the starting pot.
  }

  nextGame() { // essentially start of a new game; this should be run directly after "start" to get to the "preflop" stage
    this.game +=1;
    this.round = 1;
    this.deck = new Deck(); // Deck is reset
    this.deck.shuffle(); // Cards reshuffled
    this.boardCards = [] //Board Cards Set to NADA

    for (let i = 0; i < this.players; i++) { // Player's decks are remade
      this.allPlayers[i].playerHand = [this.deck.fullDeck.shift(), this.deck.fullDeck.shift()];
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
    }else if(this.round === 3 || this.round === 4){
      this.boardCards.push(this.deck.fullDeck.splice(0, 1)[0]);
    }
    this.print()
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
    console.log("Initializing game...");
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
      {game && (
        <div className="container mt-4 p-3 bg-light shadow rounded">
          <h3><strong>Game {gameNum}</strong>: Round {round}</h3>
          <div>
            <p><strong>Players:</strong> {game.players}</p>
            <p><strong>Small Blind:</strong> ${game.small}</p>
            <p><strong>Big Blind:</strong> ${game.big}</p>
            <p><strong>Starting Money:</strong> ${game.startingMoney}</p>
            <p><strong>Community Cards:</strong> 
            {game.boardCards.length > 0 ? game.boardCards.map((card, index) => ( <span key={index}> {card.name} of {card.suit}{index !== game.boardCards.length-1 && ", "} </span>)): " None"}
            </p>

            {/* Loop through all players and display their details */}
            <div className="mt-3 bg-light-emphasis">
              {game.allPlayers.map((player) => (
              <div key={player.id} className="border border-3 p-2 mb-2 rounded">
                <p><strong>Player {player.id+1}</strong></p>
                {player.playerBlind !== "" && <p><strong>Blind:</strong> {player.playerBlind}</p>}
                <p><strong>Money:</strong> ${player.playerMoney}</p>

                <p><strong>Hand:</strong>  
                {player.playerHand.map((card, index) => (
                  <span key={index}> {card.name} of {card.suit}{index===0 && ", "}</span>
                 ))}
                </p>

              </div>
              ))}
            </div>
            {game.round !== 4 ? <button className="btn btn-primary mt-2 mx-2" onClick={handleNextRound}>Next Round</button> : <button className="btn btn-danger mt-2 mx-2" onClick={handleNextGame}>Next Game</button>}            
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
