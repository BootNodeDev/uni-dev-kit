import { Percent } from '@uniswap/sdk-core'
import { type Position, V4PositionManager } from '@uniswap/v4-sdk'

/**
 * Parameters required to build the calldata for removing liquidity from a Uniswap v4 position.
 */
export interface BuildRemoveLiquidityCallDataParams {
  /**
   * The position object representing the liquidity position to modify.
   */
  position: Position

  /**
   * The percentage of liquidity to remove from the position.
   */
  liquidityPercentage: number

  /**
   * The deadline for the transaction.
   */
  deadline: string

  /**
   * The slippage tolerance for the transaction.
   */
  slippageTolerance: number

  /**
   * The tokenId of the position to remove liquidity from.
   */
  tokenId: string
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
 *   liquidityPercentage: new Percent(1, 1), // 100%
 * });
 *
 * const tx = await sendTransaction({
 *   to: PositionManager.address,
 *   data: calldata,
 *   value: value,
 * });
 * ```
 */
export function buildRemoveLiquidityCallData({
  position,
  liquidityPercentage,
  deadline,
  slippageTolerance,
  tokenId,
}: BuildRemoveLiquidityCallDataParams) {
  try {
    const { calldata, value } = V4PositionManager.removeCallParameters(position, {
      slippageTolerance: new Percent(slippageTolerance, 100),
      deadline: deadline,
      liquidityPercentage: new Percent(liquidityPercentage, 100),
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
