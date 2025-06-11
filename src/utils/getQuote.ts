import V4QuoterAbi from '@/constants/abis/V4Quoter'
import type { UniDevKitV4Instance } from '@/types/core'
import type { QuoteParams, QuoteResponse } from '@/types/utils/getQuote'

/**
 * Fetches a quote for a token swap using the V4 Quoter contract.
 * This function uses the provided pool instance to simulate the quote.
 *
 * @param params - The parameters required for the quote, including pool and amount.
 * @param instance - UniDevKitV4 instance for contract interaction
 * @returns A Promise that resolves to the quote result, including the amount out and gas estimate.
 * @throws Will throw an error if:
 * - Simulation fails (e.g., insufficient liquidity, invalid parameters)
 * - Contract call reverts
 */
export async function getQuote(
  params: QuoteParams,
  instance: UniDevKitV4Instance,
): Promise<QuoteResponse> {
  const { client, contracts } = instance
  const { quoter } = contracts
  const {
    pool: { poolKey },
  } = params

  try {
    // Build the parameters for quoteExactInputSingle
    const quoteParams = {
      poolKey: {
        currency0: poolKey.currency0 as `0x${string}`,
        currency1: poolKey.currency1 as `0x${string}`,
        fee: poolKey.fee,
        tickSpacing: poolKey.tickSpacing,
        hooks: poolKey.hooks as `0x${string}`,
      },
      zeroForOne: params.zeroForOne,
      exactAmount: params.amountIn,
      hookData: params.hookData || '0x',
    }

    // Simulate the quote to estimate the amount out
    const simulation = await client.simulateContract({
      address: quoter,
      abi: V4QuoterAbi,
      functionName: 'quoteExactInputSingle',
      args: [quoteParams],
    })

    // Extract the results
    const [amountOut, gasEstimate] = simulation.result as [bigint, bigint]

    return {
      amountOut,
      estimatedGasUsed: gasEstimate,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('Error simulating quote:', error)
    throw new Error(`Failed to fetch quote: ${(error as Error).message}`)
  }
}
