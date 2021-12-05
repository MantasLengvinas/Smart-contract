import React, {Component} from "react";

class BetCard extends Component {
    constructor() {
        super();
    }

    render() {

        return (
            <div className="betCard">
                <div className="betCardBody">
                    <h5>Title</h5>
                    <h6>Betting phase duration:  seconds</h6>
                    <h6>Voting phase duration:  seconds</h6>
                    <h6>Vote amount:  ETH</h6>
                    <h6>Minimum amount of betters: </h6>
                    <h6>Current state: </h6>
                    <p>Betters for: </p>
                    <p>Betters against: </p>
                    <p>Voters for: </p>
                    <p>Voters against: </p>
                </div>
            </div>
        );
    }
}

export default BetCard;