// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PvmExperimentBridge is Ownable {
    address public runtimeLibraryEndpoint;

    event RuntimeLibraryEndpointUpdated(address indexed oldEndpoint, address indexed newEndpoint);
    event RuntimeExperimentExecuted(
        address indexed caller,
        bytes32 indexed inputHash,
        bytes32 indexed outputHash,
        bool success
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setRuntimeLibraryEndpoint(address newEndpoint) external onlyOwner {
        require(newEndpoint != address(0), "Invalid endpoint");
        emit RuntimeLibraryEndpointUpdated(runtimeLibraryEndpoint, newEndpoint);
        runtimeLibraryEndpoint = newEndpoint;
    }

    function callRuntimeExperiment(bytes calldata payload) external returns (bytes memory result) {
        require(runtimeLibraryEndpoint != address(0), "Runtime endpoint not set");

        (bool success, bytes memory data) = runtimeLibraryEndpoint.call(payload);

        emit RuntimeExperimentExecuted(msg.sender, keccak256(payload), keccak256(data), success);
        require(success, "Runtime experiment call failed");

        return data;
    }

    function callRuntimeExperimentView(bytes calldata payload)
        external
        view
        returns (bytes memory result, bool success)
    {
        if (runtimeLibraryEndpoint == address(0)) {
            return ("", false);
        }

        (success, result) = runtimeLibraryEndpoint.staticcall(payload);
        return (result, success);
    }
}