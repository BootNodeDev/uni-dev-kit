import type { UniDevKitV4 } from "@/core/uniDevKitV4";
import { getInstance } from "@/core/uniDevKitV4Factory";
import { getPoolKeyFromPoolId } from "@/utils/getPoolKeyFromPoolId";
import { describe, expect, it, vi } from "vitest";

// Mock the SDK instance
vi.mock("@/core/uniDevKitV4Factory", () => ({
	getInstance: vi.fn(),
}));

describe("getPoolKeyFromPoolId", () => {
	const mockPoolId =
		"0x1234567890123456789012345678901234567890123456789012345678901234";
	const mockChainId = 1;
	const expectedPoolId25Bytes =
		"0x12345678901234567890123456789012345678901234567890";

	it("should throw error if SDK instance not found", async () => {
		vi.mocked(getInstance).mockReturnValue(undefined as unknown as UniDevKitV4);

		await expect(
			getPoolKeyFromPoolId({ poolId: mockPoolId, chainId: mockChainId }),
		).rejects.toThrow("SDK not initialized");
	});

	it("should return pool key when SDK instance exists", async () => {
		const mockPoolKey = [
			"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
			"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
			3000,
			60,
			"0x0000000000000000000000000000000000000000",
		];

		const mockClient = {
			readContract: vi.fn().mockResolvedValue(mockPoolKey),
		};

		const mockSdk = {
			getClient: vi.fn().mockReturnValue(mockClient),
			getContractAddress: vi.fn().mockReturnValue("0xPositionManager"),
			instance: {},
			createInstance: vi.fn(),
			createClient: vi.fn(),
			getChainId: vi.fn(),
			getContract: vi.fn(),
		} as unknown as UniDevKitV4;

		vi.mocked(getInstance).mockReturnValue(mockSdk);

		const result = await getPoolKeyFromPoolId({
			poolId: mockPoolId,
			chainId: mockChainId,
		});

		expect(result).toEqual({
			currency0: mockPoolKey[0],
			currency1: mockPoolKey[1],
			fee: mockPoolKey[2],
			tickSpacing: mockPoolKey[3],
			hooks: mockPoolKey[4],
		});
		expect(mockClient.readContract).toHaveBeenCalledWith({
			address: "0xPositionManager",
			abi: expect.any(Object),
			functionName: "poolKeys",
			args: [expectedPoolId25Bytes],
		});
	});

	it("should handle contract read errors", async () => {
		const mockClient = {
			readContract: vi
				.fn()
				.mockRejectedValue(new Error("Contract read failed")),
		};

		const mockSdk = {
			getClient: vi.fn().mockReturnValue(mockClient),
			getContractAddress: vi.fn().mockReturnValue("0xPositionManager"),
			instance: {},
			createInstance: vi.fn(),
			createClient: vi.fn(),
			getChainId: vi.fn(),
			getContract: vi.fn(),
		} as unknown as UniDevKitV4;

		vi.mocked(getInstance).mockReturnValue(mockSdk);

		await expect(
			getPoolKeyFromPoolId({ poolId: mockPoolId, chainId: mockChainId }),
		).rejects.toThrow("Contract read failed");
	});

	it("should correctly convert poolId from 32 bytes to 25 bytes", async () => {
		const mockPoolKey = [
			"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
			"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
			3000,
			60,
			"0x0000000000000000000000000000000000000000",
		];

		const mockClient = {
			readContract: vi.fn().mockResolvedValue(mockPoolKey),
		};

		const mockSdk = {
			getClient: vi.fn().mockReturnValue(mockClient),
			getContractAddress: vi.fn().mockReturnValue("0xPositionManager"),
			instance: {},
			createInstance: vi.fn(),
			createClient: vi.fn(),
			getChainId: vi.fn(),
			getContract: vi.fn(),
		} as unknown as UniDevKitV4;

		vi.mocked(getInstance).mockReturnValue(mockSdk);

		await getPoolKeyFromPoolId({ poolId: mockPoolId, chainId: mockChainId });

		// Verify that the poolId was correctly converted
		expect(mockClient.readContract).toHaveBeenCalledWith(
			expect.objectContaining({
				args: [expectedPoolId25Bytes],
			}),
		);
	});
});
