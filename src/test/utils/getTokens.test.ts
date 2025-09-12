import { Ether, Token } from '@uniswap/sdk-core'
import { type Address, zeroAddress } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockSdkInstance } from '@/test/helpers/sdkInstance'
import { getTokens } from '@/utils/getTokens'

vi.mock('@/constants/chains', () => ({
  getChainById: () => ({
    nativeCurrency: {
      decimals: 18,
      symbol: 'ETH',
      name: 'Ethereum',
    },
  }),
}))

describe('getTokens', () => {
  // USDC and WETH on Mainnet
  const mockTokens: [Address, ...Address[]] = [
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  ]

  let mockDeps: ReturnType<typeof createMockSdkInstance>

  beforeEach(() => {
    vi.resetAllMocks()
    mockDeps = createMockSdkInstance()
  })

  it('should throw error if multicall fails', async () => {
    vi.mocked(mockDeps.client.multicall).mockRejectedValueOnce(new Error('Multicall failed'))

    await expect(
      getTokens(
        {
          addresses: mockTokens,
        },
        mockDeps,
      ),
    ).rejects.toThrow('Failed to fetch token data: Multicall failed')
  })

  it('should handle native currency (zero address)', async () => {
    const mockResults = [
      'USDC', // symbol for first token
      'USD Coin', // name for first token
      6, // decimals for first token
    ]

    vi.mocked(mockDeps.client.multicall).mockResolvedValueOnce(mockResults)

    const result = await getTokens(
      {
        addresses: [mockTokens[0], zeroAddress],
      },
      mockDeps,
    )

    expect(result).toHaveLength(2)
    expect(result[0]).toBeInstanceOf(Token)
    expect(result[1]).toBeInstanceOf(Ether)
  })

  it('should return token instances for valid addresses', async () => {
    const mockResults = [
      'USDC', // symbol for first token
      'USD Coin', // name for first token
      6, // decimals for first token
      'WETH', // symbol for second token
      'Wrapped Ether', // name for second token
      18, // decimals for second token
    ]

    vi.mocked(mockDeps.client.multicall).mockResolvedValueOnce(mockResults)

    const result = await getTokens(
      {
        addresses: mockTokens,
      },
      mockDeps,
    )

    expect(result).toHaveLength(2)
    expect(result[0]).toBeInstanceOf(Token)
    expect(result[1]).toBeInstanceOf(Token)
    expect(result[0].symbol).toBe('USDC')
    expect(result[1].symbol).toBe('WETH')
  })
})
