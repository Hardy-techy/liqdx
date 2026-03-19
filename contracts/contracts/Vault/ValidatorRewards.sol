// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IVault {
    function addSimulatedRewards() external payable;
}

/**
 * @title ValidatorRewards
 * @dev Simulates a Polkadot validator node distributing monthly epoch staking rewards to the Liquid Staking Vault.
 */
contract ValidatorRewards is Ownable {
    IVault public vault;
    uint256 public monthlyEpochRewardAmount;
    uint256 public lastEpochPayoutTime;

    // 30-day epoch cooldown
    uint256 public constant EPOCH_COOLDOWN = 30 days;

    event RewardsDistributed(uint256 amount, uint256 timestamp);
    event VaultUpdated(address newVault);
    event RewardAmountUpdated(uint256 newAmount);

    constructor(address _vault, uint256 _monthlyEpochRewardAmount) Ownable(msg.sender) {
        vault = IVault(_vault);
        monthlyEpochRewardAmount = _monthlyEpochRewardAmount;
        // Allow immediate first payout
        lastEpochPayoutTime = 0;
    }

    /**
     * @dev Distributes the monthly epoch fixed reward to the Vault.
     * Anyone can call this function (like a decentralized keeper), but it enforces the 30-day cooldown.
     */
    function distributeMonthlyEpochReward() public {
        require(block.timestamp >= lastEpochPayoutTime + EPOCH_COOLDOWN, "30-day epoch cooldown has not passed yet");
        require(address(this).balance >= monthlyEpochRewardAmount, "Insufficient PAS in Validator pool");

        lastEpochPayoutTime = block.timestamp;

        // Send the native PAS to the Vault and trigger the APY update
        vault.addSimulatedRewards{value: monthlyEpochRewardAmount}();

        emit RewardsDistributed(monthlyEpochRewardAmount, block.timestamp);
    }

    // Admin functions to manage the mock validator
    function setVault(address _vault) external onlyOwner {
        vault = IVault(_vault);
        emit VaultUpdated(_vault);
    }

    function setMonthlyEpochRewardAmount(uint256 _amount) public onlyOwner {
        monthlyEpochRewardAmount = _amount;
        emit RewardAmountUpdated(_amount);
    }

    // To fund the Validator mock with PAS
    receive() external payable {}
}
