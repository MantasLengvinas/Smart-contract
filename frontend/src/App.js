import './App.css';
import Header from './components/Header'
import BetCard from './components/BetCard'

function App() {
  return (
    <div className="App">
      <Header />
      <div className="main">
        <div className="side-menu">
          <h4>
            Actions
          </h4>
          <button className="btn" style={{margin: "5px"}}>
              Add bet
          </button>
          <button className="btn" style={{margin: "5px"}}>
              Refresh
          </button>
        </div>
        <div className="bets-container">
          <h2>
            Bets
          </h2>
          <div className="bets">
            <BetCard />
            <BetCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
