import React, {Component} from "react";
import Contract from "../contracts/Bet";

class BetCard extends Component {
    constructor() {
        super();

        this.state = {
            bet: {
                description: null,
                betTimeLeft: 0
            },
            betTimeLeft: 0
        }
    }

    componentDidMount() {
        const {
            betIndex, contract, web3, deployedNetwork
        } = this.props;

        this.getBet(betIndex, contract, web3, deployedNetwork).then(result => this.setState({
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
            expirationTime: await betContract.methods.expirationTime().call(),
            bettersForCount: await betContract.methods.getBettersForCount().call(),
            bettersAgainstCount: await betContract.methods.getBettersAgainstCount().call(),
        };

        bet.totalBetters = parseInt(bet.bettersForCount) + parseInt(bet.bettersAgainstCount);

        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - bet.deployTime >= bet.waitingTime) bet.state = 1;
        else if ((currentTime - bet.deployTime) >= bet.expirationTime) bet.state = 5;

        bet.betTimeLeft = parseInt(bet.expirationTime) - (currentTime - bet.deployTime);
        this.betTimer();
        return bet;
    };

    bettingState = (state) => {
        console.log("status: ", state);

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
                return "Finished";
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

    betTimer = () => {
        const currentTime = Math.floor(Date.now() / 1000);
        setInterval(() => {
            let prevSec = this.state.bet.betTimeLeft;
            this.setState(prevState => ({
                bet: {                   
                    ...prevState.bet,    
                    betTimeLeft: prevSec - 1       
                }
            }))

            if (currentTime - this.state.bet.deployTime >= this.state.bet.waitingTime){
                this.setState(prevState => ({
                    bet: {                   
                        ...prevState.bet,    
                        state: 1      
                    }
                }))
            }
            if(prevSec <= 0){
                this.setState(prevState => ({
                    bet: {                   
                        ...prevState.bet,    
                        state: 5      
                    }
                }))
            }
        }, 1000)
    }

    render() {

        const { bet } = this.state;

        return (
            <div key={this.props.betIndex} className={"betCard " + this.betStatus(bet.state)}>
                <div className="betCardBody">
                    <h5>{bet.description}</h5>
                    <h6>Current state: {this.bettingState(bet.state)}</h6>
                    <h6>Bet ends in: {bet.betTimeLeft > 0 ? bet.betTimeLeft + " s" : "-"} </h6>
                    <h6>Vote price: {bet.votePrice} ETH</h6>
                    <h6>Minimum amount of betters: </h6>
                    <p>Betters for: {bet.totalBetters > 0 ? bet.bettersForCount * 100 / bet.totalBetters : 0} %</p>
                    <p>Betters against: {bet.totalBetters ? bet.bettersAgainstCount * 100 / bet.totalBetters : 0} %</p>
                    <p>Voters for: </p>
                    <p>Voters against: </p>
                </div>
            </div>
        );
    }
}

export default BetCard;