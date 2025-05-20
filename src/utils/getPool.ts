/**
 * @fileoverview Hook to check if a Uniswap V4 pool exists for a given token pair,
 * fee tier, tick spacing, and hooks configuration.
 */

import { V4PositionManagerAbi } from "@/constants/abis/V4PositionMananger";
import { V4StateViewABI } from "@/constants/abis/V4StateView";
import { getInstance } from "@/core/uniDevKitV4Factory";
import { getTickSpacingForFee } from "@/helpers/fees";
import { sortTokens } from "@/helpers/tokens";
import {
	FeeTier,
	type PoolParams,
	type PoolResponse,
} from "@/types/utils/getPool";
import { getTokenInstances } from "@/utils/getTokenInstance";
import { Pool } from "@uniswap/v4-sdk";
import { slice, zeroAddress } from "viem";
import { useReadContracts } from "wagmi";

const DEFAULT_HOOKS = zeroAddress;

/**
 * Retrieves a Uniswap V4 pool instance for a given token pair, fee tier, tick spacing, and hooks configuration.
 * @param params Pool parameters including tokens, chainId, fee tier, tick spacing, and hooks configuration
 * @returns Promise resolving to pool data, loading state, and any errors
 * @throws Error if SDK instance or token instances are not found or if pool data is not found
 */
export async function getPool({
	tokens,
	fee = FeeTier.MEDIUM,
	tickSpacing,
	hooks = DEFAULT_HOOKS,
	chainId,
}: PoolParams): Promise<PoolResponse> {
	const sdk = getInstance(chainId);
	if (!sdk) {
		throw new Error("SDK not found. Please create an instance first.");
	}

	// Use provided tick spacing or derive from fee tier
	const finalTickSpacing = tickSpacing ?? getTickSpacingForFee(fee);

	const [token0, token1] = sortTokens(tokens[0], tokens[1]);
	const tokenInstances = await getTokenInstances({
		addresses: [token0, token1],
		chainId,
	});

	if (!tokenInstances) {
		throw new Error("Failed to fetch token instances");
	}

	const poolId32Bytes = Pool.getPoolId(
		tokenInstances[0],
		tokenInstances[1],
		fee,
		finalTickSpacing,
		hooks,
	) as `0x${string}`;

	const poolId25Bytes = slice(poolId32Bytes, 0, 25) as `0x${string}`;

	const { data: poolData, isLoading } = useReadContracts({
		allowFailure: false,
		contracts: [
			{
				address: sdk.getContractAddress("positionManager"),
				abi: V4PositionManagerAbi,
				functionName: "poolKeys",
				args: [poolId25Bytes],
			},
			{
				address: sdk.getContractAddress("stateView"),
				abi: V4StateViewABI,
				functionName: "getSlot0",
				args: [poolId32Bytes],
			},
			{
				address: sdk.getContractAddress("stateView"),
				abi: V4StateViewABI,
				functionName: "getLiquidity",
				args: [poolId32Bytes],
			},
		],
	});

	if (!poolData) {
		return {
			data: undefined,
			isLoading,
			error: new Error("Pool data not found"),
		};
	}

	const [poolKeysData, slot0Data, liquidityData] = poolData;
	const poolExists =
		poolKeysData && Number(poolKeysData[3]) > 0 && slot0Data && liquidityData;

	if (!poolExists) {
		return { data: undefined, isLoading, error: new Error("Pool not found") };
	}

	try {
		const pool = new Pool(
			tokenInstances[0],
			tokenInstances[1],
			fee,
			finalTickSpacing,
			hooks,
			slot0Data[0].toString(),
			liquidityData.toString(),
			Number(slot0Data[1]),
		);

		return { data: pool, isLoading, error: null };
	} catch (error) {
		console.error("Error fetching pool:", error);
		return {
			data: undefined,
			isLoading,
			error: error instanceof Error ? error : new Error("Failed to fetch pool"),
		};
	}
}
