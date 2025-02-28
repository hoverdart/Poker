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
    this.round = 1;
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
  }

  nextRound() {
    this.round++;
    for (let i = 0; i < this.allPlayers.length; i++) {
      if (this.allPlayers[i].playerBlind === "small") {
        this.allPlayers[i].playerBlind = "";
        if (i < this.allPlayers.length - 2) {
          this.allPlayers[i + 1].playerBlind = "small";
          this.allPlayers[i + 2].playerBlind = "big";
        } else if (i === this.allPlayers.length - 1) {
          this.allPlayers[0].playerBlind = "big";
          this.allPlayers[i + 1].playerBlind = "small";
        } else {
          this.allPlayers[0].playerBlind = "small";
          this.allPlayers[1].playerBlind = "big";
        }
        break;
      }
    }
    this.deck.fullDeck.shift(); // Burn a card
    for (let i = 0; i < this.allPlayers.length; i++) {
      if (this.allPlayers[i].playerBlind === "small") {
        this.allPlayers[i].playerMoney -= this.small;
        if (i === this.allPlayers.length - 1) {
          this.allPlayers[0].playerMoney -= this.big;
        } else {
          this.allPlayers[i + 1].playerMoney -= this.big;
        }
      }
    }
    if (this.round === 2) {
      this.boardCards = this.deck.fullDeck.splice(0, 3);
    }
  }

  print() {
    console.log("Players Info:", this.allPlayers);
  }
}

function App() {
  const [game, setGame] = useState(null);
  const [round, setRound] = useState(1);
  
  function initializeValues(playerCt, smallAmt, largeAmt, money) {
    console.log("Initializing game...");
    const newGame = new Game();
    newGame.start(playerCt, smallAmt, largeAmt, money);
    setGame(newGame);
    setRound(1);
  }
  function handleNextRound() {
    if (game) {
      game.nextRound();
      setGame(game);
      setRound(game.round);
    }
  }

  return (
    <div className="App">
      <GameForm onSubmit={initializeValues} />
      {game && (
        <div className="container mt-4 p-3 bg-light shadow rounded">
          <h3>Round {round}</h3>
          <p><strong>Players:</strong> {game.players}</p>
          <p><strong>Small Blind:</strong> ${game.small}</p>
          <p><strong>Big Blind:</strong> ${game.big}</p>
          <p><strong>Starting Money:</strong> ${game.startingMoney}</p>
          <button className="btn btn-primary mt-2" onClick={handleNextRound}>Next Round</button>
        </div>
      )}
    </div>
  );
}

export default App;
