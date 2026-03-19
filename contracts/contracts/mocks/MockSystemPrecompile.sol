// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockSystemPrecompile {
    function hashBlake256(bytes calldata data) external pure returns (bytes32) {
        // Local deterministic stand-in for runtime precompile behavior.
        return keccak256(data);
    }
}