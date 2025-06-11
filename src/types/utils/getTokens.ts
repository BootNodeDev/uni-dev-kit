import type { Address } from 'viem'

/**
 * Parameters for getTokens function
 */
export interface GetTokensParams {
  /** Array of token contract addresses (at least one) */
  addresses: [Address, ...Address[]]
}
