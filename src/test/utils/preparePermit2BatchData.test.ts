import { describe, expect, it, vi } from 'vitest'
import { createMockSdkInstance } from '@/test/helpers/sdkInstance'
import { preparePermit2BatchData } from '@/utils/preparePermit2BatchData'

describe('preparePermit2BatchData', () => {
  const instance = createMockSdkInstance()

  // Mock multicall response
  vi.spyOn(instance.client, 'multicall').mockImplementation(async () => [
    {
      amount: 0n,
      expiration: 0n,
      nonce: 0n,
    },
    {
      amount: 0n,
      expiration: 0n,
      nonce: 0n,
    },
  ])

  it('should prepare permit2 batch data correctly', async () => {
    const params = {
      tokens: [
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      ],
      spender: '0x1234567890123456789012345678901234567890',
      owner: '0x0987654321098765432109876543210987654321',
    }

    const result = await preparePermit2BatchData(params, instance)

    expect(result).toBeDefined()
    expect(result.owner).toBe(params.owner)
    expect(result.permitBatch.spender).toBe(params.spender)
    expect(result.permitBatch.details).toHaveLength(2)
    expect(result.toSign.domain).toBeDefined()
    expect(result.toSign.types).toBeDefined()
    expect(result.toSign.values).toBeDefined()
  })

  it('should handle native token (zero address) correctly', async () => {
    const params = {
      tokens: [
        '0x0000000000000000000000000000000000000000',
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      ],
      spender: '0x1234567890123456789012345678901234567890',
      owner: '0x0987654321098765432109876543210987654321',
    }

    const result = await preparePermit2BatchData(params, instance)

    expect(result.permitBatch.details).toHaveLength(1)
    expect(result.permitBatch.details[0].token).toBe('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
  })

  it('should build permit2 batch data with signature correctly', async () => {
    const params = {
      tokens: ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
      spender: '0x1234567890123456789012345678901234567890',
      owner: '0x0987654321098765432109876543210987654321',
    }

    const result = await preparePermit2BatchData(params, instance)
    const signature =
      '0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'

    const permitWithSignature = result.buildPermit2BatchDataWithSignature(signature)

    expect(permitWithSignature).toBeDefined()
    expect(permitWithSignature.owner).toBe(params.owner)
    expect(permitWithSignature.permitBatch).toBe(result.permitBatch)
    expect(permitWithSignature.signature).toBe(signature)
  })

  it('should use provided sigDeadline if available', async () => {
    const sigDeadline = Math.floor(Date.now() / 1000) + 3600
    const params = {
      tokens: ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
      spender: '0x1234567890123456789012345678901234567890',
      owner: '0x0987654321098765432109876543210987654321',
      sigDeadline,
    }

    const result = await preparePermit2BatchData(params, instance)

    expect(result.permitBatch.sigDeadline).toBe(sigDeadline)
  })
})
