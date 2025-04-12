import { useState } from "react";

const GameForm = (props) => {
    //Important States for the GameForm values
    const [playerCount, setPlayerCount] = useState(2);
    const [smallAmt, setSmall] = useState();
    const [aiDifficulty, setDifficulty] = useState(2);
    const [money, setMoney] = useState();

    // Submit function for the form
    function submit(){
        props.onSubmit(playerCount,smallAmt,aiDifficulty,money);
    }
    //Checks if the form is ready to submit or not, and undisables the button if it is.
    const isFormValid = playerCount >= 2 && smallAmt > 0 && money > 0 && (smallAmt*2) <= money;
    return (
        <div className="container-sm p-4 rounded shadow bg-light">
            <h3 className="mb-4 text-center"><strong>Set Up The Game</strong></h3>

            <div className="mb-2">
                <label htmlFor="playerCt" className="form-label fw-bold">Number of Players: {playerCount}</label>
                <input type="range" className="form-range" id="playerCt" min="2" max="10" value={playerCount} onChange={(e) => setPlayerCount(e.target.value)}/>
            </div>
            <div className="row mb-2">
                <div className="col mb-2">
                    <label htmlFor="smallBlind" className="form-label fw-bold">Small Blind</label>
                    <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input type="number" className="form-control" id="smallBlind" placeholder="Enter amount" value={smallAmt} onChange={(e)=> {setSmall(e.target.valueAsNumber)}}/>
                    </div>
                    {smallAmt <= 0 && <div className="text-danger fw-bold">⚠ Must be greater than $0.</div>}
                </div>

                <div className="col mb-2">
                <label htmlFor="startingMoney" className="form-label fw-bold">Starting Money</label>
                    <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input type="number" className="form-control" id="startingMoney" placeholder="Enter amount" value={money} onChange={(e)=> {setMoney(e.target.valueAsNumber)}}/>
                    </div>
                    {money <= 0 && <div className="text-danger fw-bold">⚠ Must be greater than $0.</div>} {money < (smallAmt * 2) && <div className="text-danger fw-bold">⚠ Must be greater than the large blind.</div>}
                </div>

                <div className="col mb-2">
                <label htmlFor="aiDifficulty" className="form-label fw-bold">Set AI Difficulty</label>
                    <div className="input-group">
                        <select className="form-select" aria-label="Selecting AI Difficulty" value={aiDifficulty} onChange={(e) => setDifficulty(e.target.value)}>
                            <option value={1}>Easy</option>
                            <option value={2} selected>Medium</option>
                            <option value={3} >Hard</option>
                            <option value={4}>Impossible</option>
                        </select>
                    </div>
                </div>



            </div>

            <div className="text-center">
                <button className="btn btn-outline-primary btn-md" data-bs-toggle="btn btn-primary" disabled={!isFormValid} onClick={()=> {submit()}}>Start Game</button>
            </div>
        </div>
    );
};

export default GameForm;
