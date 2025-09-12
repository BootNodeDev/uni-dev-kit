import { parseUnits } from 'viem'
import { describe, expect, it } from 'vitest'
import { createMockSdkInstance } from '@/test/helpers/sdkInstance'
import { createTestPool, TEST_ADDRESSES } from '@/test/helpers/testFactories'
import { buildAddLiquidityCallData } from '@/utils/buildAddLiquidityCallData'

describe('buildAddLiquidityCallData', () => {
  const instance = createMockSdkInstance()
  const pool = createTestPool()

  it('should build add liquidity calldata with both amounts', async () => {
    const params = {
      pool,
      amount0: parseUnits('100', 6).toString(),
      amount1: parseUnits('0.04', 18).toString(),
      recipient: TEST_ADDRESSES.recipient,
    }

    const result = await buildAddLiquidityCallData(params, instance)

    expect(result.calldata).toMatch(/^0x[a-fA-F0-9]+$/)
    expect(result.value).toMatch(/^0x[a-fA-F0-9]+$/)
    expect(result.calldata.length).toBeGreaterThan(10)
  })

  it('should build add liquidity calldata with only amount0', async () => {
    const params = {
      pool,
      amount0: parseUnits('100', 6).toString(),
      recipient: TEST_ADDRESSES.recipient,
    }

    const result = await buildAddLiquidityCallData(params, instance)

    expect(result.calldata).toMatch(/^0x[a-fA-F0-9]+$/)
    expect(result.value).toMatch(/^0x[a-fA-F0-9]+$/)
  })

  it('should build add liquidity calldata with permit2 batch signature', async () => {
    const params = {
      pool,
      amount0: parseUnits('100', 6).toString(),
      recipient: TEST_ADDRESSES.recipient,
      permit2BatchSignature: {
        owner: TEST_ADDRESSES.user,
        permitBatch: {
          details: [
            {
              token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
              amount: '100000000',
              expiration: Math.floor(Date.now() / 1000) + 1800,
              nonce: 0,
            },
          ],
          spender: TEST_ADDRESSES.recipient,
          sigDeadline: Math.floor(Date.now() / 1000) + 1800,
        },
        signature:
          '0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
      },
    }

    const result = await buildAddLiquidityCallData(params, instance)

    expect(result.calldata).toMatch(/^0x[a-fA-F0-9]+$/)
    expect(result.value).toMatch(/^0x[a-fA-F0-9]+$/)
  })

  it('should throw error when neither amount0 nor amount1 is provided', async () => {
    const params = {
      pool,
      recipient: TEST_ADDRESSES.recipient,
    }

    await expect(buildAddLiquidityCallData(params, instance)).rejects.toThrow(
      'At least one of amount0 or amount1 must be provided.',
    )
  })
})
