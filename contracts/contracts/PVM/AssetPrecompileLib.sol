// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library AssetPrecompileLib {
    uint160 internal constant ERC20_PRECOMPILE_SUFFIX = uint160(0x01200000);

    function toAddress(uint32 assetId) internal pure returns (address) {
        uint160 assetPrefix = uint160(assetId) << 128;
        return address(assetPrefix | ERC20_PRECOMPILE_SUFFIX);
    }
}