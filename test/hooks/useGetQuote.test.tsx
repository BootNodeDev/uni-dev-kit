import { useGetQuote } from "@/hooks/useGetQuote";
import { getQuote } from "@/utils/getQuote";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { parseEther } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock getQuote
vi.mock("@/utils/getQuote");

const mockGetQuote = getQuote as unknown as ReturnType<typeof vi.fn>;

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

	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	it("should fetch quote successfully", async () => {
		const mockQuote = {
			amountOut: parseEther("0.5"),
			sqrtPriceX96: BigInt("123456789"),
			tick: 12345,
		};

		mockGetQuote.mockResolvedValueOnce(mockQuote);

		const { result } = renderHook(
			() =>
				useGetQuote({
					params: {
						tokens: [USDC, WETH],
						feeTier: 3000,
						tickSpacing: 60,
						amountIn: parseEther("1000"),
						zeroForOne: true,
					},
				}),
			{ wrapper },
		);

		expect(result.current.isLoading).toBe(true);
		expect(result.current.data).toBeUndefined();

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toEqual({
			amountOut: mockQuote.amountOut,
			sqrtPriceX96: mockQuote.sqrtPriceX96,
			tick: mockQuote.tick,
		});
		expect(mockGetQuote).toHaveBeenCalledWith(
			{
				tokens: [USDC, WETH],
				feeTier: 3000,
				tickSpacing: 60,
				amountIn: parseEther("1000"),
				zeroForOne: true,
			},
			undefined,
		);
	});

	it("should handle errors", async () => {
		const error = new Error("Failed to fetch quote");
		mockGetQuote.mockRejectedValueOnce(error);

		const { result } = renderHook(
			() =>
				useGetQuote({
					params: {
						tokens: [USDC, WETH],
						feeTier: 3000,
						tickSpacing: 60,
						amountIn: parseEther("1000"),
						zeroForOne: true,
					},
				}),
			{ wrapper },
		);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.error).toEqual(error);
	});

	it("should not fetch when params are not provided", () => {
		const { result } = renderHook(() => useGetQuote(), { wrapper });

		expect(result.current.isLoading).toBe(false);
		expect(result.current.data).toBeUndefined();
		expect(mockGetQuote).not.toHaveBeenCalled();
	});
});
