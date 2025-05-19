import { getQuote } from "@/utils/getQuote";
import { describe, expect, it, vi } from "vitest";

const mockGetInstance = vi.fn();

vi.mock("@/core/uniDevKitV4Factory", () => ({
	getInstance: () => mockGetInstance(),
}));

describe("getQuote", () => {
	it("should throw error if SDK instance not found", async () => {
		mockGetInstance.mockReturnValueOnce(undefined);
		await expect(
			getQuote({
				tokens: ["0x123", "0x456"],
				feeTier: 3000,
				tickSpacing: 60,
				amountIn: BigInt(1000000),
				zeroForOne: true,
			}),
		).rejects.toThrow();
	});

	it("should sort tokens consistently", async () => {
		mockGetInstance.mockReturnValueOnce({
			getClient: () => ({
				simulateContract: vi
					.fn()
					.mockResolvedValue({ result: [BigInt(1000000), BigInt(21000)] }),
			}),
			getContractAddress: vi.fn(() => "0xMockQuoterAddress"),
		});
		const result = await getQuote({
			tokens: ["0x123", "0x456"],
			feeTier: 3000,
			tickSpacing: 60,
			amountIn: BigInt(1000000),
			zeroForOne: true,
		});
		expect(result).toHaveProperty("amountOut", BigInt(1000000));
		expect(result).toHaveProperty("estimatedGasUsed", BigInt(21000));
		expect(result).toHaveProperty("timestamp");
	});

	it("should handle quote simulation", async () => {
		mockGetInstance.mockReturnValueOnce({
			getClient: () => ({
				simulateContract: vi
					.fn()
					.mockResolvedValue({ result: [BigInt(1000000), BigInt(21000)] }),
			}),
			getContractAddress: vi.fn(() => "0xMockQuoterAddress"),
		});
		const result = await getQuote({
			tokens: ["0x123", "0x456"],
			feeTier: 3000,
			tickSpacing: 60,
			amountIn: BigInt(1000000),
			zeroForOne: true,
		});
		expect(result).toHaveProperty("amountOut", BigInt(1000000));
		expect(result).toHaveProperty("estimatedGasUsed", BigInt(21000));
		expect(result).toHaveProperty("timestamp");
	});
});
