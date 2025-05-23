import type { UseQueryOptions } from "@tanstack/react-query";
import type { Token } from "@uniswap/sdk-core";

/**
 * Result type for position data
 */
export interface PositionResult {
	/** First token in the pair */
	token0: Token;
	/** Second token in the pair */
	token1: Token;
	/** Token amounts in the position */
	amounts: {
		/** Amount of token0 */
		amount0: string;
		/** Amount of token1 */
		amount1: string;
	};
	/** Lower tick boundary of the position */
	tickLower: number;
	/** Upper tick boundary of the position */
	tickUpper: number;
	/** Total liquidity in the position */
	liquidity: bigint;
	/** Unique identifier for the pool */
	poolId: `0x${string}`;
}

/**
 * Configuration options for the useGetPosition hook
 */
export interface UseGetPositionOptions {
	/** Token ID of the position */
	tokenId?: string;
	/** Chain ID to use */
	chainId?: number;
	/** React Query options */
	queryOptions?: Omit<
		UseQueryOptions<
			PositionResult | undefined,
			Error,
			PositionResult | undefined,
			unknown[]
		>,
		"queryKey"
	>;
}
