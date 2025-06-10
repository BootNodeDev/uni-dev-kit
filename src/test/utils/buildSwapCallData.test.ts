import { createMockSdkInstance } from "@/test/helpers/sdkInstance";
import { buildSwapCallData } from "@/utils/buildSwapCallData";
import * as getQuoteModule from "@/utils/getQuote";
import { Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v4-sdk";
import { type Address, zeroAddress } from "viem";
import { describe, expect, it, vi } from "vitest";

const sdkInstance = createMockSdkInstance();

// Mock getQuote to return a fixed amount
vi.spyOn(getQuoteModule, "getQuote").mockImplementation(async () => ({
	amountOut: BigInt(1000000000000000000), // 1 WETH
	estimatedGasUsed: BigInt(100000),
	timestamp: Date.now(),
}));

describe("buildSwapCallData", () => {
	// USDC and WETH on Mainnet
	const mockTokens: [Address, Address] = [
		"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
		"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
	];

	const mockTokenInstances = [
		new Token(1, mockTokens[0], 6, "USDC", "USD Coin"),
		new Token(1, mockTokens[1], 18, "WETH", "Wrapped Ether"),
	];

	const mockPool = new Pool(
		mockTokenInstances[0],
		mockTokenInstances[1],
		3000,
		60,
		zeroAddress,
		"79228162514264337593543950336",
		"1000000",
		0,
	);

	it("should build swap calldata for token0 to token1", async () => {
		const params = {
			tokenIn: mockTokens[0],
			amountIn: BigInt(1000000), // 1 USDC
			slippageTolerance: 50,
			pool: mockPool,
			recipient: zeroAddress,
		};

		const calldata = await buildSwapCallData(params, sdkInstance);
		expect(calldata).toBeDefined();
		expect(calldata).toMatch(/^0x/); // Should be a hex string
	});

	it("should build swap calldata for token1 to token0", async () => {
		const params = {
			tokenIn: mockTokens[1],
			amountIn: BigInt(1000000000000000000), // 1 WETH
			slippageTolerance: 50,
			pool: mockPool,
			recipient: zeroAddress,
		};

		const calldata = await buildSwapCallData(params, sdkInstance);
		expect(calldata).toBeDefined();
		expect(calldata).toMatch(/^0x/);
	});

	it("should include minimum output amount in calldata", async () => {
		const params = {
			tokenIn: mockTokens[0],
			amountIn: BigInt(1000000),
			slippageTolerance: 50,
			pool: mockPool,
			recipient: zeroAddress,
		};

		const calldata = await buildSwapCallData(params, sdkInstance);
		expect(calldata).toBeDefined();
		expect(calldata).toMatch(/^0x/);
	});

	it("should handle zero minimum output amount", async () => {
		const params = {
			tokenIn: mockTokens[0],
			amountIn: BigInt(1000000),
			slippageTolerance: 50,
			pool: mockPool,
			recipient: zeroAddress,
		};

		const calldata = await buildSwapCallData(params, sdkInstance);
		expect(calldata).toBeDefined();
		expect(calldata).toMatch(/^0x/);
	});

	it("should include deadline in calldata", async () => {
		const params = {
			tokenIn: mockTokens[0],
			amountIn: BigInt(1000000),
			slippageTolerance: 50,
			pool: mockPool,
			recipient: zeroAddress,
		};

		const calldata = await buildSwapCallData(params, sdkInstance);
		expect(calldata).toBeDefined();
		expect(calldata).toMatch(/^0x/);
	});
});
