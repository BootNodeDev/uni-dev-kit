import { FeeTier } from "@/types/utils/getPool";
import { getPool } from "@/utils/getPool";
import { Token } from "@uniswap/sdk-core";
import { type Address, zeroAddress } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetInstance = vi.fn();
const mockGetTokenInstances = vi.fn();
const mockUseReadContracts = vi.fn();

vi.mock("@/core/uniDevKitV4Factory", () => ({
	getInstance: () => mockGetInstance(),
}));

vi.mock("@/utils/getTokenInstance", () => ({
	getTokenInstances: () => mockGetTokenInstances(),
}));

vi.mock("wagmi", () => ({
	useReadContracts: () => mockUseReadContracts(),
}));

describe("useV4Pool", () => {
	// USDC and WETH on Mainnet
	const mockTokens: [Address, Address] = [
		"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
		"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
	];
	const mockChainId = 1;

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should throw error if SDK instance not found", async () => {
		mockGetInstance.mockReturnValueOnce(undefined);
		await expect(
			getPool({
				tokens: mockTokens,
				chainId: mockChainId,
				fee: FeeTier.MEDIUM,
			}),
		).rejects.toThrow("SDK not found");
	});

	it("should throw error if token instances not found", async () => {
		mockGetInstance.mockReturnValueOnce({
			getClient: vi.fn(),
			getContractAddress: vi.fn(),
		});
		mockGetTokenInstances.mockResolvedValueOnce(null);

		await expect(
			getPool({
				tokens: mockTokens,
				chainId: mockChainId,
				fee: FeeTier.MEDIUM,
			}),
		).rejects.toThrow("Failed to fetch token instances");
	});

	it("should return pool data when pool exists", async () => {
		const mockTokenInstances = [
			new Token(1, mockTokens[0], 18, "TOKEN0", "Token 0"),
			new Token(1, mockTokens[1], 18, "TOKEN1", "Token 1"),
		];

		const mockPoolData = [
			[mockTokens[0], mockTokens[1], FeeTier.MEDIUM, 60, zeroAddress],
			// slot0: [sqrtPriceX96, tick, observationIndex, observationCardinality, observationCardinalityNext, feeProtocol]
			["79228162514264337593543950336", 0, 0, 0, 0, 0],
			// liquidity
			"1000000000000000000",
		];

		mockGetInstance.mockReturnValueOnce({
			getClient: vi.fn(),
			getContractAddress: vi.fn(() => "0xMockAddress"),
		});

		mockGetTokenInstances.mockResolvedValueOnce(mockTokenInstances);
		mockUseReadContracts.mockReturnValueOnce({
			data: mockPoolData,
			isLoading: false,
		});

		const result = await getPool({
			tokens: mockTokens,
			chainId: mockChainId,
			fee: FeeTier.MEDIUM,
		});

		expect(result.data).toBeDefined();
		expect(result.isLoading).toBe(false);
		expect(result.error).toBeNull();
	});

	it("should return undefined data when pool does not exist", async () => {
		const mockTokenInstances = [
			new Token(1, mockTokens[0], 18, "TOKEN0", "Token 0"),
			new Token(1, mockTokens[1], 18, "TOKEN1", "Token 1"),
		];

		mockGetInstance.mockReturnValueOnce({
			getClient: vi.fn(),
			getContractAddress: vi.fn(() => "0xMockAddress"),
		});

		mockGetTokenInstances.mockResolvedValueOnce(mockTokenInstances);
		mockUseReadContracts.mockReturnValueOnce({
			data: null,
			isLoading: false,
		});

		const result = await getPool({
			tokens: mockTokens,
			chainId: mockChainId,
			fee: FeeTier.MEDIUM,
		});

		expect(result.data).toBeUndefined();
		expect(result.isLoading).toBe(false);
		expect(result.error).toBeDefined();
	});

	it("should handle pool creation error", async () => {
		const mockTokenInstances = [
			new Token(1, mockTokens[0], 18, "TOKEN0", "Token 0"),
			new Token(1, mockTokens[1], 18, "TOKEN1", "Token 1"),
		];

		const mockPoolData = [
			[mockTokens[0], mockTokens[1], FeeTier.MEDIUM, 60, zeroAddress],
			["invalid", 0, 0, 0, 0, 0],
			"1000000000000000000",
		];

		mockGetInstance.mockReturnValueOnce({
			getClient: vi.fn(),
			getContractAddress: vi.fn(() => "0xMockAddress"),
		});

		mockGetTokenInstances.mockResolvedValueOnce(mockTokenInstances);
		mockUseReadContracts.mockReturnValueOnce({
			data: mockPoolData,
			isLoading: false,
		});

		const result = await getPool({
			tokens: mockTokens,
			chainId: mockChainId,
			fee: FeeTier.MEDIUM,
		});

		expect(result.data).toBeUndefined();
		expect(result.isLoading).toBe(false);
		expect(result.error).toBeDefined();
	});
});
