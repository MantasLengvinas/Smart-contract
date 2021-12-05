import './App.css';
import React, {Component} from "react";
import Header from './components/Header'
import BetCard from './components/BetCard'
import AddBet from './components/AddBet'
import betsSVG from './photos/Bets.svg';
import actionsSVG from './photos/Actions.svg';

class App extends Component {
  constructor(props) {
    super(props);

    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleModalHide = this.handleModalHide.bind(this);

    this.state = {
      showModal: false
    }
  }

  handleModalShow() {
    this.setState({showModal: true});
  }

  handleModalHide() {
    this.setState({showModal: false});
  }

  render() {
    return (
      <div className="App">
        <Header />
        <AddBet
            showModal={this.state.showModal}
            handleModalHide={this.handleModalHide}
        />
        <div className="main">
          <div className="side-menu">
          <img src={actionsSVG} alt="Actions" width="300px" height="50px" srcset="" />
            <button onClick={() => this.handleModalShow()} className="btn" style={{margin: "5px"}}>
                Add bet
            </button>
            <button className="btn" style={{margin: "5px"}}>
                Refresh
            </button>
          </div>
          <div className="bets-container">
            <img src={betsSVG} alt="BETS" width="20%" height="70px" style={{alignSelf: "left"}} srcset="" />
            <div className="bets">
              <BetCard />
              <BetCard />
            </div>
          </div>
        </div>
      </div>
    )
  };
}

export default App;
