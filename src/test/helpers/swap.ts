import { Percent } from "@uniswap/sdk-core";

/**
 * Utility function to calculate minimum output amount based on slippage
 * Uses Uniswap SDK's Percent class for accurate calculations
 *
 * @param expectedOutput - Expected output amount
 * @param slippageTolerance - Slippage tolerance in basis points
 * @returns Minimum output amount accounting for slippage
 */
export function calculateMinimumOutput(
	expectedOutput: bigint,
	slippageTolerance: number,
): bigint {
	// Use SDK's Percent class for precise slippage calculations
	const slippagePercent = new Percent(slippageTolerance, 10_000);
	const slippageDecimal = Number.parseFloat(slippagePercent.toFixed(18));
	const slippageAmount = BigInt(
		Math.floor(Number(expectedOutput) * slippageDecimal),
	);

	return expectedOutput - slippageAmount;
}
