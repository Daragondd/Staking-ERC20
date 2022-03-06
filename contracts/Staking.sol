//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "hardhat/console.sol";

contract Staking is AccessControl {

    // TODO: реализовать без этой херни ==> bool isAmount (struct Contributor)
    // TODO: убрать returns bool success во всех функциях
    // TODO: изменить функцию подсчета реварда (х * 120 / 100)
    

    uint256 public freezeTime;    
    uint256 public rewardTime;
    uint256 public percent;
    address private _owner;

    address private _rewardToken;       // LP
    address private _stakingToken;      // RUB
    address private _tokenUSDT;         // USDT

    bytes32 private constant ADMIN = keccak256("ADMIN"); 

    struct Contributor{
        uint256 deposit;
        uint256 startDate;
        uint256 reward;
        bool isAmount;  // TODO: реализовать без этой херни 
    }

    mapping (address => Contributor) public contributors;

    constructor(
        address token1, 
        address token2, 
        address tokenLP, 
        uint256 frzTime, 
        uint256 rwdTime
        ) {
        freezeTime = frzTime;
        percent = 20; 
        rewardTime = rwdTime;
         
        _owner = msg.sender;
        _setupRole(ADMIN, _owner);

        _stakingToken = token1;       // RUB
        _tokenUSDT = token2;          // USDT
        _rewardToken = tokenLP;       // LP
    }

    // function for contributor
    function stake(uint256 _amount) public {
        require(
            IERC20(_stakingToken).balanceOf(msg.sender) >= _amount,
            "You don't have enough tokens"
        );

        IERC20(_stakingToken).transferFrom(msg.sender, address(this), _amount);

        Contributor storage contributor = contributors[msg.sender];
            if(contributor.isAmount == true) {
                _calculateReward(contributor);
                contributor.deposit += _amount;
                contributor.startDate = block.timestamp;
            }
            else{
                contributors[msg.sender] = Contributor(_amount, block.timestamp, 0, true);
            }
    }

    function claim() public {

        Contributor storage contributor = contributors[msg.sender];
        require(
            block.timestamp - contributor.startDate > freezeTime,
            "Please, try later"
        );

        uint256 reward = _calculateReward(contributor);
        IERC20(_rewardToken).transfer(msg.sender, reward);

        contributor.reward = 0;
        contributor.startDate = block.timestamp;

    }

    function unstake() public {

        Contributor storage contributor = contributors[msg.sender];
        require(
            contributor.deposit > 0,
            "Nothing to unstake"
        );

        IERC20(_stakingToken).transfer(msg.sender, contributor.deposit);

    }

 // functions for administator
    function setFreezeTime(uint256 _amount) public onlyRole(ADMIN)  returns (bool success) {
        require(
            _amount <= 1 hours,
            "Freeze time must be <= 1 hour"
        );
        require(
            _amount >= 5 seconds,
            "Freeze time must be >= 5 seconds"
        );

        freezeTime = _amount;
        return true;
    }

    function setPercent(uint256 _amount) public onlyRole(ADMIN) returns (bool success) {
        require(
            _amount == 5 || _amount == 10 || _amount == 15,
            "Try 5%, 10% or 15%"
        );

        percent = _amount; // percents
        return true;
    }

    function _calculateReward(Contributor storage _contributor) internal returns(uint256) {
        uint256 coef = (block.timestamp - _contributor.startDate) / rewardTime;

        for (uint256 i = 0; i < coef; i++) {
            _contributor.reward += _contributor.deposit * percent / 100;
        }

        return _contributor.reward;
    }
}