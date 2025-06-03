import type { BuildSwapCallDataParams } from "@/types";
import {
	COMMANDS,
	FeeTier,
	TICK_SPACING_BY_FEE,
	type UniDevKitV4Instance,
} from "@/types";
import { DEFAULT_HOOKS, getPool } from "@/utils/getPool";
import { getTokens } from "@/utils/getTokens";
import { ethers } from "ethers";
import type { Hex } from "viem";

/**
 * Builds calldata for a Uniswap V4 swap
 *
 * This function creates the necessary calldata to execute a token swap through
 * Uniswap V4's Universal Router. It handles pool discovery, parameter encoding,
 * and deadline management.
 *
 * @param params - Swap configuration parameters
 * @param instance - UniDevKitV4 instance for pool operations
 * @returns Promise resolving to encoded calldata
 *
 * @throws Error if pool doesn't exist
 *
 * @example
 * ```typescript
 * const swapParams = {
 *   tokenIn: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
 *   tokenOut: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
 *   amountIn: parseUnits("100", 6), // 100 USDC
 *   amountOutMin: parseUnits("0.05", 18), // Min 0.05 WETH
 * };
 *
 * const calldata = await buildSwapCallData(swapParams, instance);
 *
 * // Send transaction
 * const tx = await sendTransaction({
 *   to: instance.contracts.universalRouter,
 *   data: calldata,
 *   value: 0,
 * });
 * ```
 */
export async function buildSwapCallData(
	params: BuildSwapCallDataParams,
	instance: UniDevKitV4Instance,
): Promise<Hex> {
	// Extract and set default parameters
	const {
		tokenIn,
		tokenOut,
		amountIn,
		amountOutMin = 0n,
		fee = FeeTier.MEDIUM,
		tickSpacing = TICK_SPACING_BY_FEE[fee],
		hooks = DEFAULT_HOOKS,
	} = params;

	// Get pool information
	const pool = await getPool(
		{ tokens: [tokenIn, tokenOut], fee, tickSpacing, hooks },
		instance,
	);
	if (!pool) {
		throw new Error("No swapable pool found");
	}

	// Get token instances for address comparison
	const tokenInstances = await getTokens(
		{ addresses: [tokenIn, tokenOut] },
		instance,
	);
	const zeroForOne = tokenInstances[0].address === tokenIn;

	// Encode Universal Router commands
	const commands = ethers.utils.solidityPack(
		["uint8"],
		[COMMANDS.V4_ROUTER_EXECUTE],
	);

	// Encode swap actions sequence
	const actions = ethers.utils.solidityPack(
		["uint8", "uint8", "uint8"],
		[COMMANDS.SWAP_EXACT_IN_SINGLE, COMMANDS.SETTLE_ALL, COMMANDS.TAKE_ALL],
	);

	// Encode swap parameters
	const exactInputSingleParams = ethers.utils.defaultAbiCoder.encode(
		[
			"tuple(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, bool zeroForOne, uint128 amountIn, uint128 amountOutMinimum, bytes hookData)",
		],
		[
			{
				poolKey: pool.poolKey,
				zeroForOne,
				amountIn: ethers.BigNumber.from(amountIn),
				amountOutMinimum: ethers.BigNumber.from(amountOutMin),
				hookData: "0x",
			},
		],
	);

	// Encode token amounts for settlement
	const swapParams = [
		exactInputSingleParams,
		ethers.utils.defaultAbiCoder.encode(
			["address", "uint128"],
			[pool.poolKey.currency0, amountIn],
		),
		ethers.utils.defaultAbiCoder.encode(
			["address", "uint128"],
			[pool.poolKey.currency1, 0],
		),
	];

	// Encode final inputs
	const inputs = [
		ethers.utils.defaultAbiCoder.encode(
			["bytes", "bytes[]"],
			[actions, swapParams],
		),
	];

	// Set 5-minute deadline
	const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 5);

	// Create Universal Router interface
	const universalRouterInterface = new ethers.utils.Interface([
		"function execute(bytes commands, bytes[] inputs, uint256 deadline)",
	]);

	// Encode final calldata
	return universalRouterInterface.encodeFunctionData("execute", [
		commands,
		inputs,
		deadline,
	]) as Hex;
}
