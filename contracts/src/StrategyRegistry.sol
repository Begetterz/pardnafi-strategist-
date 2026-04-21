// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StrategyRegistry {
    address public immutable publisher;
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

    error NotPublisher();
    error InvalidStrategy();
    error InvalidStrategyHash();
    error InvalidChainId();
    error InvalidProtocol();
    error StrategyAlreadyPublished();

    constructor() {
        publisher = msg.sender;
    }

    event StrategyPublished(
        uint256 indexed strategyId,
        bytes32 strategyHash,
        address indexed publisher
    );

    event StrategyCopied(
        uint256 indexed strategyId,
        address indexed user
    );

    modifier onlyPublisher() {
        if (msg.sender != publisher) {
            revert NotPublisher();
        }
        _;
    }

    function publishStrategy(
        bytes32 strategyHash,
        uint256 chainId,
        string memory protocol,
        uint256 expectedApyBps,
        uint8 riskScore
    ) public onlyPublisher {
        if (strategyHash == bytes32(0)) {
            revert InvalidStrategyHash();
        }
        if (chainId == 0) {
            revert InvalidChainId();
        }
        if (bytes(protocol).length == 0) {
            revert InvalidProtocol();
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
            publisher: msg.sender,
            timestamp: block.timestamp
        });

        emit StrategyPublished(strategyCount, strategyHash, msg.sender);
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
