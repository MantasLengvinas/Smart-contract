import React, {Component} from "react";
import logo from '../photos/BET_Logo.svg';

class Header extends Component {
    render() {
        return (
            <div className="App-header">
                <div className="logo">
                    <img src={logo} alt="bet" width="100px" height="65px" />
                </div>  
                <div className="balance">
                    <span>Account balance: <i>{this.props.balance}</i> ETH</span>
                </div>
            </div>
        );
    }
}

export default Header;