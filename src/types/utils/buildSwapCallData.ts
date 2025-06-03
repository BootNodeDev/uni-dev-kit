import type { Pool } from "@uniswap/v4-sdk";
import type { Address } from "viem";

/**
 * Command codes for Universal Router operations
 * @see https://docs.uniswap.org/contracts/universal-router/technical-reference
 */
export const COMMANDS = {
	SWAP_EXACT_IN_SINGLE: 0x06,
	SETTLE_ALL: 0x0c,
	TAKE_ALL: 0x0f,
	V4_ROUTER_EXECUTE: 0x10,
} as const;

/**
 * Parameters for building a V4 swap
 */
export type BuildSwapCallDataParams = {
	/** Input token address */
	tokenIn: Address;
	/** Amount of input tokens to swap (in token's smallest unit) */
	amountIn: bigint;
	/** Pool */
	pool: Pool;
	/** Slippage tolerance in basis points (e.g., 50 = 0.5%). Defaults to 50 (0.5%) */
	slippageTolerance?: number;
};
