import { createMockSdkInstance } from '@/test/helpers/sdkInstance'
import { getPosition } from '@/utils/getPosition'
import { Token } from '@uniswap/sdk-core'
import { Pool, Position, V4PositionManager } from '@uniswap/v4-sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const instance = createMockSdkInstance()

vi.mock('@/utils/getPosition', () => ({
  getPosition: vi.fn(),
}))

const token0 = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
const token1 = new Token(
  1,
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  18,
  'WETH',
  'Wrapped Ether',
)
const pool = new Pool(
  token0,
  token1,
  3000,
  60,
  '0x1111111111111111111111111111111111111111',
  '79228162514264337593543950336',
  '1000000', // liquidity as string
  0,
)
const position = new Position({ pool, liquidity: '1000000', tickLower: -60, tickUpper: 60 }) // liquidity as string

const mockPosition = {
  position,
  pool,
  token0,
  token1,
  poolId: '0x1111111111111111111111111111111111111111' as `0x${string}`,
  tokenId: '1',
}

describe('buildRemoveLiquidityCallData', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should build calldata for removing 100% liquidity', async () => {
    vi.mock('@/utils/getDefaultDeadline', () => ({
      getDefaultDeadline: vi.fn().mockResolvedValue('1234567890'),
    }))
    vi.mocked(getPosition).mockReturnValueOnce(Promise.resolve(mockPosition))
    vi.spyOn(V4PositionManager, 'removeCallParameters').mockReturnValueOnce({
      calldata: '0x123',
      value: '0',
    })
    const { buildRemoveLiquidityCallData } = await import('@/utils/buildRemoveLiquidityCallData')
    const result = await buildRemoveLiquidityCallData(
      {
        liquidityPercentage: 10_000,
        tokenId: '1',
        deadline: '123',
      },
      instance,
    )
    expect(result.calldata).toBe('0x123')
    expect(result.value).toBe('0')
  })

  it('should use custom slippageTolerance', async () => {
    vi.mock('@/utils/getDefaultDeadline', () => ({
      getDefaultDeadline: vi.fn().mockResolvedValue('1234567890'),
    }))
    vi.mocked(getPosition).mockReturnValueOnce(Promise.resolve(mockPosition))
    const spy = vi.spyOn(V4PositionManager, 'removeCallParameters').mockReturnValueOnce({
      calldata: '0xabc',
      value: '1',
    })
    const { buildRemoveLiquidityCallData } = await import('@/utils/buildRemoveLiquidityCallData')
    await buildRemoveLiquidityCallData(
      {
        liquidityPercentage: 5000,
        tokenId: '1',
        slippageTolerance: 123,
        deadline: '123',
      },
      instance,
    )
    expect(spy).toHaveBeenCalledWith(
      mockPosition.position,
      expect.objectContaining({ slippageTolerance: expect.any(Object) }),
    )
  })

  it('should throw if position not found', async () => {
    vi.mock('@/utils/getDefaultDeadline', () => ({
      getDefaultDeadline: vi.fn().mockResolvedValue('1234567890'),
    }))
    vi.mocked(getPosition).mockReturnValueOnce(
      Promise.resolve(undefined as unknown as ReturnType<typeof getPosition>),
    )
    const { buildRemoveLiquidityCallData } = await import('@/utils/buildRemoveLiquidityCallData')
    await expect(
      buildRemoveLiquidityCallData({ liquidityPercentage: 10_000, tokenId: '404' }, instance),
    ).rejects.toThrow('Position not found')
  })

  it('should throw if V4PositionManager throws', async () => {
    vi.mock('@/utils/getDefaultDeadline', () => ({
      getDefaultDeadline: vi.fn().mockResolvedValue('1234567890'),
    }))
    vi.mocked(getPosition).mockReturnValueOnce(Promise.resolve(mockPosition))
    vi.spyOn(V4PositionManager, 'removeCallParameters').mockImplementationOnce(() => {
      throw new Error('fail')
    })
    const { buildRemoveLiquidityCallData } = await import('@/utils/buildRemoveLiquidityCallData')
    await expect(
      buildRemoveLiquidityCallData(
        { liquidityPercentage: 10_000, tokenId: '1', deadline: '123' },
        instance,
      ),
    ).rejects.toThrow('fail')
  })
})
