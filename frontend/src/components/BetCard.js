import React, {Component, useEffect} from "react";
import Contract from "../contracts/Bet";

class BetCard extends Component {
    constructor() {
        super();

        this.state = {
            bet: {
                description: null
            },
            betTimeLeft: 0
        }
    }

    componentDidMount() {
        const {
            betIndex, contract, web3, deployedNetwork
        } = this.props;

        const bet = this.getBet(betIndex, contract, web3, deployedNetwork).then(result => this.setState({
            bet: result
        }));
    }

    getBet = async (index, contract, web3, deployedNetwork) => {
        let betAddress = await contract.methods.bets(index).call();
        const betContract = new web3.eth.Contract(
            Contract.abi,
            deployedNetwork && betAddress
        );
        let bet = {
            betContract: betContract,
            description: await betContract.methods.description().call(),
            state: parseInt(await betContract.methods.getState().call()),
            votePrice: web3.utils.fromWei(await betContract.methods.votePrice().call(), 'ether'),
            deployTime: await betContract.methods.deployTime().call(),
            waitingTime: await betContract.methods.waitingTime().call(),
            expirationTime: await betContract.methods.expirationTime().call()
        };

        let date = new Date(bet.deployTime * 1000)
        bet.deployDate = date.getFullYear()+
            "/"+(date.getMonth()+1)+
            "/"+date.getDate()+
            " "+date.getHours()+
            ":"+date.getMinutes()+
            ":"+date.getSeconds()
        
        date.setSeconds(date.getSeconds() + parseInt(bet.expirationTime))

        bet.expirationDate = date.getFullYear()+
        "/"+(date.getMonth()+1)+
        "/"+date.getDate()+
        " "+date.getHours()+
        ":"+date.getMinutes()+
        ":"+date.getSeconds()

        const currentTime = Math.floor(Date.now() / 1000);
        if (bet.state == 0 && currentTime - bet.deployTime >= bet.waitingTime) bet.state = 1;
        else if (bet.state == 1 && currentTime - bet.deployTime >= bet.expirationTime) bet.state = 5;

        return bet;
    };

    startBettingTimer = () => {
        this.betTimeLeft = setInterval(this.bettingCountDown, 1000);
    }

    bettingCountDown = () => {
        let seconds = this.state.bet.waitingTime - 1;
        this.setState({
            betTimeLeft: this.secondsToTime(seconds)
        });
        
        // Check if we're at zero.
        if (seconds == 0) { 
        clearInterval(this.timer);
        }
    }

    bettingState = (state) => {
        switch (state) {
            case 0:
                return "Betting";
            case 1:
                return "Voting";
            case 2:
                return "'For' have won";
            case 3:
                return "'Against' have won";
            case 4:
                return "Bet aborted (not enough voters)";
            case 5:
                return "Voting phase finished";
            default:
                return "Unknown state";
        }
    }

    betStatus = (state) => {
        switch(state){
            case 0:
                return "active";
            case 1: 
                return "active";
            default: 
                return "ended";
        }
    }

    render() {

        const { bet } = this.state;

        return (
            <div key={this.props.index} className={"betCard " + this.betStatus(bet.state)}>
                <div className="betCardBody">
                    <h5>{bet.description}</h5>
                    <h6>Current state: {this.bettingState(bet.state)}</h6>
                    <h6></h6>
                    <h6>Bet ends: {bet.expirationDate}</h6>
                    <h6>Vote price: {bet.votePrice} ETH</h6>
                    <h6>Minimum amount of betters: </h6>
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