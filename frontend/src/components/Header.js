import React, {Component} from "react";
import logo from '../BET_Logo.svg';

class Header extends Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div className="App-header">
                <img src={logo} alt="" width="100px" height="65px" />
            </div>
        );
    }
}

export default Header;