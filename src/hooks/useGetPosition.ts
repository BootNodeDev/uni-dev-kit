import type {
	PositionResult,
	UseGetPositionOptions,
} from "@/types/hooks/useGetPosition";
import { getPosition } from "@/utils/getPosition";
import { useQuery } from "@tanstack/react-query";

/**
 * React hook for fetching Uniswap V4 position data using React Query.
 * Handles caching, loading states, and error handling automatically.
 *
 * @param options - Configuration options for the hook
 * @returns Query result containing position data, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useGetPosition({
 *   tokenId: 123,
 *   chainId: 1,
 *   queryOptions: {
 *     enabled: true,
 *     staleTime: 30000,
 *     gcTime: 300000,
 *     retry: 3,
 *     onSuccess: (data) => console.log('Position data received:', data)
 *   }
 * });
 * ```
 */
export function useGetPosition({
	tokenId,
	chainId,
	queryOptions = {},
}: UseGetPositionOptions = {}) {
	if (!tokenId) throw new Error("No tokenId provided");

	return useQuery<
		PositionResult | undefined,
		Error,
		PositionResult | undefined,
		unknown[]
	>({
		queryKey: ["position", tokenId, chainId],
		queryFn: () => getPosition(tokenId, chainId),
		...queryOptions,
	});
}
