import { V4PositionManager } from '@uniswap/v4-sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockSdkInstance } from '@/test/helpers/sdkInstance'
import { createMockPositionData } from '@/test/helpers/testFactories'
import { getPosition } from '@/utils/getPosition'

const instance = createMockSdkInstance()
const mockPosition = createMockPositionData()

vi.mock('@/utils/getPosition', () => ({
  getPosition: vi.fn(),
}))

vi.mock('@/utils/getDefaultDeadline', () => ({
  getDefaultDeadline: vi.fn().mockResolvedValue('1234567890'),
}))

describe('buildRemoveLiquidityCallData', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should build calldata for removing liquidity', async () => {
    vi.mocked(getPosition).mockResolvedValueOnce(mockPosition)
    vi.spyOn(V4PositionManager, 'removeCallParameters').mockReturnValueOnce({
      calldata: '0x123',
      value: '0',
    })

    const { buildRemoveLiquidityCallData } = await import('@/utils/buildRemoveLiquidityCallData')
    const result = await buildRemoveLiquidityCallData(
      { liquidityPercentage: 10_000, tokenId: '1', deadline: '123' },
      instance,
    )

    expect(result.calldata).toBe('0x123')
    expect(result.value).toBe('0')
  })

  it('should use custom slippageTolerance', async () => {
    vi.mocked(getPosition).mockResolvedValueOnce(mockPosition)
    const spy = vi.spyOn(V4PositionManager, 'removeCallParameters').mockReturnValueOnce({
      calldata: '0xabc',
      value: '1',
    })

    const { buildRemoveLiquidityCallData } = await import('@/utils/buildRemoveLiquidityCallData')
    await buildRemoveLiquidityCallData(
      { liquidityPercentage: 5000, tokenId: '1', slippageTolerance: 123, deadline: '123' },
      instance,
    )

    expect(spy).toHaveBeenCalledWith(
      mockPosition.position,
      expect.objectContaining({ slippageTolerance: expect.any(Object) }),
    )
  })

  it('should throw if position not found', async () => {
    vi.mocked(getPosition).mockResolvedValueOnce(undefined as any)

    const { buildRemoveLiquidityCallData } = await import('@/utils/buildRemoveLiquidityCallData')
    await expect(
      buildRemoveLiquidityCallData({ liquidityPercentage: 10_000, tokenId: '404' }, instance),
    ).rejects.toThrow('Position not found')
  })

  it('should throw if V4PositionManager throws', async () => {
    vi.mocked(getPosition).mockResolvedValueOnce(mockPosition)
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
