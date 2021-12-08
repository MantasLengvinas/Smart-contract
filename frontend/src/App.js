import './App.css';
import React, {Component} from "react";
import Header from './components/Header'
import BetCard from './components/BetCard'
import AddBet from './components/AddBet'
import betsSVG from './photos/Bets.svg';
import actionsSVG from './photos/Actions.svg';

import getWeb3 from "./utility/getWeb3";
import Contract from "./contracts/Bets"

class App extends Component {
  constructor(props) {
    super(props);

    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleModalHide = this.handleModalHide.bind(this);

    this.state = {
      showModal: false,
      accounts: null,
      contract: null,
      web3: null,
      deployedNetwork: null,
      bets: 0,
      accountBalance: 0
    }
  }

  componentDidMount = async () => {
    try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        const deployedNetwork = Contract.networks[5777];

        const instance = new web3.eth.Contract(
          Contract.abi,
            deployedNetwork && deployedNetwork.address
        );

        web3.eth.getBalance(accounts[0]).then(result => this.setState({
          accountBalance: web3.utils.fromWei(result, "ether")
        }));

        this.setState({accounts, contract: instance, web3, deployedNetwork, bets: 0});
    } catch (error) {
        alert(
            `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
    }

    this.getBetsCount();

  };

  handleModalShow() {
    this.setState({showModal: true});
  }

  handleModalHide() {
    this.setState({showModal: false});
  }

  addBet = async (description, betPrice, waitingTime, expirationTime, minBetterCount) => {
    let { contract, accounts, web3 } = this.state;
    let betAmount = web3.utils.toWei(betPrice, 'ether');
    await contract.methods.createBet(description, betAmount, waitingTime, expirationTime, minBetterCount).send({ from: accounts[0] });
    this.getBetsCount();
  };

  handleFormSubmit = (newBet) => {
    this.addBet(newBet.desc, newBet.betPrice, newBet.bettingTime, parseInt(newBet.bettingTime)+parseInt(newBet.votingTime), newBet.minBetterCount);
    this.setState({showModal: false});
  };

  getBetsCount = async () => {
    const { contract } = this.state;
    let count = await contract.methods.getBetsCount().call();
    this.setState({ bets: count });
  };

  render() {

    if (!this.state.web3) {
      return <div>Loading data</div>;
    }

    let betCards = [];
        for (let i = 0; i < this.state.bets; i++)
        {
            betCards.push(
                <BetCard
                    betIndex={i}
                    contract={this.state.contract}
                    web3={this.state.web3}
                    deployedNetwork={this.state.deployedNetwork}
                    accounts={this.state.accounts}
                />
            );
        }

    return (
      <div className="App">
        <Header balance={this.state.accountBalance} />
        <AddBet
            showModal={this.state.showModal}
            handleModalHide={this.handleModalHide}
            handleFormSubmit={this.handleFormSubmit}
        />
        <div className="main">
          <div className="side-menu">
          <img src={actionsSVG} alt="Actions" width="300px" height="50px" srcset="" />
            <button onClick={() => this.handleModalShow()} className="btn" style={{margin: "5px"}}>
                Add bet
            </button>
          </div>
          <div className="bets-container">
            <img src={betsSVG} alt="BETS" width="20%" height="70px" style={{alignSelf: "left"}} srcset="" />
            <div className="bets">
              {betCards}
            </div>
          </div>
        </div>
      </div>
    )
  };
}

export default App;
