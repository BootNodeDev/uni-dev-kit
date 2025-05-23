import { getPosition } from "@/utils/getPosition";
import { Token } from "@uniswap/sdk-core";
import { type Address, zeroAddress } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the SDK instance
vi.mock("@/core/uniDevKitV4Factory", () => ({
	getInstance: () => mockGetInstance(),
}));

// Mock getTokens
vi.mock("@/utils/getTokens", () => ({
	getTokens: () => mockGetTokens(),
}));

const mockGetInstance = vi.fn();
const mockGetTokens = vi.fn();

describe("getPosition", () => {
	// USDC and WETH on Mainnet
	const mockTokens: [Address, Address] = [
		"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
		"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
	];
	const mockTokenId = "123";
	const mockChainId = 1;

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should throw error if SDK instance not found", async () => {
		mockGetInstance.mockReturnValueOnce(undefined);
		await expect(getPosition(mockTokenId, mockChainId)).rejects.toThrow(
			"SDK not initialized",
		);
	});

	it("should throw error if tokens not found", async () => {
		const mockClient = {
			multicall: vi.fn().mockResolvedValueOnce([
				[
					{
						currency0: mockTokens[0],
						currency1: mockTokens[1],
						fee: 3000,
						tickSpacing: 60,
						hooks: zeroAddress,
					},
					"0x",
				],
				BigInt("1000000000000000000"),
			]),
		};

		mockGetInstance.mockReturnValueOnce({
			getClient: () => mockClient,
			getContractAddress: vi.fn(() => "0xMockAddress"),
		});
		mockGetTokens.mockResolvedValueOnce(null);

		await expect(getPosition(mockTokenId, mockChainId)).rejects.toThrow(
			"Tokens not found",
		);
	});

	it("should throw error if liquidity is 0", async () => {
		const mockClient = {
			multicall: vi.fn().mockResolvedValueOnce([
				[
					{
						currency0: mockTokens[0],
						currency1: mockTokens[1],
						fee: 3000,
						tickSpacing: 60,
						hooks: zeroAddress,
					},
					"0x",
				],
				BigInt(0),
			]),
		};

		mockGetInstance.mockReturnValueOnce({
			getClient: () => mockClient,
			getContractAddress: vi.fn(() => "0xMockAddress"),
		});

		mockGetTokens.mockResolvedValueOnce([
			new Token(1, mockTokens[0], 6, "USDC", "USD Coin"),
			new Token(1, mockTokens[1], 18, "WETH", "Wrapped Ether"),
		]);

		await expect(getPosition(mockTokenId, mockChainId)).rejects.toThrow(
			"Liquidity is 0",
		);
	});

	it("should return position data when position exists", async () => {
		const mockTokenInstances = [
			new Token(1, mockTokens[0], 6, "USDC", "USD Coin"),
			new Token(1, mockTokens[1], 18, "WETH", "Wrapped Ether"),
		];

		// Compose a valid rawInfo: hasSubscriber=1, tickLower=0, tickUpper=60, poolId=0n
		const hasSubscriber = 1n;
		const tickLower = 0n;
		const tickUpper = 60n;
		const poolId = 0n;
		const rawInfo =
			hasSubscriber | (tickLower << 8n) | (tickUpper << 32n) | (poolId << 56n);
		const mockPoolKey = {
			currency0: mockTokens[0],
			currency1: mockTokens[1],
			fee: 3000,
			tickSpacing: 60,
			hooks: zeroAddress,
		};

		const mockClient = {
			multicall: vi
				.fn()
				.mockResolvedValueOnce([
					[mockPoolKey, rawInfo],
					BigInt("1000000000000000000"),
				])
				.mockResolvedValueOnce([
					[BigInt("79228162514264337593543950336"), 0],
					BigInt("1000000000000000000"),
				]),
		};

		mockGetInstance.mockReturnValueOnce({
			getClient: () => mockClient,
			getContractAddress: vi.fn(() => "0xMockAddress"),
		});

		mockGetTokens.mockResolvedValueOnce(mockTokenInstances);

		const result = await getPosition(mockTokenId, mockChainId);

		expect(result).toBeDefined();
		expect(result?.token0).toEqual(mockTokenInstances[0]);
		expect(result?.token1).toEqual(mockTokenInstances[1]);
		expect(result?.liquidity).toBe(BigInt("1000000000000000000"));
		expect(result?.amounts).toBeDefined();
		expect(result?.tickLower).toBeDefined();
		expect(result?.tickUpper).toBeDefined();
		expect(result?.poolId).toBeDefined();
	});
});
