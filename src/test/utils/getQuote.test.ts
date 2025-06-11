import { createMockSdkInstance } from '@/test/helpers/sdkInstance'
import { getQuote } from '@/utils/getQuote'
import type { Pool } from '@uniswap/v4-sdk'
import type { Abi } from 'viem'
import type { SimulateContractReturnType } from 'viem/actions'
import { describe, expect, it, vi } from 'vitest'

const mockPool: Pool = {
  poolKey: {
    currency0: '0x123',
    currency1: '0x456',
    fee: 3000,
    tickSpacing: 10,
    hooks: '0x',
  },
} as Pool

describe('getQuote', () => {
  it('should throw error if SDK instance not found', async () => {
    const mockDeps = createMockSdkInstance()
    mockDeps.client.simulateContract = vi.fn().mockRejectedValueOnce(new Error('SDK not found'))

    await expect(
      getQuote(
        {
          pool: mockPool,
          amountIn: BigInt(1000000),
          zeroForOne: true,
        },
        mockDeps,
      ),
    ).rejects.toThrow('SDK not found')
  })

  it('should handle quote simulation', async () => {
    const mockDeps = createMockSdkInstance()
    mockDeps.client.simulateContract = vi.fn().mockResolvedValueOnce({
      result: [BigInt(1000000), BigInt(21000)],
    } as SimulateContractReturnType<Abi, 'quoteExactInputSingle', [[unknown]]>)

    const result = await getQuote(
      {
        pool: mockPool,
        amountIn: BigInt(1000000),
        zeroForOne: true,
      },
      mockDeps,
    )

    expect(result).toEqual({
      amountOut: BigInt(1000000),
      estimatedGasUsed: BigInt(21000),
      timestamp: expect.any(Number),
    })
  })
})
