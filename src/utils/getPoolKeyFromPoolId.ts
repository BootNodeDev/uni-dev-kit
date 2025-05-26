import { V4PositionManagerAbi } from "@/constants/abis/V4PositionMananger";
import { getInstance } from "@/core/uniDevKitV4Factory";
import type {
	GetPoolKeyFromPoolIdParams,
	PoolKey,
} from "@/types/utils/getPoolKeyFromPoolId";

/**
 * Retrieves the pool key information for a given pool ID.
 * @param params Parameters containing the pool ID and optional chain ID
 * @returns Promise resolving to the pool key containing currency0, currency1, fee, tickSpacing, and hooks
 * @throws Error if SDK instance is not found
 */
export async function getPoolKeyFromPoolId({
	poolId,
	chainId,
}: GetPoolKeyFromPoolIdParams): Promise<PoolKey> {
	const sdk = getInstance(chainId);
	if (!sdk) throw new Error("SDK not initialized");

	const client = sdk.getClient();
	const positionManager = sdk.getContractAddress("positionManager");

	const poolId25Bytes = `0x${poolId.slice(2, 52)}` as `0x${string}`;

	const [currency0, currency1, fee, tickSpacing, hooks] =
		await client.readContract({
			address: positionManager,
			abi: V4PositionManagerAbi,
			functionName: "poolKeys",
			args: [poolId25Bytes],
		});

	return {
		currency0,
		currency1,
		fee,
		tickSpacing,
		hooks,
	};
}
