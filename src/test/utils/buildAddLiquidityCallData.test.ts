import { createMockSdkInstance } from '@/test/helpers/sdkInstance'
import { buildAddLiquidityCallData } from '@/utils/buildAddLiquidityCallData'
import { Token } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v4-sdk'
import { parseUnits } from 'viem'
import { describe, expect, it } from 'vitest'

describe('buildAddLiquidityCallData', () => {
  const instance = createMockSdkInstance()

  const token0 = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6)
  const token1 = new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18)

  const pool = new Pool(
    token0,
    token1,
    3000,
    60, // tickSpacing
    '0x1111111111111111111111111111111111111111', // hooks (dummy valid address)
    '79228162514264337593543950336', // sqrtPriceX96
    '1000000', // liquidity
    0, // tick
  )

  it('should build add liquidity calldata with both amounts', async () => {
    const params = {
      pool,
      amount0: parseUnits('100', 6).toString(),
      amount1: parseUnits('0.04', 18).toString(),
      recipient: '0x1234567890123456789012345678901234567890',
    }

    const result = await buildAddLiquidityCallData(params, instance)

    expect(result).toBeDefined()
    expect(result.calldata).toBeDefined()
    expect(result.value).toBeDefined()
  })

  it('should build add liquidity calldata with only amount0', async () => {
    const params = {
      pool,
      amount0: parseUnits('100', 6).toString(),
      recipient: '0x1234567890123456789012345678901234567890',
    }

    const result = await buildAddLiquidityCallData(params, instance)

    expect(result).toBeDefined()
    expect(result.calldata).toBeDefined()
    expect(result.value).toBeDefined()
  })

  it('should build add liquidity calldata with permit2 batch signature', async () => {
    const params = {
      pool,
      amount0: parseUnits('100', 6).toString(),
      recipient: '0x1234567890123456789012345678901234567890',
      permit2BatchSignature: {
        owner: '0x0987654321098765432109876543210987654321',
        permitBatch: {
          details: [
            {
              token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
              amount: '100000000',
              expiration: Math.floor(Date.now() / 1000) + 1800,
              nonce: 0,
            },
          ],
          spender: '0x1234567890123456789012345678901234567890',
          sigDeadline: Math.floor(Date.now() / 1000) + 1800,
        },
        signature:
          '0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
      },
    }

    const result = await buildAddLiquidityCallData(params, instance)

    expect(result).toBeDefined()
    expect(result.calldata).toBeDefined()
    expect(result.value).toBeDefined()
  })

  it('should throw error when neither amount0 nor amount1 is provided', async () => {
    const params = {
      pool,
      recipient: '0x1234567890123456789012345678901234567890',
    }

    await expect(buildAddLiquidityCallData(params, instance)).rejects.toThrow(
      'At least one of amount0 or amount1 must be provided.',
    )
  })
})
