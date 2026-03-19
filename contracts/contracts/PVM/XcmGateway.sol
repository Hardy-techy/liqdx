// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./XcmAdapter.sol";

contract XcmGateway is Ownable, XcmAdapter {
    event XcmMessageWeighed(bytes32 indexed messageHash, uint64 refTime, uint64 proofSize, bool precompileUsed);
    event XcmMessageExecuted(bytes32 indexed messageHash, uint64 refTime, uint64 proofSize, bool success);
    event XcmMessageSent(bytes32 indexed destinationHash, bytes32 indexed messageHash, bool success);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function weighXcmMessage(bytes calldata message) external onlyOwner returns (uint64 refTime, uint64 proofSize, bool success) {
        bytes memory messageBytes = message;
        (IXcmPrecompile.Weight memory weight, bool weighed) = _weighMessageSafe(messageBytes);
        emit XcmMessageWeighed(keccak256(messageBytes), weight.refTime, weight.proofSize, weighed);
        return (weight.refTime, weight.proofSize, weighed);
    }

    function executeXcmMessage(bytes calldata message) external onlyOwner returns (uint64 refTime, uint64 proofSize) {
        bytes memory messageBytes = message;
        (IXcmPrecompile.Weight memory weight, bool weighed) = _weighMessageSafe(messageBytes);
        require(weighed, "XCM weighMessage failed");

        bool success = _executeXcm(messageBytes, weight);
        require(success, "XCM execute failed");

        emit XcmMessageExecuted(keccak256(messageBytes), weight.refTime, weight.proofSize, true);
        return (weight.refTime, weight.proofSize);
    }

    function sendXcmMessage(bytes calldata destination, bytes calldata message) external onlyOwner {
        bytes memory destinationBytes = destination;
        bytes memory messageBytes = message;

        require(destinationBytes.length > 0, "Empty destination");
        require(messageBytes.length > 0, "Empty message");

        bool success = _sendXcm(destinationBytes, messageBytes);
        require(success, "XCM send failed");

        emit XcmMessageSent(keccak256(destinationBytes), keccak256(messageBytes), true);
    }
}