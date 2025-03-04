import React from "react";

const GameDisplay = (props) => {
  return (
    <div className="container mt-4 p-4 bg-light shadow-lg rounded">
      <h3 className="mb-3">
        <strong>Game {props.gameNum}</strong>: Round {props.round}
      </h3>

      {/* Game Information Table */}
      <table className="table table-bordered">
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
          <tr>
            <td><strong>Starting Money:</strong></td>
            <td>${props.game.startingMoney}</td>
          </tr>
          <tr>
            <td><strong>Current Pot:</strong></td>
            <td>${props.game.pot}</td>
          </tr>
        </tbody>
      </table>

      {/* Community Cards */}
      <div className="mb-3">
        <strong>Community Cards:</strong>{" "}
        {props.game.boardCards.length > 0 ? (
          props.game.boardCards.map((card, index) => (
            <span key={index} className={`badge mx-1 ${card.symbol === "♦" || card.symbol === "♥" ? "bg-danger" : "bg-secondary"}`}>
              {card.name} {card.symbol}
            </span>
          ))
        ) : (
          <span className="text-muted">None</span>
        )}
      </div>

      {/* Players Section */}
      <div className="row">
        {props.game.allPlayers.map((player) => (
          <div key={player.id} className="col-md-6">
            <div className="card mb-3 h-100">
              <div className="card-body">
                <h5 className="card-title"><strong>Player {player.id + 1}</strong></h5>
                {player.playerBlind && (
                  <p className="card-text"><strong>Blind:</strong> {player.playerBlind}</p>
                )}
                <p className="card-text"><strong>Money:</strong> ${player.playerMoney}</p>

                <p className="card-text">
                  <strong>Hand:</strong>{" "}
                  {player.playerHand.map((card, index) => (
                    <span key={index} className={`badge mx-1 ${card.symbol === "♦" || card.symbol === "♥" ? "bg-danger" : "bg-secondary"}`}>
                      {card.name} {card.symbol}
                    </span>
                  ))}
                </p>

                <p className="card-text">
                  <strong>Hand Type:</strong> {player.handType}
                </p>

                {/* Player Actions */}
                {player.id === props.game.playerID && (
                  <div className="btn-group mt-2">
                    <button className="btn btn-primary px-2 me-2">Check</button>
                    <button className="btn btn-warning px-2 me-2">Call</button>
                    <button className="btn btn-success px-2 me-2">Raise</button>
                    <button className="btn btn-danger px-2 me-2">Fold</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Game Control Buttons */}
      {props.game.round === 4 ? (
        <p className="mt-3"><strong>Player {props.game.winner.id + 1} Wins!</strong></p>
      ) : null}

      <button
        className={`btn mt-3 mx-2 ${props.game.round === 4 ? "btn-danger" : "btn-primary"}`}
        onClick={props.game.round === 4 ? props.handleNextGame : props.handleNextRound}
      >
        {props.game.round === 4 ? "Next Game" : "Next Round"}
      </button>
    </div>
  );
};

export default GameDisplay;
