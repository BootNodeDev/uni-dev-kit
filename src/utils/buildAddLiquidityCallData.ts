import { encodeSqrtRatioX96, nearestUsableTick, TickMath } from '@uniswap/v3-sdk'
import { Position, V4PositionManager } from '@uniswap/v4-sdk'
import { DEFAULT_SLIPPAGE_TOLERANCE } from '@/constants/common'
import { percentFromBips } from '@/helpers/percent'
import type { UniDevKitV4Instance } from '@/types'
import type {
  BuildAddLiquidityCallDataResult,
  BuildAddLiquidityParams,
} from '@/types/utils/buildAddLiquidityCallData'
import { getDefaultDeadline } from '@/utils/getDefaultDeadline'

/**
 * Builds the calldata and native value required to add liquidity to a Uniswap V4 pool.
 *
 * This function supports flexible input handling. The caller may specify:
 * - Only `amount0`
 * - Only `amount1`
 * - Or both `amount0` and `amount1`
 *
 * The behavior depends on whether the pool has existing liquidity:
 *
 * - If the pool **already has liquidity**, only one of the amounts is required.
 *   The other will be computed internally using the current price of the pool.
 *
 * - If the pool **does not have liquidity** (i.e. is being created),
 *   both `amount0` and `amount1` are required in order to compute the initial price
 *   (`sqrtPriceX96`) using `encodeSqrtRatioX96(amount1, amount0)`.
 *
 * - The amounts must be matching the pool's token0 and token1.
 * - The amounts must be in the same decimals as the pool's token0 and token1.
 *
 * The function also supports optional parameters for tick range, slippage tolerance,
 * deadline, and Permit2 batch signature for token approvals.
 *
 * @param params - The full set of parameters for building the add liquidity calldata.
 * @param instance - An instance of the UniDevKitV4 context, providing access to the connected RPC client.
 *
 * @returns An object containing:
 * - `calldata`: The ABI-encoded calldata for the `mint` operation.
 * - `value`: The native value (in wei, as string) to send with the transaction, if required.
 *
 * @throws If neither `amount0` nor `amount1` is provided.
 * @throws If the pool has no liquidity and only one of the amounts is provided.
 * @throws If tick bounds or permit2 data is invalid during calldata generation.
 * @example
 * ```typescript
 * const params = {
 *   pool: pool,
 *   amount0: parseUnits("100", 6), // 100 USDC
 *   amount1: parseEther("0.04"), // 0.04 WETH
 *   recipient: "0x...",
 *   ... // other optional params
 * };
 *
 * const { calldata, value } = await buildAddLiquidityCallData(params, instance);
 *
 * // Send transaction
 * const tx = await sendTransaction({
 *   to: V4PositionManager.address,
 *   data: calldata,
 *   value,
 * });
 * ```
 */

export async function buildAddLiquidityCallData(
  params: BuildAddLiquidityParams,
  instance: UniDevKitV4Instance,
): Promise<BuildAddLiquidityCallDataResult> {
  const {
    pool,
    amount0,
    amount1,
    recipient,
    tickLower: tickLowerParam,
    tickUpper: tickUpperParam,
    slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE,
    deadline: deadlineParam,
    permit2BatchSignature,
  } = params

  try {
    const deadline = deadlineParam ?? (await getDefaultDeadline(instance)).toString()

    const slippagePercent = percentFromBips(slippageTolerance)
    const createPool = pool.liquidity.toString() === '0'

    const tickLower = tickLowerParam ?? nearestUsableTick(TickMath.MIN_TICK, pool.tickSpacing)
    const tickUpper = tickUpperParam ?? nearestUsableTick(TickMath.MAX_TICK, pool.tickSpacing)

    // Validate input
    if (!amount0 && !amount1) {
      throw new Error('At least one of amount0 or amount1 must be provided.')
    }

    let sqrtPriceX96: string
    if (createPool) {
      if (!amount0 || !amount1) {
        throw new Error('Both amount0 and amount1 are required when creating a new pool.')
      }
      sqrtPriceX96 = encodeSqrtRatioX96(amount1, amount0).toString()
    } else {
      sqrtPriceX96 = pool.sqrtRatioX96.toString()
    }

    // Build position
    let position: Position
    if (amount0 && amount1) {
      position = Position.fromAmounts({
        pool,
        tickLower,
        tickUpper,
        amount0,
        amount1,
        useFullPrecision: true,
      })
    } else if (amount0) {
      position = Position.fromAmount0({
        pool,
        tickLower,
        tickUpper,
        amount0,
        useFullPrecision: true,
      })
    } else if (amount1) {
      position = Position.fromAmount1({
        pool,
        tickLower,
        tickUpper,
        amount1,
      })
    } else {
      throw new Error('Invalid input: at least one of amount0 or amount1 must be defined.')
    }

    // Get native currency
    const nativeCurrency = pool.token0.isNative
      ? pool.token0
      : pool.token1.isNative
        ? pool.token1
        : undefined

    // Build calldata
    const { calldata, value } = V4PositionManager.addCallParameters(position, {
      recipient,
      deadline,
      slippageTolerance: slippagePercent,
      createPool,
      sqrtPriceX96,
      useNative: nativeCurrency,
      batchPermit: permit2BatchSignature
        ? {
            owner: permit2BatchSignature.owner,
            permitBatch: permit2BatchSignature.permitBatch,
            signature: permit2BatchSignature.signature,
          }
        : undefined,
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
