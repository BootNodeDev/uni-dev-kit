import { useGetPoolKeyFromPoolId } from "@/hooks/useGetPoolKeyFromPoolId";
import { getPoolKeyFromPoolId } from "@/utils/getPoolKeyFromPoolId";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { jsx as _jsx } from "react/jsx-runtime";
import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the getPoolKeyFromPoolId function
vi.mock("@/utils/getPoolKeyFromPoolId", () => ({
	getPoolKeyFromPoolId: vi.fn(),
}));

describe("useGetPoolKeyFromPoolId", () => {
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

	it("should fetch pool key data successfully", async () => {
		const mockPoolKey = {
			currency0: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
			currency1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
			fee: 3000,
			tickSpacing: 60,
			hooks: "0x0000000000000000000000000000000000000000",
		};

		(getPoolKeyFromPoolId as Mock).mockResolvedValue(mockPoolKey);

		const { result } = renderHook(
			() =>
				useGetPoolKeyFromPoolId({
					poolId: "0x1234",
					chainId: 1,
				}),
			{ wrapper },
		);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toEqual(mockPoolKey);
		expect(result.current.error).toBeNull();
		expect(result.current.isLoading).toBe(false);
		expect(result.current.status).toBe("success");
		expect(getPoolKeyFromPoolId).toHaveBeenCalledWith({
			poolId: "0x1234",
			chainId: 1,
		});
	});

	it("should handle errors", async () => {
		const error = new Error("Failed to fetch pool key");
		(getPoolKeyFromPoolId as Mock).mockRejectedValue(error);

		const { result } = renderHook(
			() =>
				useGetPoolKeyFromPoolId({
					poolId: "0x1234",
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

	it("should handle custom query options", async () => {
		const mockPoolKey = {
			currency0: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
			currency1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
			fee: 3000,
			tickSpacing: 60,
			hooks: "0x0000000000000000000000000000000000000000",
		};

		(getPoolKeyFromPoolId as Mock).mockResolvedValue(mockPoolKey);

		const { result } = renderHook(
			() =>
				useGetPoolKeyFromPoolId({
					poolId: "0x1234",
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

		expect(result.current.data).toEqual(mockPoolKey);
		expect(result.current.error).toBeNull();
		expect(result.current.isLoading).toBe(false);
		expect(result.current.status).toBe("success");
	});
});
