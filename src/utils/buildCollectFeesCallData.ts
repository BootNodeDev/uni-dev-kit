import { DEFAULT_SLIPPAGE_TOLERANCE } from '@/constants/common'
import { percentFromBips } from '@/helpers/percent'
import type { UniDevKitV4Instance } from '@/types'
import type { BuildCollectFeesCallDataParams } from '@/types/utils/buildCollectFeesCallData'
import { getDefaultDeadline } from '@/utils/getDefaultDeadline'
import { getPosition } from '@/utils/getPosition'
import { V4PositionManager } from '@uniswap/v4-sdk'

/**
 * Builds the calldata and value required to collect fees from a Uniswap v4 position.
 *
 * @param params - The parameters for collecting fees.
 * @param instance - The UniDevKit instance for accessing pool state.
 * @returns An object containing the calldata and the value to send with the transaction.
 *
 * @example
 * ```ts
 * const { calldata, value } = await buildCollectFeesCallData({
 *   tokenId: '1234',
 *   recipient: userAddress,
 *   slippageTolerance: 50, // 0.5%
 *   deadline: '1234567890',
 * }, instance)
 *
 * const tx = await sendTransaction({
 *   to: PositionManager.address,
 *   data: calldata,
 *   value,
 * })
 * ```
 */
export async function buildCollectFeesCallData(
  {
    tokenId,
    recipient,
    deadline: deadlineParam,
    slippageTolerance,
  }: BuildCollectFeesCallDataParams,
  instance: UniDevKitV4Instance,
) {
  const positionData = await getPosition({ tokenId }, instance)
  if (!positionData) {
    throw new Error('Position not found')
  }

  const deadline = deadlineParam ?? (await getDefaultDeadline(instance)).toString()

  try {
    const { calldata, value } = V4PositionManager.collectCallParameters(positionData.position, {
      recipient,
      deadline,
      tokenId,
      slippageTolerance: percentFromBips(slippageTolerance ?? DEFAULT_SLIPPAGE_TOLERANCE),
    })

    return {
      calldata,
      value,
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}
