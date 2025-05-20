import type { PoolParams, PoolResponse } from "@/types/utils/getPool";
import type { UseQueryOptions } from "@tanstack/react-query";

/**
 * Configuration options for the useGetPool hook.
 */
export type UseGetPoolOptions = {
	/** Initial pool parameters */
	params?: PoolParams;
	/** React Query options */
	queryOptions?: Omit<
		UseQueryOptions<PoolResponse, Error, PoolResponse, unknown[]>,
		"queryKey"
	>;
};
