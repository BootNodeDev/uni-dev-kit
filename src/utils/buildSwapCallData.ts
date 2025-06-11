import { calculateMinimumOutput } from '@/helpers/swap'
import { type BuildSwapCallDataParams, COMMANDS } from '@/types'
import type { UniDevKitV4Instance } from '@/types/core'
import { getQuote } from '@/utils/getQuote'
import type { PermitSingle } from '@uniswap/permit2-sdk'
import { Actions, V4Planner } from '@uniswap/v4-sdk'
import { ethers } from 'ethers'
import type { Hex } from 'viem'

const buildPermit2StructInput = (permit: PermitSingle, signature: Hex) => {
  return ethers.utils.defaultAbiCoder.encode(
    [
      'tuple(' +
        'tuple(address token,uint160 amount,uint48 expiration,uint48 nonce) details,' +
        'address spender,' +
        'uint256 sigDeadline' +
        ')',
      'bytes',
    ],
    [permit, signature],
  )
}

/**
 * Builds calldata for a Uniswap V4 swap
 *
 * This function creates the necessary calldata to execute a token swap through
 * Uniswap V4's Universal Router. It handles pool discovery, parameter encoding,
 * and deadline management.
 *
 * @param params - Swap configuration parameters
 * @param instance - UniDevKitV4 instance for pool operations
 * @returns Promise resolving to encoded calldata
 *
 * @throws Error if pool doesn't exist
 *
 * @example
 * ```typescript
 * // Basic swap
 * const swapParams = {
 *   tokenIn: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
 *   amountIn: parseUnits("100", 6), // 100 USDC
 *   pool: pool,
 *   slippageTolerance: 50, // 0.5%
 * };
 *
 * const calldata = await buildSwapCallData(swapParams, instance);
 *
 * // Swap with permit2
 * const permitData = await preparePermit2Data({
 *   token: tokenIn,
 *   spender: universalRouterAddress,
 *   owner: userAddress
 * }, instance);
 *
 * const signature = await signer._signTypedData(permitData.toSign);
 * const permitWithSignature = permitData.buildPermit2DataWithSignature(signature);
 *
 * const swapParamsWithPermit = {
 *   ...swapParams,
 *   permit2Signature: permitWithSignature
 * };
 *
 * const calldataWithPermit = await buildSwapCallData(swapParamsWithPermit, instance);
 *
 * // Send transaction
 * const tx = await sendTransaction({
 *   to: universalRouterAddress,
 *   data: calldata,
 *   value: 0,
 * });
 * ```
 */
export async function buildSwapCallData(
  params: BuildSwapCallDataParams,
  instance: UniDevKitV4Instance,
): Promise<Hex> {
  // Extract and set default parameters
  const { tokenIn, amountIn, pool, slippageTolerance = 50, permit2Signature, recipient } = params

  const zeroForOne = tokenIn.toLowerCase() === pool.poolKey.currency0.toLowerCase()

  // Get quote and calculate minimum output amount
  const quote = await getQuote(
    {
      pool,
      amountIn,
      zeroForOne,
    },
    instance,
  )

  // Calculate minimum output amount based on slippage
  const amountOutMinimum = calculateMinimumOutput(quote.amountOut, slippageTolerance)

  const planner = new V4Planner()

  planner.addAction(Actions.SWAP_EXACT_IN_SINGLE, [
    {
      poolKey: pool.poolKey,
      zeroForOne,
      amountIn: amountIn.toString(),
      amountOutMinimum: amountOutMinimum.toString(),
      hookData: '0x',
    },
  ])

  const currencyIn = zeroForOne ? pool.currency0 : pool.currency1
  const currencyOut = zeroForOne ? pool.currency1 : pool.currency0

  // Agrega la acción de settle
  planner.addSettle(currencyIn, true)

  // Agrega la acción de take
  planner.addTake(currencyOut, recipient)

  let commands = ethers.utils.solidityPack(['uint8'], [COMMANDS.V4_SWAP])

  if (permit2Signature) {
    commands = ethers.utils.solidityPack(
      ['uint8', 'uint8'],
      [COMMANDS.PERMIT2_PERMIT, COMMANDS.V4_SWAP],
    )
  }

  // Combine actions and params into a single bytes array to match with V4_SWAP command input
  let inputs = [
    // V4_SWAP input
    ethers.utils.defaultAbiCoder.encode(['bytes', 'bytes[]'], [planner.actions, planner.params]),
  ]

  // If permit2Signature is provided, add the permit2 struct input to the inputs array in the first position
  if (permit2Signature) {
    inputs = [
      buildPermit2StructInput(permit2Signature.permit, permit2Signature.signature),
      ethers.utils.defaultAbiCoder.encode(['bytes', 'bytes[]'], [planner.actions, planner.params]),
    ]
  }

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 5) // 5 minutes

  const universalRouterInterface = new ethers.utils.Interface([
    'function execute(bytes commands, bytes[] inputs, uint256 deadline)',
  ])

  // Encode final calldata
  return universalRouterInterface.encodeFunctionData('execute', [commands, inputs, deadline]) as Hex
}
