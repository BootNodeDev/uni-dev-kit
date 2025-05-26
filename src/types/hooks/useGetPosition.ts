import type { UseQueryOptions } from "@tanstack/react-query";
import type { Token } from "@uniswap/sdk-core";
import type { Pool, Position } from "@uniswap/v4-sdk";

/**
 * Result type for position data
 */
export interface PositionResult {
	/** The position instance */
	position: Position;
	/** The pool instance associated with the position */
	pool: Pool;
	/** First token in the pair */
	token0: Token;
	/** Second token in the pair */
	token1: Token;
	/** Unique identifier for the pool */
	poolId: `0x${string}`;
	/** The unique identifier of the position */
	tokenId: string;
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
