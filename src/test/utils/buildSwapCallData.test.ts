import { zeroAddress } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import { createMockSdkInstance } from '@/test/helpers/sdkInstance'
import { createTestPool, USDC, WETH } from '@/test/helpers/testFactories'
import { buildSwapCallData } from '@/utils/buildSwapCallData'
import * as getQuoteModule from '@/utils/getQuote'

const sdkInstance = createMockSdkInstance()

// Mock getQuote to return a fixed amount
vi.spyOn(getQuoteModule, 'getQuote').mockImplementation(async () => ({
  amountOut: BigInt(1000000000000000000), // 1 WETH
  estimatedGasUsed: BigInt(100000),
  timestamp: Date.now(),
}))

describe('buildSwapCallData', () => {
  const mockTokens = [USDC.address as `0x${string}`, WETH.address as `0x${string}`] as const
  const mockPool = createTestPool()

  it.each([
    { tokenIn: mockTokens[0], amountIn: BigInt(1000000), description: 'USDC to WETH' },
    { tokenIn: mockTokens[1], amountIn: BigInt(1000000000000000000), description: 'WETH to USDC' },
  ])('should build swap calldata for $description', async ({ tokenIn, amountIn }) => {
    const params = {
      tokenIn,
      amountIn,
      slippageTolerance: 50,
      pool: mockPool,
      recipient: zeroAddress,
    }

    const calldata = await buildSwapCallData(params, sdkInstance)
    expect(calldata).toMatch(/^0x[a-fA-F0-9]+$/)
    expect(calldata.length).toBeGreaterThan(10) // Basic validation it's not empty
  })

  it('should handle different slippage tolerances', async () => {
    const params = {
      tokenIn: mockTokens[0],
      amountIn: BigInt(1000000),
      slippageTolerance: 100, // 1%
      pool: mockPool,
      recipient: zeroAddress,
    }

    const calldata = await buildSwapCallData(params, sdkInstance)
    expect(calldata).toMatch(/^0x[a-fA-F0-9]+$/)
  })
})
