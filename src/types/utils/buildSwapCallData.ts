import type { PermitSingle } from '@uniswap/permit2-sdk'
import type { Pool } from '@uniswap/v4-sdk'
import type { Address, Hex } from 'viem'

/**
 * Command codes for Universal Router operations
 * @see https://docs.uniswap.org/contracts/universal-router/technical-reference
 */
export const COMMANDS = {
  PERMIT2_PERMIT: 0x0a,
  SWAP_EXACT_IN_SINGLE: 0x06,
  SETTLE_ALL: 0x0c,
  TAKE_ALL: 0x0f,
  V4_SWAP: 0x10,
} as const

/**
 * Parameters for building a V4 swap
 */
export type BuildSwapCallDataParams = {
  /** Input token address */
  tokenIn: Address
  /** Amount of input tokens to swap (in token's smallest unit) */
  amountIn: bigint
  /** Pool */
  pool: Pool
  /** Slippage tolerance in basis points (e.g., 50 = 0.5%). Defaults to 50 (0.5%) */
  slippageTolerance?: number
  /** Recipient address */
  recipient: Address
  /** Permit2 signature */
  permit2Signature?: {
    signature: Hex
    owner: Address
    permit: PermitSingle
  }
}
