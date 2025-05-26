import { useGetPosition } from "@/hooks/useGetPosition";
import { getPosition } from "@/utils/getPosition";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { Token } from "@uniswap/sdk-core";
import { jsx as _jsx } from "react/jsx-runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock getPosition
vi.mock("@/utils/getPosition", () => ({
	getPosition: vi.fn(),
}));

describe("useGetPosition", () => {
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
		_jsx(QueryClientProvider, { client: queryClient, children });

	it("should fetch position data successfully", async () => {
		const mockPosition = {
			token0: new Token(
				1,
				"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
				6,
				"USDC",
				"USD Coin",
			),
			token1: new Token(
				1,
				"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
				18,
				"WETH",
				"Wrapped Ether",
			),
			position: {
				amounts: {
					amount0: "1000000",
					amount1: "1000000000000000000",
				},
				tickLower: -100,
				tickUpper: 100,
				liquidity: BigInt("1000000000000000000"),
			},
			pool: {},
			poolId: "0x1234567890123456789012345678901234567890",
			tokenId: "123",
		};

		(getPosition as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
			mockPosition,
		);

		const { result } = renderHook(
			() =>
				useGetPosition({
					tokenId: "123",
					chainId: 1,
				}),
			{ wrapper },
		);

		expect(result.current.isLoading).toBe(true);
		expect(result.current.data).toBeUndefined();

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toEqual(mockPosition);
		expect(getPosition).toHaveBeenCalledWith({ tokenId: "123" }, 1);
	});

	it("should handle errors", async () => {
		const error = new Error("Failed to fetch position");
		(getPosition as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
			error,
		);

		const { result } = renderHook(
			() =>
				useGetPosition({
					tokenId: "123",
					chainId: 1,
				}),
			{ wrapper },
		);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.error).toEqual(error);
	});

	it("should throw error if no tokenId provided", () => {
		expect(() => {
			renderHook(() => useGetPosition(), { wrapper });
		}).toThrow("No tokenId provided");
	});

	it("should handle custom query options", async () => {
		const mockPosition = {
			token0: new Token(
				1,
				"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
				6,
				"USDC",
				"USD Coin",
			),
			token1: new Token(
				1,
				"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
				18,
				"WETH",
				"Wrapped Ether",
			),
			position: {
				amounts: {
					amount0: "1000000",
					amount1: "1000000000000000000",
				},
				tickLower: -100,
				tickUpper: 100,
				liquidity: BigInt("1000000000000000000"),
			},
			pool: {},
			poolId: "0x1234567890123456789012345678901234567890",
			tokenId: "123",
		};

		(getPosition as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
			mockPosition,
		);

		const { result } = renderHook(
			() =>
				useGetPosition({
					tokenId: "123",
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

		expect(result.current.data).toEqual(mockPosition);
	});
});
