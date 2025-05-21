import type { PoolParams } from "@/types/utils/getPool";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { Pool } from "@uniswap/v4-sdk";

/**
 * Configuration options for the useGetPool hook.
 */
export type UseGetPoolOptions = {
	/** Initial pool parameters */
	params?: PoolParams;
	/** Chain ID */
	chainId?: number;
	/** React Query options */
	queryOptions?: Omit<
		UseQueryOptions<Pool | undefined, Error, Pool | undefined, unknown[]>,
		"queryKey"
	>;
};
