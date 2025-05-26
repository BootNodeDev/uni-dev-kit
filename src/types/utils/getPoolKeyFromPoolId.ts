/**
 * Parameters required for retrieving pool key information.
 */
export interface GetPoolKeyFromPoolIdParams {
	/** The 32-byte pool ID in hex format (0x...) */
	poolId: `0x${string}`;
	/** Optional chain ID where the pool exists */
	chainId?: number;
}

/**
 * Pool key information returned from the contract
 */
export interface PoolKey {
	/** First token address in the pool */
	currency0: `0x${string}`;
	/** Second token address in the pool */
	currency1: `0x${string}`;
	/** Fee tier of the pool */
	fee: number;
	/** Tick spacing of the pool */
	tickSpacing: number;
	/** Hooks contract address */
	hooks: `0x${string}`;
}
