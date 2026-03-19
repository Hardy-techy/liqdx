// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IXcmPrecompile {
    struct Weight {
        uint64 refTime;
        uint64 proofSize;
    }

    function execute(bytes calldata message, Weight calldata weight) external;
    function send(bytes calldata destination, bytes calldata message) external;
    function weighMessage(bytes calldata message) external view returns (Weight memory weight);
}

abstract contract XcmAdapter {
    address internal constant XCM_PRECOMPILE = 0x00000000000000000000000000000000000a0000;

    function _weighMessageSafe(bytes memory message)
        internal
        view
        returns (IXcmPrecompile.Weight memory weight, bool success)
    {
        bytes memory returnData;
        (success, returnData) = XCM_PRECOMPILE.staticcall(
            abi.encodeWithSelector(IXcmPrecompile.weighMessage.selector, message)
        );

        if (!success || returnData.length < 64) {
            return (IXcmPrecompile.Weight(0, 0), false);
        }

        weight = abi.decode(returnData, (IXcmPrecompile.Weight));
        return (weight, true);
    }

    function _executeXcm(bytes memory message, IXcmPrecompile.Weight memory weight) internal returns (bool success) {
        (success, ) = XCM_PRECOMPILE.call(abi.encodeWithSelector(IXcmPrecompile.execute.selector, message, weight));
    }

    function _sendXcm(bytes memory destination, bytes memory message) internal returns (bool success) {
        (success, ) = XCM_PRECOMPILE.call(abi.encodeWithSelector(IXcmPrecompile.send.selector, destination, message));
    }
}