pragma solidity 0.8.10;

contract Bets{
    address[] public bets;

    address payable public owner;

    constructor() public payable {
        owner = payable(msg.sender);
    }

    function createBet(string memory description, uint256 votePrice, uint256 waitingTime, uint256 expirationTime, uint256 minBetterCount) public returns (address) {
        Bet bet = new Bet(description, votePrice, waitingTime, expirationTime, minBetterCount, owner);
        bets.push(address(bet));
        return address(bet);
    }

    function getBetsCount() external view returns (uint256) {
        return bets.length;
    }
}

contract Bet {
    uint256 public deployTime = block.timestamp;
    
    enum State { Initiated, Pending, ForWon, AgainstWon, Aborted } //Bet states

    address payable private taxAddress;
    uint128 constant tax = 10;
    
    address payable[] private bettersForAddresses;
    mapping (address => bool) private bettersFor;
    function getBettersForCount() external view returns (uint256) {
        return bettersForAddresses.length;
    }
    
    address payable[] private bettersAgainstAddresses;
    mapping (address => bool) private bettersAgainst;
    function getBettersAgainstCount() external view returns (uint256) {
         return bettersAgainstAddresses.length;
    }

    mapping (address => bool) outcomeVoters;
    uint256 outcomeVotersCount;

    uint256 public votersFromForCount;
    uint256 public votersFromAgainstCount;
    uint256 public votersForCount;
    uint256 public votersAgainstCount;

    string public description;
    uint256 public waitingTime;
    uint256 public expirationTime;
    uint256 public votePrice;
    uint256 public minBetterCount;
    
    event BetUpdate (
        uint256 _bettersFor,
        uint256 _bettersAgainst,
        uint256 _votersFor,
        uint256 _votersAgainst
    );
    
    constructor(string memory _description, uint256 _votePrice, uint256 _waitingTime, uint256 _expirationTime, uint256 _minBetterCount, address payable _taxAddress) public {
        description = _description;
        votePrice = _votePrice;
        waitingTime = _waitingTime;
        expirationTime = _expirationTime;
        minBetterCount = _minBetterCount;
        taxAddress = _taxAddress;
    }

    function getState() public view returns (State){
        uint256 timePassed = block.timestamp - deployTime;

        if(timePassed < waitingTime){
            return State.Initiated;
        }
        else if(timePassed >= waitingTime && timePassed < expirationTime){
            return State.Pending;
        }
        else if(timePassed >= expirationTime){
            if(votersForCount > votersAgainstCount){
                return State.ForWon;
            }
            else if(votersForCount < votersAgainstCount){
                return State.AgainstWon;
            }
            else{
                return State.Aborted;
            }
        }
        else{
            return State.Aborted;
        }
    }

    function getBalance() external view returns(uint256) {
        return address(this).balance;
    }

    function betFor(uint256 amount) payable public {
        require(msg.value == amount && msg.value == votePrice);
        require(getState() == State.Initiated);
        require(!bettersFor[msg.sender] && !bettersAgainst[msg.sender]);
        bettersFor[msg.sender] = true;
        bettersForAddresses.push(payable(msg.sender));
        emit BetUpdate(bettersForAddresses.length, bettersAgainstAddresses.length, votersForCount, votersAgainstCount);
    }

    function betAgainst(uint256 amount) payable public {
        require(msg.value == amount && msg.value == votePrice);
        require(getState() == State.Initiated);
        require(!bettersFor[msg.sender] && !bettersAgainst[msg.sender]);
        bettersAgainst[msg.sender] = true;
        bettersAgainstAddresses.push(payable(msg.sender));
        emit BetUpdate(bettersForAddresses.length, bettersAgainstAddresses.length, votersForCount, votersAgainstCount);
    }

    function voteFor() public {
        require((bettersFor[msg.sender] || bettersAgainst[msg.sender]) && !outcomeVoters[msg.sender]);
        require(getState() == State.Pending);
        outcomeVoters[msg.sender] = true;
        outcomeVotersCount++;
        if (bettersFor[msg.sender]) votersFromForCount++;
        if (bettersAgainst[msg.sender]) votersFromAgainstCount++;
        votersForCount++;
        emit BetUpdate(bettersForAddresses.length, bettersAgainstAddresses.length, votersForCount, votersAgainstCount);
    }
    
    function voteAgainst() public {
        require((bettersFor[msg.sender] || bettersAgainst[msg.sender]) && !outcomeVoters[msg.sender]);
        require(getState() == State.Pending);
        outcomeVoters[msg.sender] = true;
        outcomeVotersCount++;
        if (bettersFor[msg.sender]) votersFromForCount++;
        if (bettersAgainst[msg.sender]) votersFromAgainstCount++;
        votersAgainstCount++;
        emit BetUpdate(bettersForAddresses.length, bettersAgainstAddresses.length, votersForCount, votersAgainstCount);
    }

    function claim() public {
        require(address(this).balance > 0);
        State state = getState();
        require (state == State.ForWon || state == State.AgainstWon || state == State.Aborted);
        if (state == State.Aborted) {
            for (uint256 i = 0; i < bettersForAddresses.length; i++) {
                bettersForAddresses[i].transfer(votePrice);
            }
            for (uint256 i = 0; i < bettersAgainstAddresses.length; i++) {
                bettersAgainstAddresses[i].transfer(votePrice);
            }
            taxAddress.transfer(address(this).balance);
        }
        else if (state == State.ForWon) {
            taxAddress.transfer(address(this).balance * tax / 1000);
            uint256 reward = address(this).balance / bettersForAddresses.length;
            for (uint256 i = 0; i < bettersForAddresses.length; i++) {
                bettersForAddresses[i].transfer(reward);
            }
            taxAddress.transfer(address(this).balance);
        }
        else if (state == State.AgainstWon) {
            taxAddress.transfer(address(this).balance * tax / 1000);
            uint256 reward = address(this).balance / bettersAgainstAddresses.length;
            for (uint256 i = 0; i < bettersAgainstAddresses.length; i++) {
                bettersAgainstAddresses[i].transfer(reward);
            }
            taxAddress.transfer(address(this).balance);
        }
    }

}

