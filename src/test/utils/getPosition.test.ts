import { createMockSdkInstance } from '@/test/helpers/sdkInstance'
import { getPosition } from '@/utils/getPosition'
import { Token } from '@uniswap/sdk-core'
import type { Address } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/getTokens', () => ({
  getTokens: vi.fn(),
}))

// Mock decodePositionInfo para devolver ticks válidos
vi.mock('@/helpers/positions', () => ({
  decodePositionInfo: () => ({ tickLower: -887220, tickUpper: 887220 }),
}))

describe('getPosition', () => {
  // USDC and WETH on Mainnet
  const mockTokens: [Address, Address] = [
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  ]
  const validHooks = '0x000000000000000000000000000000000000dead'

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should throw error if SDK instance not found', async () => {
    const mockDeps = createMockSdkInstance()
    mockDeps.client.multicall = vi.fn().mockRejectedValueOnce(new Error('SDK not initialized'))

    await expect(getPosition({ tokenId: '1' }, mockDeps)).rejects.toThrow('SDK not initialized')
  })

  it('should throw error if tokens not found', async () => {
    const mockDeps = createMockSdkInstance()
    mockDeps.client.multicall = vi.fn().mockResolvedValueOnce([
      [
        {
          currency0: '0x123',
          currency1: '0x456',
          fee: 3000,
          tickSpacing: 60,
          hooks: validHooks,
        },
        {},
      ],
      1000000n,
    ])

    await expect(getPosition({ tokenId: '1' }, mockDeps)).rejects.toThrow('Tokens not found')
  })

  it('should throw error if liquidity is 0', async () => {
    const mockDeps = createMockSdkInstance()
    mockDeps.client.multicall = vi.fn().mockResolvedValueOnce([
      [
        {
          currency0: '0x123',
          currency1: '0x456',
          fee: 3000,
          tickSpacing: 60,
          hooks: validHooks,
        },
        {},
      ],
      0n,
    ])

    await expect(getPosition({ tokenId: '1' }, mockDeps)).rejects.toThrow('Liquidity is 0')
  })

  it('should return position data when position exists', async () => {
    const mockDeps = createMockSdkInstance()
    // Primer multicall: [poolAndPositionInfo, liquidity]
    mockDeps.client.multicall = vi
      .fn()
      .mockResolvedValueOnce([
        [
          {
            currency0: mockTokens[0],
            currency1: mockTokens[1],
            fee: 3000,
            tickSpacing: 60,
            hooks: validHooks,
          },
          1n,
        ],
        1000000n,
      ])
      // Segundo multicall: [slot0, poolLiquidity]
      .mockResolvedValueOnce([[79228162514264337593543950336n, 0], 1000000n])

    // Mock getTokens para devolver instancias reales de Token
    const mockToken0 = new Token(1, mockTokens[0], 6, 'USDC', 'USD Coin')
    const mockToken1 = new Token(1, mockTokens[1], 18, 'WETH', 'Wrapped Ether')
    const { getTokens } = await import('@/utils/getTokens')
    vi.mocked(getTokens).mockResolvedValueOnce([mockToken0, mockToken1])

    const result = await getPosition({ tokenId: '1' }, mockDeps)

    expect(result).toHaveProperty('position')
    expect(result).toHaveProperty('pool')
    expect(result).toHaveProperty('token0')
    expect(result).toHaveProperty('token1')
    expect(result).toHaveProperty('poolId')
    expect(result).toHaveProperty('tokenId', '1')
  })
})
