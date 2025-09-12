import { Pool } from '@uniswap/v4-sdk'
import { slice, zeroAddress } from 'viem'
import V4PositionManagerAbi from '@/constants/abis/V4PositionMananger'
import V4StateViewAbi from '@/constants/abis/V4StateView'
import { getTickSpacingForFee } from '@/helpers/fees'
import { sortTokens } from '@/helpers/tokens'
import type { UniDevKitV4Instance } from '@/types/core'
import { FeeTier, type PoolParams } from '@/types/utils/getPool'
import { getTokens } from '@/utils/getTokens'

export const DEFAULT_HOOKS = zeroAddress

/**
 * Retrieves a Uniswap V4 pool instance for a given token pair, fee tier, tick spacing, and hooks configuration.
 * @param params Pool parameters including tokens, fee tier, tick spacing, and hooks configuration
 * @param instance UniDevKitV4Instance
 * @returns Promise resolving to pool data
 * @throws Error if SDK instance or token instances are not found or if pool data is not found
 */
export async function getPool(params: PoolParams, instance: UniDevKitV4Instance): Promise<Pool> {
  const { client, contracts } = instance
  const { positionManager, stateView } = contracts

  const { tokens, fee = FeeTier.MEDIUM, tickSpacing, hooks = DEFAULT_HOOKS } = params

  // Use provided tick spacing or derive from fee tier
  const finalTickSpacing = tickSpacing ?? getTickSpacingForFee(fee)

  const [token0, token1] = sortTokens(tokens[0], tokens[1])
  const tokenInstances = await getTokens(
    {
      addresses: [token0, token1],
    },
    instance,
  )

  const poolId32Bytes = Pool.getPoolId(
    tokenInstances[0],
    tokenInstances[1],
    fee,
    finalTickSpacing,
    hooks,
  ) as `0x${string}`

  const poolId25Bytes = slice(poolId32Bytes, 0, 25) as `0x${string}`

  const poolData = await client.multicall({
    allowFailure: false,
    contracts: [
      {
        address: positionManager,
        abi: V4PositionManagerAbi,
        functionName: 'poolKeys',
        args: [poolId25Bytes],
      },
      {
        address: stateView,
        abi: V4StateViewAbi,
        functionName: 'getSlot0',
        args: [poolId32Bytes],
      },
      {
        address: stateView,
        abi: V4StateViewAbi,
        functionName: 'getLiquidity',
        args: [poolId32Bytes],
      },
    ],
  })

  if (!poolData) {
    throw new Error('Failed to fetch pool data')
  }

  const [poolKeysData, slot0Data, liquidityData] = poolData
  const poolExists = poolKeysData && Number(poolKeysData[3]) > 0 && slot0Data && liquidityData

  if (!poolExists) {
    throw new Error('Pool does not exist')
  }

  try {
    const pool = new Pool(
      tokenInstances[0],
      tokenInstances[1],
      fee,
      finalTickSpacing,
      hooks,
      slot0Data[0].toString(),
      liquidityData.toString(),
      Number(slot0Data[1]),
    )

    return pool
  } catch (error) {
    throw new Error(`Error creating pool instance: ${(error as Error).message}`)
  }
}
