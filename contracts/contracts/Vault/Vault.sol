// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./gPAS.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../PVM/SystemPrecompileAdapter.sol";
import "../PVM/AssetPrecompileLib.sol";

contract Vault is Ownable, ReentrancyGuard, SystemPrecompileAdapter {
    gPAS public gPasToken;
    uint256 public exchangeRate;
    address public oracle;
    address public runtimeLibraryEndpoint;
    bool public runtimeScoringEnabled;
    uint32 public nativeAssetId;
    address public nativeAssetToken;
    bool public nativeAssetConfigured;

    mapping(address => uint256) public nativeAssetBalances;
    mapping(address => uint256) public latestRuntimeScore;
    uint256 public totalNativeAssetBalance;

    uint256 public constant RATE_PRECISION = 1e18;
    uint256 public constant SCORE_BONUS_CAP_BPS = 500;

    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    event ExchangeRateUpdated(uint256 oldRate, uint256 newRate);
    event DepositReceipt(bytes32 indexed receiptHash, address indexed user, uint256 amount);
    event DepositReceiptDigests(
        bytes32 indexed keccakHash,
        bytes32 indexed blake2Hash,
        address indexed user,
        uint256 amount,
        bool systemPrecompileUsed
    );
    event NativeAssetConfigured(uint32 indexed assetId, address indexed tokenAddress);
    event NativeAssetDeposited(address indexed user, uint32 indexed assetId, uint256 amount);
    event NativeAssetWithdrawn(address indexed user, uint32 indexed assetId, uint256 amount);
    event RuntimeLibraryEndpointUpdated(address indexed oldEndpoint, address indexed newEndpoint);
    event RuntimeScoringToggled(bool enabled);
    event RuntimeScoreApplied(address indexed user, uint256 score, uint256 bonusBps, bool runtimeCallSuccess);

    constructor(address _gPAS, address _oracle) Ownable(msg.sender) {
        gPasToken = gPAS(_gPAS);
        exchangeRate = RATE_PRECISION;
        oracle = _oracle;
        runtimeScoringEnabled = true;
    }

    modifier onlyOracle {
        require(msg.sender == oracle, "Only Oracle can call this function");
        _;
    }

    function deposit() external payable nonReentrant {
        require(msg.value > 0, "No PAS sent");

        uint256 amountToMint = (msg.value * RATE_PRECISION) / exchangeRate;

        (uint256 runtimeScore, uint256 bonusBps, bool runtimeCallSuccess) = _computeRuntimeScore(msg.value, block.timestamp);
        if (runtimeCallSuccess && bonusBps > 0) {
            amountToMint = (amountToMint * (10000 + bonusBps)) / 10000;
        }

        latestRuntimeScore[msg.sender] = runtimeScore;
        emit RuntimeScoreApplied(msg.sender, runtimeScore, bonusBps, runtimeCallSuccess);

        bytes memory receiptPayload = abi.encodePacked(msg.sender, msg.value, block.timestamp);
        bytes32 receiptHash = keccak256(receiptPayload);
        (bytes32 blake2Hash, bool systemPrecompileUsed) = _hashBlake256Safe(receiptPayload);

        gPasToken.mint(msg.sender, amountToMint);
        emit DepositReceipt(receiptHash, msg.sender, msg.value);
        emit DepositReceiptDigests(receiptHash, blake2Hash, msg.sender, msg.value, systemPrecompileUsed);
    }

    function setRuntimeLibraryEndpoint(address _newEndpoint) external onlyOwner {
        require(_newEndpoint != address(0), "Invalid runtime endpoint");
        emit RuntimeLibraryEndpointUpdated(runtimeLibraryEndpoint, _newEndpoint);
        runtimeLibraryEndpoint = _newEndpoint;
    }

    function setRuntimeScoringEnabled(bool enabled) external onlyOwner {
        runtimeScoringEnabled = enabled;
        emit RuntimeScoringToggled(enabled);
    }

    function withdraw(uint256 _amount) external payable nonReentrant {
        require(_amount > 0, "gPAS amount has to be > 0");

        gPasToken.burn(msg.sender, _amount);

        uint256 sttToReturn = _amount * exchangeRate / RATE_PRECISION;

        require(address(this).balance >= sttToReturn, "Not enough PAS in vault");

        (bool sent, ) = msg.sender.call{value: sttToReturn}("");
        require(sent, "PAS transfer failed");
    }

    // The exchange rate will get updated periodically by the oracle
    function setExchangeRate(uint256 _newExchangeRate) external onlyOracle {
        emit ExchangeRateUpdated(exchangeRate, _newExchangeRate);
        exchangeRate = _newExchangeRate;
    }

    function setOracle(address _newOracle) external onlyOwner {
        emit OracleUpdated(oracle, _newOracle);
        oracle = _newOracle;
    }

    function configureNativeAsset(uint32 _assetId) external onlyOwner {
        nativeAssetId = _assetId;
        nativeAssetToken = AssetPrecompileLib.toAddress(_assetId);
        nativeAssetConfigured = true;

        emit NativeAssetConfigured(_assetId, nativeAssetToken);
    }

    function depositNativeAsset(uint256 amount) external nonReentrant {
        require(nativeAssetConfigured, "Native asset not configured");
        require(amount > 0, "Amount has to be > 0");

        bool success = IERC20(nativeAssetToken).transferFrom(msg.sender, address(this), amount);
        require(success, "Native asset transferFrom failed");

        nativeAssetBalances[msg.sender] += amount;
        totalNativeAssetBalance += amount;

        emit NativeAssetDeposited(msg.sender, nativeAssetId, amount);
    }

    function withdrawNativeAsset(uint256 amount) external nonReentrant {
        require(nativeAssetConfigured, "Native asset not configured");
        require(amount > 0, "Amount has to be > 0");

        uint256 userBalance = nativeAssetBalances[msg.sender];
        require(userBalance >= amount, "Insufficient native asset balance");

        nativeAssetBalances[msg.sender] = userBalance - amount;
        totalNativeAssetBalance -= amount;

        bool success = IERC20(nativeAssetToken).transfer(msg.sender, amount);
        require(success, "Native asset transfer failed");

        emit NativeAssetWithdrawn(msg.sender, nativeAssetId, amount);
    }

    // Simulates receiving daily staking rewards from Polkadot PVM
    function addSimulatedRewards() external payable {
        require(msg.value > 0, "No rewards sent");
        
        uint256 currentSupply = gPasToken.totalSupply();
        if (currentSupply > 0) {
            // value per share increases by (rewardAmount / totalShares)
            uint256 rateIncrease = (msg.value * RATE_PRECISION) / currentSupply;
            uint256 newRate = exchangeRate + rateIncrease;
            
            emit ExchangeRateUpdated(exchangeRate, newRate);
            exchangeRate = newRate;
        }
    }

    function _computeRuntimeScore(uint256 amount, uint256 timestamp)
        internal
        view
        returns (uint256 score, uint256 bonusBps, bool success)
    {
        if (!runtimeScoringEnabled || runtimeLibraryEndpoint == address(0)) {
            return (0, 0, false);
        }

        bytes memory returnData;
        (success, returnData) = runtimeLibraryEndpoint.staticcall(
            abi.encodeWithSignature("cppLikeScore(uint256,uint256)", amount, timestamp)
        );

        if (!success || returnData.length < 32) {
            return (0, 0, false);
        }

        score = abi.decode(returnData, (uint256));
        bonusBps = score % (SCORE_BONUS_CAP_BPS + 1);
        return (score, bonusBps, true);
    }

    // Allow contract to receive ETH
    receive() external payable {}

    fallback() external payable {}
}
