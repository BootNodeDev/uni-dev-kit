import type { FeeTier } from "@/types";
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
	/** Output token address */
	tokenOut: Address;
	/** Amount of input tokens to swap (in token's smallest unit) */
	amountIn: bigint;
	/** Minimum amount of output tokens to receive (in token's smallest unit) */
	amountOutMin?: bigint;
	/** Pool fee tier (e.g., 3000 for 0.3%) */
	fee?: FeeTier;
	/** Pool tick spacing */
	tickSpacing?: number;
	/** Hook contract address (use zero address if no hooks) */
	hooks?: Address;
};
