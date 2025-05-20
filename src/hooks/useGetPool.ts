import type { UseGetPoolOptions } from "@/types/hooks/useGetPool";
import type { PoolParams, PoolResponse } from "@/types/utils/getPool";
import { getPool } from "@/utils/getPool";
import { useQuery } from "@tanstack/react-query";

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
 *     chainId: 1,
 *     fee: FeeTier.MEDIUM,
 *     hooks: "0x0000000000000000000000000000000000000000"
 *   },
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
function serializeParams(params?: PoolParams) {
	if (!params) return undefined;
	return {
		...params,
		tokens: params.tokens.map((t) => t.toLowerCase()),
	};
}

export function useGetPool({
	params,
	queryOptions = {},
}: UseGetPoolOptions = {}) {
	if (!params) throw new Error("No params provided");
	return useQuery<PoolResponse, Error, PoolResponse, unknown[]>({
		queryKey: ["pool", serializeParams(params)],
		queryFn: () => getPool(params),
		...queryOptions,
	});
}
