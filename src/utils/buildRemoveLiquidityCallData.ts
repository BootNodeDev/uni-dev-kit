import { DEFAULT_SLIPPAGE_TOLERANCE } from '@/constants/common'
import { percentFromBips } from '@/helpers/percent'
import type { UniDevKitV4Instance } from '@/types'
import { getDefaultDeadline } from '@/utils/getDefaultDeadline'
import { getPosition } from '@/utils/getPosition'
import { V4PositionManager } from '@uniswap/v4-sdk'

/**
 * Parameters required to build the calldata for removing liquidity from a Uniswap v4 position.
 */
export interface BuildRemoveLiquidityCallDataParams {
  /**
   * The percentage of liquidity to remove from the position.
   */
  liquidityPercentage: number

  /**
   * The tokenId of the position to remove liquidity from.
   */
  tokenId: string

  /**
   * The slippage tolerance for the transaction.
   */
  slippageTolerance?: number

  /**
   * The deadline for the transaction. (default: 5 minutes from now)
   */
  deadline?: string
}

/**
 * Builds the calldata and value required to remove liquidity from a Uniswap v4 position.
 *
 * @param params - The parameters for removing liquidity.
 * @returns An object containing the calldata and the value to send with the transaction.
 *
 * @example
 * ```typescript
 * const { calldata, value } = buildRemoveLiquidityCallData({
 *   position,
 *   liquidityPercentage: 10_000, // 100%
 * });
 *
 * const tx = await sendTransaction({
 *   to: PositionManager.address,
 *   data: calldata,
 *   value: value,
 * });
 * ```
 */
export async function buildRemoveLiquidityCallData(
  {
    liquidityPercentage,
    deadline: deadlineParam,
    slippageTolerance,
    tokenId,
  }: BuildRemoveLiquidityCallDataParams,
  instance: UniDevKitV4Instance,
) {
  // Get position data
  const positionData = await getPosition({ tokenId }, instance)
  if (!positionData) {
    throw new Error('Position not found')
  }

  const deadline = deadlineParam ?? (await getDefaultDeadline(instance)).toString()

  // Build remove liquidity call data
  try {
    const { calldata, value } = V4PositionManager.removeCallParameters(positionData.position, {
      slippageTolerance: percentFromBips(slippageTolerance ?? DEFAULT_SLIPPAGE_TOLERANCE),
      deadline: deadline,
      liquidityPercentage: percentFromBips(liquidityPercentage),
      tokenId: tokenId,
    })

    return {
      calldata: calldata,
      value: value,
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}
