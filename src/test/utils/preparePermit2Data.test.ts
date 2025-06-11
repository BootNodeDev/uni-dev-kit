import { createMockSdkInstance } from '@/test/helpers/sdkInstance'
import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import { type Block, zeroAddress } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { preparePermit2Data } from '../../utils/preparePermit2Data'

describe('preparePermit2Data', () => {
  const mockInstance = createMockSdkInstance()
  const mockBlockTimestamp = 1234567890n

  const mockParams = {
    token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    spender: '0x1234567890123456789012345678901234567890',
    owner: '0x0987654321098765432109876543210987654321',
  }

  beforeEach(() => {
    vi.spyOn(mockInstance.client, 'readContract').mockImplementation(async () => ({
      amount: '0',
      expiration: '0',
      nonce: '0',
    }))
    vi.spyOn(mockInstance.client, 'getBlock').mockResolvedValue({
      timestamp: mockBlockTimestamp,
    } as Block)
  })

  it('should throw error for native token', async () => {
    await expect(
      preparePermit2Data(
        {
          ...mockParams,
          token: zeroAddress,
        },
        mockInstance,
      ),
    ).rejects.toThrow('Native tokens are not supported for permit2')
  })

  it('should prepare permit2 data with default sigDeadline', async () => {
    const result = await preparePermit2Data(mockParams, mockInstance)

    expect(result.owner).toBe(mockParams.owner)
    expect(result.permit.details.token).toBe(mockParams.token)
    expect(result.permit.spender).toBe(mockParams.spender)
    expect(result.permit.sigDeadline).toBe(Number(mockBlockTimestamp) + 3600) // block timestamp + 1 hour
    expect(result.toSign.domain).toBeDefined()
    expect(result.toSign.types).toBeDefined()
    expect(result.toSign.values).toBeDefined()
    expect(result.buildPermit2DataWithSignature).toBeDefined()
  })

  it('should prepare permit2 data with custom sigDeadline', async () => {
    const customDeadline = Number(mockBlockTimestamp) + 7200 // 2 hours from now
    const result = await preparePermit2Data(
      {
        ...mockParams,
        sigDeadline: customDeadline,
      },
      mockInstance,
    )

    expect(result.permit.sigDeadline).toBe(customDeadline)
  })

  it('should build permit2 data with signature', async () => {
    const result = await preparePermit2Data(mockParams, mockInstance)
    const signature = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    const permitWithSignature = result.buildPermit2DataWithSignature(signature)

    expect(permitWithSignature).toEqual({
      owner: mockParams.owner,
      permit: result.permit,
      signature,
    })
  })

  it('should fetch current allowance details', async () => {
    const mockAllowance = {
      amount: '1000000',
      expiration: '1234567890',
      nonce: '42',
    }

    vi.spyOn(mockInstance.client, 'readContract').mockImplementationOnce(async () => mockAllowance)

    const result = await preparePermit2Data(mockParams, mockInstance)

    expect(mockInstance.client.readContract).toHaveBeenCalledWith({
      address: PERMIT2_ADDRESS,
      abi: expect.any(Array),
      functionName: 'allowance',
      args: [mockParams.owner, mockParams.token, mockParams.spender],
    })

    expect(result.permit.details.expiration).toBe(mockAllowance.expiration)
    expect(result.permit.details.nonce).toBe(mockAllowance.nonce)
  })
})
