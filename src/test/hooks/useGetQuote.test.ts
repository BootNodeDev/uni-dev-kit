import { useGetQuote } from "@/hooks/useGetQuote";
import { FeeTier } from "@/types/utils/getPool";
import { getQuote } from "@/utils/getQuote";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { jsx as _jsx } from "react/jsx-runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock getQuote
vi.mock("@/utils/getQuote", () => ({
	getQuote: vi.fn(),
}));

// Real token addresses on Ethereum mainnet
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

describe("useGetQuote", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		});
		vi.resetAllMocks();
	});

	const wrapper = ({ children }: { children: React.ReactNode }) =>
		_jsx(QueryClientProvider, { client: queryClient, children: children });

	it("should fetch quote data successfully", async () => {
		const mockQuote = {
			amountOut: BigInt("1000000000000000000"),
			estimatedGasUsed: BigInt("100000"),
			timestamp: Date.now(),
		};

		(getQuote as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
			mockQuote,
		);

		const { result } = renderHook(
			() =>
				useGetQuote({
					params: {
						tokens: [USDC, WETH],
						feeTier: FeeTier.MEDIUM,
						tickSpacing: 60,
						amountIn: BigInt("1000000"),
						zeroForOne: true,
					},
					chainId: 1,
				}),
			{ wrapper },
		);

		expect(result.current.isLoading).toBe(true);
		expect(result.current.data).toBeUndefined();

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toEqual(mockQuote);
		expect(getQuote).toHaveBeenCalledWith(
			{
				tokens: [USDC, WETH],
				feeTier: FeeTier.MEDIUM,
				tickSpacing: 60,
				amountIn: BigInt("1000000"),
				zeroForOne: true,
			},
			1,
		);
	});

	it("should handle errors", async () => {
		const error = new Error("Failed to fetch quote");
		(getQuote as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
			error,
		);

		const { result } = renderHook(
			() =>
				useGetQuote({
					params: {
						tokens: [USDC, WETH],
						feeTier: FeeTier.MEDIUM,
						tickSpacing: 60,
						amountIn: BigInt("1000000"),
						zeroForOne: true,
					},
					chainId: 1,
				}),
			{ wrapper },
		);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.error).toEqual(error);
	});

	it("should throw error if no params provided", () => {
		expect(() => {
			renderHook(() => useGetQuote(), { wrapper });
		}).toThrow("No params provided");
	});

	it("should handle custom query options", async () => {
		const mockQuote = {
			amountOut: BigInt("1000000000000000000"),
			estimatedGasUsed: BigInt("100000"),
			timestamp: Date.now(),
		};

		(getQuote as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
			mockQuote,
		);

		const { result } = renderHook(
			() =>
				useGetQuote({
					params: {
						tokens: [USDC, WETH],
						feeTier: FeeTier.MEDIUM,
						tickSpacing: 60,
						amountIn: BigInt("1000000"),
						zeroForOne: true,
					},
					chainId: 1,
					queryOptions: {
						enabled: true,
						staleTime: 30000,
					},
				}),
			{ wrapper },
		);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toEqual(mockQuote);
	});
});
