import { createMockSdkInstance } from "@/test/helpers/sdkInstance";
import { getQuote } from "@/utils/getQuote";
import type { Abi } from "viem";
import type { SimulateContractReturnType } from "viem/actions";
import { describe, expect, it, vi } from "vitest";

describe("getQuote", () => {
	it("should throw error if SDK instance not found", async () => {
		const mockDeps = createMockSdkInstance();
		mockDeps.client.simulateContract = vi
			.fn()
			.mockRejectedValueOnce(new Error("SDK not found"));

		await expect(
			getQuote(
				{
					tokens: ["0x123", "0x456"],
					zeroForOne: true,
					amountIn: BigInt(1000000),
					feeTier: 3000,
				},
				mockDeps,
			),
		).rejects.toThrow("SDK not found");
	});

	it("should handle quote simulation", async () => {
		const mockDeps = createMockSdkInstance();
		mockDeps.client.simulateContract = vi.fn().mockResolvedValueOnce({
			result: [BigInt(1000000), BigInt(21000)],
		} as SimulateContractReturnType<Abi, "quoteExactInputSingle", [[unknown]]>);

		const result = await getQuote(
			{
				tokens: ["0x123", "0x456"],
				zeroForOne: true,
				amountIn: BigInt(1000000),
				feeTier: 3000,
			},
			mockDeps,
		);

		expect(result).toEqual({
			amountOut: BigInt(1000000),
			estimatedGasUsed: BigInt(21000),
			timestamp: expect.any(Number),
		});
	});
});
