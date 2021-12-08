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
        //this.getBet(betIndex, contract, web3, deployedNetwork).then(console.log);

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

        bet.totalVoters = parseInt(bet.votersForCount) + parseInt(bet.votersAgainstCount);
        bet.totalBetters = parseInt(bet.bettersForCount) + parseInt(bet.bettersAgainstCount);

        const currentTime = Math.floor(Date.now() / 1000);

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
                return "Betters for are the winners";
            case 3:
                return "Betters against are the winners";
            case 4:
                return "Bet aborted";
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
        let t = setInterval(() => {
            let prevSec = this.state.bet.betTimeLeft;
            const currentTime = Math.floor(Date.now() / 1000);
            this.setState(prevState => ({
                bet: {                   
                    ...prevState.bet,    
                    betTimeLeft: prevSec - 1       
                }
            }))
            
            if (currentTime - this.state.bet.deployTime >= this.state.bet.waitingTime && currentTime - this.state.bet.deployTime < this.state.bet.expirationTime){
                this.setState(prevState => ({
                    bet: {                   
                        ...prevState.bet,    
                        state: 1      
                    }
                }))
            }
            if(prevSec <= 0){
                clearInterval(t);
                if(this.state.bet.state < 2)
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
        const { accounts, web3 } = this.props;
        const voteAmount = web3.utils.toWei(bet.votePrice, 'ether');

        bet.betContract.methods.betFor(voteAmount).send({from: accounts[0], value: voteAmount});        
    }

    betAgainst(bet) {
        const { accounts, web3 } = this.props;
        const voteAmount = web3.utils.toWei(bet.votePrice, 'ether');

        bet.betContract.methods.betAgainst(voteAmount).send({from: accounts[0], value: voteAmount});
    }

    voteFor(bet) {
        const { accounts } = this.props;

        bet.betContract.methods.voteFor().send({from: accounts[0]});
    }

    voteAgainst(bet) {
        const { accounts } = this.props;

        bet.betContract.methods.voteAgainst().send({from: accounts[0]});

    }

    claim(bet) {
        const { accounts } = this.props;
        bet.betContract.methods.claim().send({from: accounts[0]});
        window.location.reload(true);
    }

    render() {

        const { bet } = this.state;

        if(bet.description == null){
            return (
                <div key={this.props.betIndex} className={"betCard " + this.betStatus(bet.state)}>
                    <div className="betCardBody">
                        <h5>Bet info is loading..</h5>
                    </div>
                </div>
            );
        }
        else{
            return (
                <div key={this.props.betIndex} className={"betCard " + this.betStatus(bet.state)}>
                    <div className="betCardBody">
                        <h5>{bet.description}</h5>
                        <h6>{bet.state <= 1 ? "Current state: " : null}{this.bettingState(bet.state)}</h6>
                        <h6>Time left: {bet.betTimeLeft > 0 ? bet.betTimeLeft + " s" : "-"} </h6>
                        <h6>Vote price: {bet.votePrice} ETH</h6>
                        <h6>{bet.state > 1 ? "Rewards left: " : "Total betted: "}{bet.totalBetted} ETH</h6>
                        <h6>Minimum amount of betters: {bet.minBetterCount}</h6>
                        <p>Betters for: {bet.totalBetters > 0 ? (bet.bettersForCount * 100 / bet.totalBetters).toFixed(2) : 0} %</p>
                        <p>Betters against: {bet.totalBetters ? (bet.bettersAgainstCount * 100 / bet.totalBetters).toFixed(2) : 0} %</p>
                        <p>Voters for: {bet.totalVoters > 0 ? (bet.votersForCount * 100 / bet.totalVoters).toFixed(2) : 0} %</p>
                        <p>Voters against: {bet.totalVoters > 0 ? (bet.votersAgainstCount * 100 / bet.totalVoters).toFixed(2) : 0} % </p>
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
                            <button onClick={() => this.voteFor(bet)} className="btn" style={{margin: "5px", display: "inline-block"}}>
                                Vote for
                            </button> 
                            <button onClick={() => this.voteAgainst(bet)} className="btn" style={{margin: "5px", display: "inline-block"}}>
                                Vote against
                            </button>
                        </> : <></>}
                        {bet.state > 1 && bet.state != 4 ?
                        <>
                            <button onClick={() => this.claim(bet)} className="btn" style={{margin: "5px", display: "inline-block"}}>
                                Claim
                            </button> 
                        </> : <></>}
                    </div>
                </div>
            );
        }
    }
}

export default BetCard;