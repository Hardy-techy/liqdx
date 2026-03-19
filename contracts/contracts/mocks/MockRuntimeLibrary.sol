// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockRuntimeLibrary {
    function rustLikeHash(bytes calldata input) external pure returns (bytes32) {
        return keccak256(abi.encodePacked("rust-lib", input));
    }

    function cppLikeScore(uint256 left, uint256 right) external pure returns (uint256) {
        return (left * 31) + right;
    }

    function failAlways() external pure {
        require(false, "mock runtime failure");
    }
}