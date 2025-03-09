import React from "react";
import Modal from 'react-bootstrap/Modal';
import {useState} from "react";


const GameDisplay = (props) => {
  //Modal Vars
  const [show, setShow] = useState(false); //Handles opening/closing modal
  const [money, setMoney] = useState("");

  return (
    <div className="container mt-4 p-4 bg-light shadow-lg rounded">
      <h2 className="mb-3">
        <strong>Game {props.gameNum}</strong>: Round {props.round}
      </h2>

      {/* Game Information Table */}
      <table className="table table-sm table-bordered">
        <tbody>
          <tr>
            <td><strong>Players:</strong></td>
            <td>{props.game.players}</td>
          </tr>
          <tr>
            <td><strong>Small Blind:</strong></td>
            <td>${props.game.small}</td>
          </tr>
          <tr>
            <td><strong>Big Blind:</strong></td>
            <td>${props.game.big}</td>
          </tr>
        </tbody>
        
      </table>

      {/* Community Cards and Current Bet */}
      <div className="mb-3 fs-3">
        <strong>Community Cards:</strong>{" "}
        {props.game.boardCards.length > 0 ? (
          props.game.boardCards.map((card, index) => (
            <span key={index} className={`badge mx-1 ${card.symbol === "♦" || card.symbol === "♥" ? "bg-danger" : "bg-secondary"}`}>
              {card.name} {card.symbol}
            </span>))) : (<span className="text-muted">None</span>)}    
      </div>

      <div className="mb-3 fs-4">
        <span><strong>Current Pot: <span className="text-success">${props.game.pot} </span></strong></span>    <span><strong>| Current Bet: <span className="text-success">${props.game.currentBet} </span></strong></span>
      </div>
      {/* Players Section */}
      <div className="row">
        {props.game.allPlayers.map((player) => (
          <div key={player.id} className="col-md-6 my-2">
            <div className={`card mb-3 h-100 rounded-3 ${props.game.winner.id === player.id ? "bg-body-secondary" : player.id === props.game.activePlayers[props.turn].id && props.game.round !== 4 && !props.nextR ? "border border-5 border-info" : (player.folded || player.isSpectating) ? " border border-3 border-danger" : player.turn==="raise" ? "border border-3 border-success" : player.turn === "call" && "border border-3 border-warning"}`} style={player.isSpectating ? {backgroundColor:"rgb(219, 175, 175)"}:{}}>
              <div className="card-body">
                <h5 className="card-title"><strong>Player {player.id + 1} {player.id === props.game.playerID && "(You)"}</strong></h5>
                <p className="card-text"><strong>Money:</strong> ${player.playerMoney}</p>
                <p className="card-text"><strong>Money In:</strong> ${player.moneyIn}</p>
                <p className="card-text">
                  <strong>Hand:</strong>{" "}
                  {player.playerHand.map((card, index) => (
                    <span key={index} className={`badge mx-1 ${card.symbol === "♦" || card.symbol === "♥" ? "bg-danger" : "bg-secondary"}`}>
                      {card.name} {card.symbol}
                    </span>))}
                </p>
                <p className="card-text">
                  <strong>Hand Type:</strong> {player.handType}
                </p>
                {/* Player Actions - Disabled when not their turn/is round 4/time for next round*/}
                {player.id === props.game.playerID && (
                  <div className="btn-group mt-2">
                    <button className={`btn btn-primary btn-sm px-2 me-2 ${(player.id !== props.game.activePlayers[props.turn].id || props.round === 4 || props.nextR || props.game.currentBet !== 0) &&  "disabled"}`} onClick={props.check}>Check</button>
                    <button className={`btn btn-warning btn-sm px-2 me-2 ${(player.id !== props.game.activePlayers[props.turn].id || props.round === 4 || props.nextR || props.game.currentBet === 0) && "disabled"}`} onClick={props.call}>Call</button>
                    <button className={`btn btn-success btn-sm px-2 me-2 ${(player.id !== props.game.activePlayers[props.turn].id || props.round === 4 || props.nextR || player.playerMoney === 0) && "disabled"}`} onClick={() => setShow(true)}>Raise</button>
                    <button className={`btn btn-danger btn-sm px-2 me-2 ${(player.id !== props.game.activePlayers[props.turn].id || props.round === 4 || props.nextR) && "disabled"}`} onClick={props.fold}>Fold</button>
                  </div>
                )}

                {props.game.allPlayers[props.game.playerID].playerMoney && 
                <Modal show={show} onHide={() => setShow(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">💰 Raise Your Bet</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="mb-3">
                      <h5 className="mb-1">Your Money: <strong className="text-success">${props.game.allPlayers[props.game.playerID].playerMoney}</strong></h5>
                      <h5 className="mb-1">Money In: <strong className="text-primary">${props.game.allPlayers[props.game.playerID].moneyIn}</strong></h5>
                      <h5>Current Bet: <strong className="text-warning">${props.game.currentBet}</strong></h5>
                    </div>
                    <label htmlFor="raiseAmount" className="form-label fw-bold">Raise Amount</label>
                    <div className="input-group">
                      <span className="input-group-text bg-secondary text-light">$</span>
                      <input type="number" className="form-control" id="raiseAmount" placeholder="Enter amount" value={money} onChange={(e) => setMoney(e.target.valueAsNumber)}/>
                    </div>
                    <div className="mt-2">
                      {money <= 0 && <div className="text-danger fw-bold">⚠ Must be greater than $0.</div>}
                      {money > props.game.allPlayers[props.game.playerID].playerMoney && (<div className="text-danger fw-bold">⚠ Cannot exceed current money.</div>)}
                      {money <= props.game.allPlayers[props.game.playerID].playerMoney && money > 0 && (
                        <div className="alert alert-info mt-2">
                          <strong>New Stats:</strong>
                          <br /> Loss: <strong>${props.game.currentBet + money - props.game.allPlayers[props.game.playerID].moneyIn}</strong>
                          <br /> New Balance: <strong>${props.game.allPlayers[props.game.playerID].playerMoney - (props.game.currentBet + money - props.game.allPlayers[props.game.playerID].moneyIn)}</strong>
                          <br /> New Bet: <strong>${props.game.currentBet + money}</strong>
                        </div>)}
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <button className="btn btn-outline-secondary" onClick={() => setShow(false)}>Cancel</button>
                    <button className="btn btn-success" onClick={() => {props.raise(money);setMoney(0);setShow(false);}} disabled={money <= 0 || money > props.game.allPlayers[props.game.playerID].playerMoney}>
                      Raise!
                    </button>
                  </Modal.Footer>
                </Modal> 
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Game Control Buttons */}
      {props.game.round === 4 ? (
        <p className="mt-3 fs-3"><strong>Player {props.game.winner.id + 1} Wins!</strong></p>) : null}
      <button className={`btn mt-3 mx-2 ${props.game.round === 4 ? "btn-danger" : "btn-primary"} ${(!props.nextR && props.game.round!==4) && " disabled"}`} onClick={props.game.round === 4 ? props.handleNextGame : props.handleNextRound}>
        {props.game.round === 4 ? "Next Game" : "Next Round"}
      </button>
    </div>
  );
};

export default GameDisplay;
