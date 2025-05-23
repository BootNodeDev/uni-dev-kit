import type { Token } from "@uniswap/sdk-core";
import type { Pool, Position } from "@uniswap/v4-sdk";

/**
 * Parameters required for retrieving a Uniswap V4 position instance.
 */
export interface GetPositionParams {
	/** The unique identifier of the position */
	tokenId: string;
}

/**
 * Response structure for retrieving a Uniswap V4 position instance.
 */
export interface GetPositionResponse {
	/** The position instance */
	position: Position;
	/** The pool instance associated with the position */
	pool: Pool;
	/** The first token in the pool pair */
	token0: Token;
	/** The second token in the pool pair */
	token1: Token;
	/** The unique identifier of the pool */
	poolId: `0x${string}`;
	/** The unique identifier of the position */
	tokenId: string;
}
