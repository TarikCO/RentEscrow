// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    // variables for transactions
    address public buyer;
    address public seller;
    uint public amount;
    bool public delivered;
    uint public deadline;

    // rating system
    uint public totalRating;
    uint public numRatings;

    // events 
    event Deposited(address indexed from, uint value);
    event Delivered();
    event Released(uint value);
    event Refunded(uint value);
    event Rated(address indexed by, uint score);

    // main constructor
    constructor(address _seller, uint _durationSeconds) payable {
        buyer = msg.sender;
        seller = _seller;
        amount = msg.value;
        deadline = block.timestamp + _durationSeconds;
        require(amount > 0, "Send ETH to escrow");
        emit Deposited(msg.sender, amount);
    }

    // function to deposit 
    function deposit() public payable {
        require(msg.sender == buyer, "Only buyer can deposit");
        require(msg.value == amount, "Incorrect deposit amount");
        emit Deposited(msg.sender, msg.value);
    }

    // function to confirm transaction
    function confirmDelivery() public {
        require(msg.sender == buyer, "Only buyer can confirm delivery");
        delivered = true;
        emit Delivered();
    }

    // function to release amount
    function releaseFunds() public {
        require(delivered, "Delivery not confirmed");
        payable(seller).transfer(amount);
        emit Released(amount);
    }

    // refund function
    function refund() public {
        require(msg.sender == buyer, "Only buyer can refund");
        require(!delivered, "Already delivered");
        require(block.timestamp >= deadline, "Too early to refund");
        payable(buyer).transfer(amount);
        emit Refunded(amount);
    }

    // rate the seller after delivery (1-5)
    function rateSeller(uint score) public {
        require(msg.sender == buyer, "Only buyer can rate");
        require(delivered, "Delivery not confirmed");
        require(score >= 1 && score <= 5, "Score must be 1-5");
        totalRating += score;
        numRatings += 1;
        emit Rated(msg.sender, score);
    }

    // get average rating
    function getAverageRating() public view returns (uint) {
        if (numRatings == 0) return 0;
        return totalRating / numRatings;
    }
}