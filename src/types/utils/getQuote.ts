import type { Address, Hex } from "viem";

/**
 * Parameters required for fetching a quote using the V4 Quoter contract.
 */
export interface QuoteParams {
	/**
	 * Array of two token addresses representing the pair. The order will be handled internally.
	 */
	tokens: [Address, Address];

	/**
	 * The fee tier of the pool (e.g., 500, 3000, 10000).
	 */
	feeTier: number;

	/**
	 * The tick spacing for the pool. Must be a positive integer.
	 */
	tickSpacing: number;

	/**
	 * The amount of tokens being swapped, expressed as a bigint.
	 */
	amountIn: bigint;

	/**
	 * Direction of the swap. True if swapping from the lower token to the higher token, false otherwise.
	 */
	zeroForOne: boolean;

	/**
	 * Address of the hooks contract, if any. Defaults to zero address if not provided.
	 */
	hooks?: Address;

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
