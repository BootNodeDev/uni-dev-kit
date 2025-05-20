import type { UseGetQuoteOptions } from "@/types/hooks/useGetQuote";
import type { QuoteParams, QuoteResponse } from "@/types/utils/getQuote";
import { getQuote } from "@/utils/getQuote";
import { useQuery } from "@tanstack/react-query";

/**
 * React hook for fetching quotes from Uniswap V4 using React Query.
 * Handles caching, loading states, and error handling automatically.
 *
 * @param options - Configuration options for the hook
 * @returns Query result containing quote data, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useGetQuote({
 *   params: {
 *     tokens: [token0, token1],
 *     feeTier: 3000,
 *     tickSpacing: 60,
 *     amountIn: parseEther("1"),
 *     zeroForOne: true
 *   },
 *   queryOptions: {
 *     enabled: true,
 *     staleTime: 30000,
 *     gcTime: 300000,
 *     retry: 3,
 *     onSuccess: (data) => console.log('Quote received:', data)
 *   }
 * });
 * ```
 */
function serializeParams(params?: QuoteParams) {
	if (!params) return undefined;
	return {
		...params,
		amountIn: params.amountIn?.toString(),
	};
}

export function useGetQuote({
	params,
	chainId,
	queryOptions = {},
}: UseGetQuoteOptions = {}) {
	if (!params) throw new Error("No params provided");
	return useQuery<QuoteResponse, Error, QuoteResponse, unknown[]>({
		queryKey: ["quote", serializeParams(params), chainId],
		queryFn: () => getQuote(params, chainId),
		...queryOptions,
	});
}
