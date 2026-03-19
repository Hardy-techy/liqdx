// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract gPAS is ERC20, Ownable {
    address public vault;

    event VaultSet(address indexed oldVault, address indexed newVault);
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);

    constructor() ERC20("Staked PAS", "gPAS") Ownable(msg.sender) {}

    function setVault(address _vault) external onlyOwner {
        require(_vault != address(0), "Invalid vault");
        emit VaultSet(vault, _vault);
        vault = _vault;
    }

    modifier onlyVault() {
        require(msg.sender == vault, "Not vault");
        _;
    }

    function mint(address to, uint256 amount) external onlyVault {
        _mint(to, amount);
        emit Minted(to, amount);
    }

    function burn(address from, uint256 amount) external onlyVault {
        _burn(from, amount);
        emit Burned(from, amount);
    }
}
