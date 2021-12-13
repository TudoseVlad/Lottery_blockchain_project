//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Lottery{
    address public manager;
    address []  public  players;
    //mapping(address => uint) public players;
    uint public prizePool;
    uint public TicketPrice = 0.01 ether;
    uint private fee = 1;
    constructor() {
        manager = msg.sender;
    }

    function getNumberOfPlayers() public view returns(uint){
        return players.length;
    }

    function enter() public payable{
        require(msg.value > TicketPrice );
        // taking the fee
        prizePool = prizePool +(uint)( msg.value / 100 * (100 - fee));
        players.push(msg.sender);
    }

    function random() private view returns (uint) {
        // current block difficulty + current time + addresses of players into sha3 algorithm
       // old version uint(keccak256(block.difficulty, block.timestamp, players) ) ;
        
        return uint(keccak256( abi.encode(block.difficulty, block.timestamp, players) ) );
        
    }

    function pickWinner() public restriced{
        

        uint index = random() % players.length;
        address payable winner;
        //casting winner beacuse we cant transfer with only address, we need address payable
        winner = payable( players[index]);
        winner.transfer(prizePool);

        prizePool = 0;
        players = new address[](0);
    }

    

    modifier restriced(){
        // only the manager can call PickWinner
        require(msg.sender == manager);
        // the _; represents the code of the function that uses this particular modifier
        _;
    }

    function listAllPlayers() public view returns ( address[] memory) {
        return players;
    }    

}