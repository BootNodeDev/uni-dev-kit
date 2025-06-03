import type { Pool } from "@uniswap/v4-sdk";
import type { Hex } from "viem";

/**
 * Parameters required for fetching a quote using the V4 Quoter contract.
 */
export interface QuoteParams {
	/**
	 * The pool instance to quote from
	 */
	pool: Pool;

	/**
	 * The amount of tokens being swapped, expressed as a bigint.
	 */
	amountIn: bigint;

	/**
	 * Direction of the swap. True if swapping from the lower token to the higher token, false otherwise.
	 */
	zeroForOne: boolean;

	/**
	 * Optional additional data for the hooks, if any.
	 */
	hookData?: Hex;
}

/**
 * Response structure for a successful quote simulation.
 */
export interface QuoteResponse {
	/**
	 * The estimated amount of tokens out for the given input amount.
	 */
	amountOut: bigint;

	/**
	 * The estimated gas used for the transaction.
	 */
	estimatedGasUsed: bigint;

	/**
	 * The timestamp when the quote was fetched.
	 */
	timestamp: number;
}
