import type { UseGetPoolOptions } from "@/types/hooks/useGetPool";
import { getPool } from "@/utils/getPool";
import { useQuery } from "@tanstack/react-query";
import type { Pool } from "@uniswap/v4-sdk";

/**
 * React hook for fetching Uniswap V4 pool data using React Query.
 * Handles caching, loading states, and error handling automatically.
 *
 * @param options - Configuration options for the hook
 * @returns Query result containing pool data, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useGetPool({
 *   params: {
 *     tokens: [token0, token1],
 *     fee: FeeTier.MEDIUM,
 *     hooks: "0x0000000000000000000000000000000000000000"
 *   },
 *   chainId: 1,
 *   queryOptions: {
 *     enabled: true,
 *     staleTime: 30000,
 *     gcTime: 300000,
 *     retry: 3,
 *     onSuccess: (data) => console.log('Pool data received:', data)
 *   }
 * });
 * ```
 */

export function useGetPool({
	params,
	chainId,
	queryOptions = {},
}: UseGetPoolOptions) {
	return useQuery<Pool | undefined, Error, Pool | undefined, unknown[]>({
		queryKey: [
			"pool",
			params.fee,
			params.tokens,
			params.hooks,
			params.tickSpacing,
			chainId,
		],
		queryFn: () => getPool(params, chainId),
		...queryOptions,
	});
}
