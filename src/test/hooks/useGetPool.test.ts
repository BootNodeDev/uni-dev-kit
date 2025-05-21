import { useGetPool } from "@/hooks/useGetPool";
import type { UseGetPoolOptions } from "@/types/hooks/useGetPool";
import { getPool } from "@/utils/getPool";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { Token } from "@uniswap/sdk-core";
import { jsx as _jsx } from "react/jsx-runtime";
import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the getPool function
vi.mock("@/utils/getPool", () => ({
	getPool: vi.fn(),
}));

// Mock tokens
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as const;
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as const;

describe("useGetPool", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		});
		vi.clearAllMocks();
	});

	const wrapper = ({ children }: { children: React.ReactNode }) =>
		_jsx(QueryClientProvider, { client: queryClient, children });

	it("should fetch pool data successfully", async () => {
		const mockPool = {
			token0: new Token(1, USDC, 6, "USDC", "USD Coin"),
			token1: new Token(1, WETH, 18, "WETH", "Wrapped Ether"),
			fee: 3000,
			tickSpacing: 60,
		};

		(getPool as Mock).mockReturnValue(mockPool);

		const { result } = renderHook(
			() =>
				useGetPool({
					params: {
						tokens: [USDC, WETH],
						fee: 3000,
					},
					chainId: 1,
				}),
			{ wrapper },
		);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toEqual(mockPool);
		expect(result.current.error).toBeNull();
		expect(result.current.isLoading).toBe(false);
		expect(result.current.status).toBe("success");
		expect(getPool).toHaveBeenCalledWith(
			{
				tokens: [USDC, WETH],
				fee: 3000,
			},
			1,
		);
	});

	it("should handle errors", async () => {
		const error = new Error("Failed to fetch pool");
		(getPool as Mock).mockImplementation(() => {
			throw error;
		});

		const { result } = renderHook(
			() =>
				useGetPool({
					params: {
						tokens: [USDC, WETH],
						fee: 3000,
					},
					chainId: 1,
				}),
			{ wrapper },
		);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toBeUndefined();
		expect(result.current.error).toBe(error);
		expect(result.current.isLoading).toBe(false);
		expect(result.current.status).toBe("error");
	});

	it("should throw error if no params provided", () => {
		expect(() => {
			renderHook(() => useGetPool(undefined as unknown as UseGetPoolOptions), {
				wrapper,
			});
		}).toThrow("No params provided");
	});

	it("should handle custom query options", async () => {
		const mockPool = {
			token0: new Token(1, USDC, 6, "USDC", "USD Coin"),
			token1: new Token(1, WETH, 18, "WETH", "Wrapped Ether"),
			fee: 3000,
			tickSpacing: 60,
		};

		(getPool as Mock).mockReturnValue(mockPool);

		const { result } = renderHook(
			() =>
				useGetPool({
					params: {
						tokens: [USDC, WETH],
						fee: 3000,
					},
					chainId: 1,
					queryOptions: {
						enabled: true,
						staleTime: 5000,
					},
				}),
			{ wrapper },
		);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toEqual(mockPool);
		expect(result.current.error).toBeNull();
		expect(result.current.isLoading).toBe(false);
		expect(result.current.status).toBe("success");
	});
});
