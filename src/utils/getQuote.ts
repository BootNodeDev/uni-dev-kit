import { V4QuoterAbi } from "@/constants/abis/V4Quoter";
import { getInstance } from "@/core/uniDevKitV4Factory";
import { sortTokens } from "@/helpers/tokens";
import { FeeTier, TICK_SPACING_BY_FEE } from "@/types/utils/getPool";
import type { QuoteParams, QuoteResponse } from "@/types/utils/getQuote";
import { zeroAddress } from "viem";

/**
 * Fetches a quote for a token swap using the V4 Quoter contract.
 * This function constructs the pool key from the given tokens and parameters,
 * and then simulates the quote to estimate the output amount.
 *
 * @param params - The parameters required for the quote, including tokens, fee tier, tick spacing, and amount.
 * @param chainId - (Optional) The chain ID to use. If only one instance is registered, this is not required.
 * @returns A Promise that resolves to the quote result, including the amount out and gas estimate.
 * @throws Will throw an error if:
 * - SDK instance is not found
 * - Simulation fails (e.g., insufficient liquidity, invalid parameters)
 * - Contract call reverts
 */
export async function getQuote(
	params: QuoteParams,
	chainId?: number,
): Promise<QuoteResponse> {
	const sdk = getInstance(chainId);
	if (!sdk) {
		throw new Error("SDK not found. Please create an instance first.");
	}
	const client = sdk.getClient();
	const quoterAddress = sdk.getContractAddress("quoter");

	try {
		// Sort tokens to ensure consistent pool key ordering
		const [currency0, currency1] = sortTokens(
			params.tokens[0],
			params.tokens[1],
		);

		// Use provided tick spacing or derive from fee tier
		const fee = (params.feeTier ?? FeeTier.MEDIUM) as FeeTier;
		const tickSpacing = params.tickSpacing ?? TICK_SPACING_BY_FEE[fee];

		// Construct the poolKey
		const poolKey = {
			currency0,
			currency1,
			fee,
			tickSpacing,
			hooks: params.hooks || zeroAddress,
		};

		// Build the parameters for quoteExactInputSingle
		const quoteParams = {
			poolKey,
			zeroForOne: params.zeroForOne,
			exactAmount: params.amountIn,
			hookData: params.hookData || "0x",
		};

		// Simulate the quote to estimate the amount out
		const simulation = await client.simulateContract({
			address: quoterAddress,
			abi: V4QuoterAbi,
			functionName: "quoteExactInputSingle",
			args: [quoteParams],
		});

		// Extract the results
		const [amountOut, gasEstimate] = simulation.result as [bigint, bigint];

		return {
			amountOut,
			estimatedGasUsed: gasEstimate,
			timestamp: Date.now(),
		};
	} catch (error) {
		console.error("Error simulating quote:", error);
		throw new Error(`Failed to fetch quote: ${(error as Error).message}`);
	}
}
