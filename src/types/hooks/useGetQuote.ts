import type { QuoteParams, QuoteResponse } from "@/types/utils/getQuote";
import type { UseQueryOptions } from "@tanstack/react-query";

/**
 * Configuration options for the useGetQuote hook.
 */
export type UseGetQuoteOptions = {
	/** Initial quote parameters */
	params?: QuoteParams;
	/** Chain ID to use */
	chainId?: number;
	/** React Query options */
	queryOptions?: Omit<
		UseQueryOptions<QuoteResponse, Error, QuoteResponse, unknown[]>,
		"queryKey"
	>;
};
