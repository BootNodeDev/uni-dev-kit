import type { PoolKey } from "@/types/utils/getPoolKeyFromPoolId";
import type { UseQueryOptions } from "@tanstack/react-query";

/**
 * Configuration options for the useGetPoolKeyFromPoolId hook.
 */
export type UseGetPoolKeyFromPoolIdOptions = {
	/** The 32-byte pool ID in hex format (0x...) */
	poolId: `0x${string}`;
	/** Chain ID */
	chainId?: number;
	/** React Query options */
	queryOptions?: Omit<
		UseQueryOptions<PoolKey | undefined, Error, PoolKey | undefined, unknown[]>,
		"queryKey"
	>;
};
