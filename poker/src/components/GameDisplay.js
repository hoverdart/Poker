const GameDisplay = (props) => {
    return (
        <div className="container mt-4 p-3 bg-light shadow rounded">
          <h3><strong>Game {props.gameNum}</strong>: Round {props.round}</h3>
          <div>
            <p><strong>Players:</strong> {props.game.players}</p>
            <p><strong>Small Blind:</strong> ${props.game.small}</p>
            <p><strong>Big Blind:</strong> ${props.game.big}</p>
            <p><strong>Starting Money:</strong> ${props.game.startingMoney}</p>
            <p><strong>Community Cards:</strong> 
            {props.game.boardCards.length > 0 ? props.game.boardCards.map((card, index) => ( <span key={index}> {card.name} {card.symbol}{index !== props.game.boardCards.length-1 && ", "} </span>)): " None"}
            </p>

            {/* Loop through all players and display their details */}
            <div className="mt-3 bg-light-emphasis">
              {props.game.allPlayers.map((player) => (
              <div key={player.id} className="border border-3 p-2 mb-2 rounded">
                <p><strong>Player {player.id+1}</strong></p>
                {player.playerBlind !== "" && <p><strong>Blind:</strong> {player.playerBlind}</p>}
                <p><strong>Money:</strong> ${player.playerMoney}</p>

                <p><strong>Hand:</strong>  
                {player.playerHand.map((card, index) => (
                  <span key={index}> {card.name} {card.symbol}{index===0 && ", "}</span>
                 ))}
                </p>
                
                <p><strong>Hand Type:</strong> {player.handType}</p>

              </div>
              ))}
            </div>
            {props.game.round === 4 && <p><strong>Player {props.game.winner.id+1} Wins! </strong></p>}
            {props.game.round !== 4 ? <button className="btn btn-primary mt-2 mx-2" onClick={props.handleNextRound}>Next Round</button> : <button className="btn btn-danger mt-2 mx-2" onClick={props.handleNextGame}>Next Game</button>}            
          </div>
        </div>

    );
}
 // <GameDisplay gameNum={gameNum} rounds={rounds} game={game} handleNextRound={handleNextRound} handleNextGame={handleNextGame} />
export default GameDisplay;