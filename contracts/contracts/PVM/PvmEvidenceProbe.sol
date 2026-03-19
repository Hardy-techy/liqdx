// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SystemPrecompileAdapter.sol";
import "./XcmAdapter.sol";
import "./AssetPrecompileLib.sol";

contract PvmEvidenceProbe is SystemPrecompileAdapter, XcmAdapter {
    event SystemHashProbed(bytes32 indexed digest, bool success);
    event XcmWeightProbed(uint64 refTime, uint64 proofSize, bool success);

    function probeSystemBlake2(bytes calldata input) external returns (bytes32 digest, bool success) {
        (digest, success) = _hashBlake256Safe(input);
        emit SystemHashProbed(digest, success);
    }

    function probeXcmWeight(bytes calldata message)
        external
        returns (uint64 refTime, uint64 proofSize, bool success)
    {
        (IXcmPrecompile.Weight memory weight, bool weighed) = _weighMessageSafe(message);
        emit XcmWeightProbed(weight.refTime, weight.proofSize, weighed);
        return (weight.refTime, weight.proofSize, weighed);
    }

    function probeAssetAddress(uint32 assetId) external pure returns (address) {
        return AssetPrecompileLib.toAddress(assetId);
    }
}