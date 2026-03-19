// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockXcmPrecompile {
    struct Weight {
        uint64 refTime;
        uint64 proofSize;
    }

    bytes32 public lastExecutedMessageHash;
    bytes32 public lastSentDestinationHash;
    bytes32 public lastSentMessageHash;
    uint64 public lastExecutedRefTime;
    uint64 public lastExecutedProofSize;

    function weighMessage(bytes calldata message) external pure returns (Weight memory weight) {
        uint64 len = uint64(message.length);
        return Weight({refTime: len * 1_000, proofSize: len * 10});
    }

    function execute(bytes calldata message, Weight calldata weight) external {
        lastExecutedMessageHash = keccak256(message);
        lastExecutedRefTime = weight.refTime;
        lastExecutedProofSize = weight.proofSize;
    }

    function send(bytes calldata destination, bytes calldata message) external {
        lastSentDestinationHash = keccak256(destination);
        lastSentMessageHash = keccak256(message);
    }
}