import type { UseGetPoolKeyFromPoolIdOptions } from "@/types/hooks/useGetPoolKeyFromPoolId";
import { getPoolKeyFromPoolId } from "@/utils/getPoolKeyFromPoolId";
import { useQuery } from "@tanstack/react-query";

/**
 * React hook for fetching Uniswap V4 pool key information using React Query.
 * Handles caching, loading states, and error handling automatically.
 *
 * @param options - Configuration options for the hook
 * @returns Query result containing pool key data, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useGetPoolKeyFromPoolId({
 *   poolId: "0x1234...",
 *   chainId: 1,
 *   queryOptions: {
 *     enabled: true,
 *     staleTime: 30000,
 *     gcTime: 300000,
 *     retry: 3,
 *     onSuccess: (data) => console.log('Pool key data received:', data)
 *   }
 * });
 * ```
 */
export function useGetPoolKeyFromPoolId({
	poolId,
	chainId,
	queryOptions = {},
}: UseGetPoolKeyFromPoolIdOptions) {
	return useQuery({
		queryKey: ["poolKey", poolId, chainId],
		queryFn: () => getPoolKeyFromPoolId({ poolId, chainId }),
		...queryOptions,
	});
}
