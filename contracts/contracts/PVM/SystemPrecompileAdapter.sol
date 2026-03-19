// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISystemPrecompile {
    function hashBlake256(bytes calldata data) external view returns (bytes32);
}

abstract contract SystemPrecompileAdapter {
    address internal constant SYSTEM_PRECOMPILE = 0x0000000000000000000000000000000000000900;

    function _hashBlake256Safe(bytes memory data) internal view returns (bytes32 digest, bool success) {
        bytes memory returnData;
        (success, returnData) = SYSTEM_PRECOMPILE.staticcall(
            abi.encodeWithSelector(ISystemPrecompile.hashBlake256.selector, data)
        );

        if (!success || returnData.length < 32) {
            return (bytes32(0), false);
        }

        digest = abi.decode(returnData, (bytes32));
        return (digest, true);
    }
}