// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimplePool
 * @notice A constant-product AMM (x*y=k) for trading PT-gPAS <-> native PAS.
 *         LP tokens are minted upon providing liquidity.
 *         0.3% swap fee, standard Uniswap-style.
 */
contract SimplePool is ERC20, ReentrancyGuard {

    IERC20 public immutable token; // PT-gPAS (or any ERC20)
    
    uint256 public reservePAS;     // PAS reserve (native token)
    uint256 public reserveToken;   // PT-gPAS reserve
    
    uint256 public constant FEE_NUMERATOR = 997;   // 0.3% fee
    uint256 public constant FEE_DENOMINATOR = 1000;

    uint256 public totalSwapVolume; // cumulative swap volume in PAS
    
    event LiquidityAdded(address indexed provider, uint256 pasAmount, uint256 tokenAmount, uint256 lpMinted);
    event LiquidityRemoved(address indexed provider, uint256 pasAmount, uint256 tokenAmount, uint256 lpBurned);
    event Swap(address indexed user, bool pasToToken, uint256 amountIn, uint256 amountOut);

    constructor(address _token) ERC20("LidqX LP Token", "LQX-LP") {
        token = IERC20(_token);
    }

    /**
     * @notice Add liquidity to the pool. First deposit sets the price ratio.
     * @param _tokenAmount Amount of PT-gPAS tokens to deposit
     */
    function addLiquidity(uint256 _tokenAmount) external payable nonReentrant returns (uint256 lpMinted) {
        require(msg.value > 0 && _tokenAmount > 0, "Amounts must be > 0");

        if (reservePAS == 0 && reserveToken == 0) {
            // First deposit — set initial ratio
            lpMinted = sqrt(msg.value * _tokenAmount);
        } else {
            // Proportional deposit
            uint256 lpFromPAS = (msg.value * totalSupply()) / reservePAS;
            uint256 lpFromToken = (_tokenAmount * totalSupply()) / reserveToken;
            lpMinted = lpFromPAS < lpFromToken ? lpFromPAS : lpFromToken;
        }

        require(lpMinted > 0, "Insufficient liquidity minted");
        require(token.transferFrom(msg.sender, address(this), _tokenAmount), "Token transfer failed");

        reservePAS += msg.value;
        reserveToken += _tokenAmount;

        _mint(msg.sender, lpMinted);
        emit LiquidityAdded(msg.sender, msg.value, _tokenAmount, lpMinted);
    }

    /**
     * @notice Remove liquidity — burns LP tokens and returns proportional PAS + PT-gPAS.
     * @param _lpAmount Amount of LP tokens to burn
     */
    function removeLiquidity(uint256 _lpAmount) external nonReentrant returns (uint256 pasOut, uint256 tokenOut) {
        require(_lpAmount > 0, "LP amount must be > 0");
        require(balanceOf(msg.sender) >= _lpAmount, "Not enough LP tokens");

        uint256 supply = totalSupply();
        pasOut = (_lpAmount * reservePAS) / supply;
        tokenOut = (_lpAmount * reserveToken) / supply;

        require(pasOut > 0 && tokenOut > 0, "Insufficient liquidity");

        _burn(msg.sender, _lpAmount);

        reservePAS -= pasOut;
        reserveToken -= tokenOut;

        (bool sent, ) = msg.sender.call{value: pasOut}("");
        require(sent, "PAS transfer failed");
        require(token.transfer(msg.sender, tokenOut), "Token transfer failed");

        emit LiquidityRemoved(msg.sender, pasOut, tokenOut, _lpAmount);
    }

    /**
     * @notice Swap native PAS for PT-gPAS tokens.
     */
    function swapPASforToken() external payable nonReentrant returns (uint256 tokenOut) {
        require(msg.value > 0, "Must send PAS");
        require(reservePAS > 0 && reserveToken > 0, "No liquidity");

        uint256 amountInWithFee = msg.value * FEE_NUMERATOR;
        tokenOut = (amountInWithFee * reserveToken) / (reservePAS * FEE_DENOMINATOR + amountInWithFee);

        require(tokenOut > 0, "Insufficient output");

        reservePAS += msg.value;
        reserveToken -= tokenOut;
        totalSwapVolume += msg.value;

        require(token.transfer(msg.sender, tokenOut), "Token transfer failed");
        emit Swap(msg.sender, true, msg.value, tokenOut);
    }

    /**
     * @notice Swap PT-gPAS tokens for native PAS.
     * @param _tokenAmount Amount of PT-gPAS to sell
     */
    function swapTokenForPAS(uint256 _tokenAmount) external nonReentrant returns (uint256 pasOut) {
        require(_tokenAmount > 0, "Amount must be > 0");
        require(reservePAS > 0 && reserveToken > 0, "No liquidity");

        uint256 amountInWithFee = _tokenAmount * FEE_NUMERATOR;
        pasOut = (amountInWithFee * reservePAS) / (reserveToken * FEE_DENOMINATOR + amountInWithFee);

        require(pasOut > 0, "Insufficient output");

        require(token.transferFrom(msg.sender, address(this), _tokenAmount), "Token transfer failed");
        reserveToken += _tokenAmount;
        reservePAS -= pasOut;
        totalSwapVolume += pasOut;

        (bool sent, ) = msg.sender.call{value: pasOut}("");
        require(sent, "PAS transfer failed");
        emit Swap(msg.sender, false, _tokenAmount, pasOut);
    }

    /**
     * @notice Get the current price of 1 token in PAS (scaled by 1e18).
     */
    function getTokenPrice() external view returns (uint256) {
        if (reserveToken == 0) return 0;
        return (reservePAS * 1e18) / reserveToken;
    }

    /**
     * @notice Get reserves and pool info.
     */
    function getPoolInfo() external view returns (
        uint256 _reservePAS,
        uint256 _reserveToken,
        uint256 _totalLP,
        uint256 _volume
    ) {
        return (reservePAS, reserveToken, totalSupply(), totalSwapVolume);
    }

    // Babylonian sqrt for initial LP calculation
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    receive() external payable {}
}
