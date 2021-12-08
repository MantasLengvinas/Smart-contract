import React, {Component} from "react";
import Contract from "../contracts/Bet";

class BetCard extends Component {
    constructor() {
        super();

        this.state = {
            bet: {
                description: null,
                betTimeLeft: 0
            }
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
            totalBetted: web3.utils.fromWei(await betContract.methods.getBalance().call(), 'ether'),
            deployTime: await betContract.methods.deployTime().call(),
            waitingTime: await betContract.methods.waitingTime().call(),
            expirationTime: await betContract.methods.expirationTime().call(),
            minBetterCount: await betContract.methods.minBetterCount().call(),
            bettersForCount: await betContract.methods.getBettersForCount().call(),
            bettersAgainstCount: await betContract.methods.getBettersAgainstCount().call(),
            votersForCount: await betContract.methods.votersForCount().call(),
            votersAgainstCount: await betContract.methods.votersAgainstCount().call()
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
        setInterval(() => {
            let prevSec = this.state.bet.betTimeLeft;
            const currentTime = Math.floor(Date.now() / 1000);
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

    betFor(bet) {
        const { accounts, betIndex, contract, web3, deployedNetwork } = this.props;
        const voteAmount = web3.utils.toWei(bet.votePrice, 'ether');

        bet.betContract.methods.betFor(voteAmount).send({from: accounts[0], value: voteAmount});
        this.getBet(betIndex, contract, web3, deployedNetwork).then(result => this.setState({
            bet: result
        }));
        
    }

    betAgainst(bet) {
        const { accounts, betIndex, contract, web3, deployedNetwork } = this.props;
        const voteAmount = web3.utils.toWei(bet.votePrice, 'ether');

        bet.betContract.methods.betAgainst(voteAmount).send({from: accounts[0], value: voteAmount});
        this.getBet(betIndex, contract, web3, deployedNetwork).then(result => this.setState({
            bet: result
        }));
    }

    render() {

        const { bet } = this.state;

        return (
            <div key={this.props.betIndex} className={"betCard " + this.betStatus(bet.state)}>
                <div className="betCardBody">
                    <h5>{bet.description}</h5>
                    <h6>Current state: {this.bettingState(bet.state)}</h6>
                    <h6>Time left: {bet.betTimeLeft > 0 ? bet.betTimeLeft + " s" : "-"} </h6>
                    <h6>Vote price: {bet.votePrice} ETH</h6>
                    <h6>Total betted: {bet.totalBetted} ETH</h6>
                    <h6>Minimum amount of betters: {bet.minBetterCount}</h6>
                    <p>Betters for: {bet.totalBetters > 0 ? (bet.bettersForCount * 100 / bet.totalBetters).toFixed(2) : 0} %</p>
                    <p>Betters against: {bet.totalBetters ? (bet.bettersAgainstCount * 100 / bet.totalBetters).toFixed(2) : 0} %</p>
                    <p>Voters for: </p>
                    <p>Voters against: </p>
                    {bet.state == 0 ? 
                    <>
                        <button onClick={() => this.betFor(bet)} className="btn" style={{margin: "5px", display: "inline-block"}}>
                            Bet for
                        </button> 
                        <button onClick={() => this.betAgainst(bet)} className="btn" style={{margin: "5px", display: "inline-block"}}>
                            Bet against
                        </button>
                    </> : <></>}
                    {bet.state == 1 ?
                    <>
                        <button className="btn" style={{margin: "5px", display: "inline-block"}}>
                            Vote for
                        </button> 
                        <button className="btn" style={{margin: "5px", display: "inline-block"}}>
                            Vote against
                        </button>
                    </> : <></>}
                    {bet.state == 5 ?
                    <>
                        <button className="btn" style={{margin: "5px", display: "inline-block"}}>
                            Claim
                        </button> 
                    </> : <></>}
                </div>
            </div>
        );
    }
}

export default BetCard;