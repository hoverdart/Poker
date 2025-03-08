import { useState } from "react";

const GameForm = (props) => {
    //Important States for the GameForm values
    const [playerCount, setPlayerCount] = useState(2);
    const [smallAmt, setSmall] = useState();
    const [largeAmt, setLarge] = useState();
    const [money, setMoney] = useState();

    // Submit function for the form
    function submit(){
        props.onSubmit(playerCount,smallAmt,largeAmt,money);
    }
    //Checks if the form is ready to submit or not, and undisables the button if it is.
    const isFormValid = playerCount >= 2 && smallAmt > 0 && largeAmt > 0 && money > 0;
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
                    {largeAmt < smallAmt && <div className="text-danger fw-bold">⚠ Small Blind Must Be Smaller than the Large Blind.</div>}
                </div>
            
                <div className="col mb-2">
                    <label htmlFor="largeBlind" className="form-label fw-bold">Large Blind</label>
                    <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input type="number" className="form-control" id="largeBlind" placeholder="Enter amount" value={largeAmt} onChange={(e)=> {setLarge(e.target.valueAsNumber)}} />
                    </div>
                    {largeAmt <= 0 && <div className="text-danger">⚠ Must be greater than $0.</div>}
                    {largeAmt < smallAmt && <div className="text-danger">⚠ Large Blind Must Be Larger than the Small Blind.</div>}
                </div>

                <div className="col mb-2">
                <label htmlFor="startingMoney" className="form-label fw-bold">Starting Money</label>
                    <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input type="number" className="form-control" id="startingMoney" placeholder="Enter amount" value={money} onChange={(e)=> {setMoney(e.target.valueAsNumber)}}/>
                    </div>
                    {money <= 0 && <div className="text-danger fw-bold">⚠ Must be greater than $0.</div>}
                </div>
            </div>

            <div className="text-center">
                <button className="btn btn-outline-primary btn-md" data-bs-toggle="btn btn-primary" disabled={!isFormValid} onClick={()=> {submit()}}>Start Game</button>
            </div>
        </div>
    );
};

export default GameForm;
