import type { Address } from "viem";

/**
 * Standard fee tiers for Uniswap V4 pools.
 */
export enum FeeTier {
	LOWEST = 100, // 0.01%
	LOW = 500, // 0.05%
	MEDIUM = 3000, // 0.3%
	HIGH = 10000, // 1%
}

/**
 * Maps fee tiers to their corresponding tick spacing.
 * Following Uniswap V4's standard configurations.
 */
export const TICK_SPACING_BY_FEE: Record<FeeTier, number> = {
	[FeeTier.LOWEST]: 1,
	[FeeTier.LOW]: 10,
	[FeeTier.MEDIUM]: 60,
	[FeeTier.HIGH]: 200,
};

/**
 * Parameters for retrieving a Uniswap V4 pool instance.
 */
export interface PoolParams {
	/** Array of two token addresses representing the pair */
	tokens: [Address, Address];
	/** Optional fee tier of the pool (default: FeeTier.MEDIUM) */
	fee?: FeeTier;
	/** Optional tick spacing for the pool (default: derived from fee tier) */
	tickSpacing?: number;
	/** Optional hooks contract address (default: zero address) */
	hooks?: `0x${string}`;
}
