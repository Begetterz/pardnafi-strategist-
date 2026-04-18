// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StrategyRegistry {
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

    event StrategyPublished(
        uint256 indexed strategyId,
        bytes32 strategyHash,
        address publisher
    );

    event StrategyCopied(
        uint256 indexed strategyId,
        address user
    );

    function publishStrategy(
        bytes32 strategyHash,
        uint256 chainId,
        string memory protocol,
        uint256 expectedApyBps,
        uint8 riskScore
    ) public {
        strategyCount++;

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
        require(strategyId > 0 && strategyId <= strategyCount, "Invalid strategy");

        emit StrategyCopied(strategyId, msg.sender);
    }

    function getStrategy(uint256 strategyId)
        public
        view
        returns (Strategy memory)
    {
        require(strategyId > 0 && strategyId <= strategyCount, "Invalid strategy");
        return strategies[strategyId];
    }
}
