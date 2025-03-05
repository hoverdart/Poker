import React from "react";

const GameDisplay = (props) => {
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
            <div className={`card mb-3 h-100 ${props.game.winner.id === player.id ? "bg-body-secondary" : player.id === props.game.allPlayers[props.turn].id && props.game.round !== 4 && !props.nextR ? "border border-5 border-primary" : (player.folded || player.isSpectating) ? " border border-3 border-danger" : player.turn==="raise" ? "border border-3 border-success" : player.turn === "call" && "border border-3 border-warning"}`} style={player.isSpectating && {backgroundColor:"#dbafaf"}}>
              <div className="card-body">
                <h5 className="card-title"><strong>Player {player.id + 1} {player.id === props.game.playerID && "You"}</strong></h5>
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
                    <button className={`btn btn-primary btn-sm px-2 me-2 ${(player.id !== props.game.allPlayers[props.turn].id || props.round === 4 || props.nextR || props.game.currentBet !== 0) &&  "disabled"}`} onClick={props.check}>Check</button>
                    <button className={`btn btn-warning btn-sm px-2 me-2 ${(player.id !== props.game.allPlayers[props.turn].id || props.round === 4 || props.nextR) && "disabled"}`} onClick={props.call}>Call</button>
                    <button className={`btn btn-success btn-sm px-2 me-2 ${(player.id !== props.game.allPlayers[props.turn].id || props.round === 4 || props.nextR) && "disabled"}`} onClick={props.raise}>Raise</button>
                    <button className={`btn btn-danger btn-sm px-2 me-2 ${(player.id !== props.game.allPlayers[props.turn].id || props.round === 4 || props.nextR) && "disabled"}`} onClick={props.fold}>Fold</button>
                  </div>
                )}
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
