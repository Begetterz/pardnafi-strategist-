// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract StrategyRegistry is Ownable2Step {
    uint8 public constant MAX_RISK_SCORE = 10;
    uint256 public strategyCount;

    struct Strategy {
        uint256 id;
        bytes32 strategyHash;
        uint256 chainId;
        string protocol;
        uint256 expectedApyBps;
        uint8 riskScore;
        address publisher;
        uint256 timestamp;
    }

    mapping(uint256 => Strategy) public strategies;
    mapping(bytes32 => bool) public strategyHashExists;

    error InvalidStrategy();
    error InvalidStrategyHash();
    error InvalidChainId();
    error InvalidProtocol();
    error InvalidRiskScore();
    error StrategyAlreadyPublished();

    constructor() Ownable(msg.sender) {}

    event StrategyPublished(
        uint256 indexed strategyId,
        bytes32 strategyHash,
        address indexed publisher
    );

    event StrategyCopied(
        uint256 indexed strategyId,
        address indexed user
    );

    function publishStrategy(
        bytes32 strategyHash,
        uint256 chainId,
        string memory protocol,
        uint256 expectedApyBps,
        uint8 riskScore
    ) public onlyOwner {
        if (strategyHash == bytes32(0)) {
            revert InvalidStrategyHash();
        }
        if (chainId == 0) {
            revert InvalidChainId();
        }
        if (bytes(protocol).length == 0) {
            revert InvalidProtocol();
        }
        if (riskScore > MAX_RISK_SCORE) {
            revert InvalidRiskScore();
        }
        if (strategyHashExists[strategyHash]) {
            revert StrategyAlreadyPublished();
        }

        strategyCount++;
        strategyHashExists[strategyHash] = true;

        strategies[strategyCount] = Strategy({
            id: strategyCount,
            strategyHash: strategyHash,
            chainId: chainId,
            protocol: protocol,
            expectedApyBps: expectedApyBps,
            riskScore: riskScore,
            publisher: owner(),
            timestamp: block.timestamp
        });

        emit StrategyPublished(strategyCount, strategyHash, owner());
    }

    function copyStrategy(uint256 strategyId) public {
        if (strategyId == 0 || strategyId > strategyCount) {
            revert InvalidStrategy();
        }

        emit StrategyCopied(strategyId, msg.sender);
    }

    function getStrategy(uint256 strategyId)
        public
        view
        returns (Strategy memory)
    {
        if (strategyId == 0 || strategyId > strategyCount) {
            revert InvalidStrategy();
        }
        return strategies[strategyId];
    }
}
