import { getChainById } from '@/constants/chains'
import type { BuildSwapCallDataParams } from '@/types'
import type { UniDevKitV4Config, UniDevKitV4Instance } from '@/types/core'
import type {
  BuildAddLiquidityCallDataResult,
  BuildAddLiquidityParams,
} from '@/types/utils/buildAddLiquidityCallData'
import type { PoolParams } from '@/types/utils/getPool'
import type { GetPoolKeyFromPoolIdParams } from '@/types/utils/getPoolKeyFromPoolId'
import type { GetPositionParams, GetPositionResponse } from '@/types/utils/getPosition'
import type { QuoteParams, QuoteResponse } from '@/types/utils/getQuote'
import type { GetTokensParams } from '@/types/utils/getTokens'
import type {
  PreparePermit2BatchDataParams,
  PreparePermit2BatchDataResult,
  PreparePermit2DataParams,
  PreparePermit2DataResult,
} from '@/types/utils/permit2'
import { buildAddLiquidityCallData } from '@/utils/buildAddLiquidityCallData'
import { buildSwapCallData } from '@/utils/buildSwapCallData'
import { getPool } from '@/utils/getPool'
import { getPoolKeyFromPoolId } from '@/utils/getPoolKeyFromPoolId'
import { getPosition } from '@/utils/getPosition'
import { getQuote } from '@/utils/getQuote'
import { getTokens } from '@/utils/getTokens'
import { preparePermit2BatchData } from '@/utils/preparePermit2BatchData'
import { preparePermit2Data } from '@/utils/preparePermit2Data'
import type { Currency } from '@uniswap/sdk-core'
import type { Pool, PoolKey } from '@uniswap/v4-sdk'
import type { Abi, Address, PublicClient } from 'viem'
import { http, createPublicClient } from 'viem'

/**
 * Main class for interacting with Uniswap V4 contracts.
 * Provides a flexible and scalable way to interact with different chains
 * and contracts without requiring multiple instances.
 */
export class UniDevKitV4 {
  private instance: UniDevKitV4Instance

  /**
   * Creates a new UniDevKitV4 instance.
   * @param config @type {UniDevKitV4Config}
   * @throws Will throw an error if the configuration is invalid.
   */
  constructor(config: UniDevKitV4Config) {
    const chain = getChainById(config.chainId)
    const client = createPublicClient({
      chain,
      transport: http(config.rpcUrl || chain.rpcUrls.default.http[0]),
    })

    this.instance = {
      client: client as PublicClient,
      chain,
      contracts: config.contracts,
    }
  }

  /**
   * Returns the current PublicClient instance.
   * @returns The current PublicClient.
   */
  getClient(): UniDevKitV4Instance['client'] {
    return this.instance.client
  }

  /**
   * Returns the current chain ID.
   * @returns The chain ID currently configured.
   */
  getChainId(): number {
    return this.instance.chain.id
  }

  /**
   * Returns the current set of contract addresses.
   * @returns An object containing the configured contract addresses.
   */
  getContracts(): UniDevKitV4Config['contracts'] {
    return this.instance.contracts
  }

  /**
   * Returns the address of a specific contract.
   * @param name @type {keyof UniDevKitV4Config["contracts"]}
   * @returns The address of the specified contract.
   * @throws Will throw an error if the contract address is not found.
   */
  getContractAddress(name: keyof UniDevKitV4Config['contracts']): Address {
    const address = this.instance.contracts[name]
    if (!address) {
      throw new Error(`Contract address for ${name} not found.`)
    }
    return address
  }

  /**
   * Loads the ABI for a specific contract using dynamic imports.
   * This method is used internally to lazy load ABIs only when needed.
   * @param name @type {keyof UniDevKitV4Config["contracts"]}
   * @returns Promise resolving to the contract's ABI
   * @throws Will throw an error if the contract ABI is not found
   * @private
   */
  private async loadAbi(name: keyof UniDevKitV4Config['contracts']): Promise<Abi> {
    const abiMap: Record<keyof UniDevKitV4Config['contracts'], () => Promise<Abi> | null> = {
      poolManager: () => import('@/constants/abis/V4PoolManager').then((m) => m.default),
      positionManager: () => import('@/constants/abis/V4PositionMananger').then((m) => m.default),
      positionDescriptor: () => null, // TODO: add position descriptor abi
      quoter: () => import('@/constants/abis/V4Quoter').then((m) => m.default),
      stateView: () => import('@/constants/abis/V4StateView').then((m) => m.default),
      universalRouter: () => import('@/constants/abis/V4UniversalRouter').then((m) => m.default),
    }

    const loader = abiMap[name]
    if (!loader) {
      throw new Error(`Contract abi for ${name} not found.`)
    }
    const abi = await loader()
    if (abi === null) {
      throw new Error(`Contract abi for ${name} not found.`)
    }
    return abi
  }

  /**
   * Retrieves the ABI for a specific contract.
   * This method uses dynamic imports to load ABIs on demand, reducing the initial bundle size.
   * @param name @type {keyof UniDevKitV4Config["contracts"]}
   * @returns Promise resolving to the contract's ABI
   * @throws Will throw an error if the contract ABI is not found
   * @example
   * ```typescript
   * const poolManagerAbi = await uniDevKit.getContractAbi('poolManager');
   * ```
   */
  async getContractAbi(name: keyof UniDevKitV4Config['contracts']): Promise<Abi> {
    return this.loadAbi(name)
  }

  /**
   * Retrieves a Uniswap V4 pool instance for a given token pair.
   * @param params @type {PoolParams}
   * @returns Promise resolving to pool data
   * @throws Error if pool data cannot be fetched
   */
  async getPool(params: PoolParams): Promise<Pool> {
    return getPool(params, this.instance)
  }

  /**
   * Retrieves token information for a given array of token addresses.
   * @param params @type {GetTokensParams}
   * @returns Promise resolving to Token instances for each token address.
   * @throws Error if token data cannot be fetched
   */
  async getTokens(params: GetTokensParams): Promise<Currency[]> {
    return getTokens(params, this.instance)
  }

  /**
   * Retrieves a Uniswap V4 position information for a given token ID.
   * @param params @type {GetPositionParams}
   * @returns Promise resolving to position data including pool, token0, token1, poolId, and tokenId
   * @throws Error if SDK instance is not found or if position data is invalid
   */
  async getPosition(params: GetPositionParams): Promise<GetPositionResponse> {
    return getPosition(params, this.instance)
  }

  /**
   * Retrieves a Uniswap V4 quote for a given token pair and amount in.
   * @param params @type {QuoteParams}
   * @returns Promise resolving to quote data including amount out, estimated gas used, and timestamp
   * @throws Error if SDK instance is not found or if quote data is invalid
   */
  async getQuote(params: QuoteParams): Promise<QuoteResponse> {
    return getQuote(params, this.instance)
  }

  /**
   * Retrieves a Uniswap V4 pool key from a given pool ID.
   * @param params @type {GetPoolKeyFromPoolIdParams}
   * @returns Promise resolving to pool key data including pool address, token0, token1, and fee
   * @throws Error if SDK instance is not found or if pool key data is invalid
   */
  async getPoolKeyFromPoolId(params: GetPoolKeyFromPoolIdParams): Promise<PoolKey> {
    return getPoolKeyFromPoolId(params, this.instance)
  }

  /**
   * Builds a swap call data for a given swap parameters.
   * @param params @type {BuildSwapCallDataParams}
   * @returns Promise resolving to swap call data including calldata and value
   * @throws Error if SDK instance is not found or if swap call data is invalid
   */
  async buildSwapCallData(params: BuildSwapCallDataParams) {
    return buildSwapCallData(params, this.instance)
  }

  /**
   * Builds a add liquidity call data for a given add liquidity parameters.
   * @param params @type {BuildAddLiquidityParams}
   * @returns Promise resolving to add liquidity call data including calldata and value
   * @throws Error if SDK instance is not found or if add liquidity call data is invalid
   */
  async buildAddLiquidityCallData(
    params: BuildAddLiquidityParams,
  ): Promise<BuildAddLiquidityCallDataResult> {
    return buildAddLiquidityCallData(params, this.instance)
  }

  /**
   * Prepares the permit2 batch data for multiple tokens. (Used to add liquidity)
   * Use toSign.values to sign the permit2 batch data.
   * @param params @type {PreparePermit2BatchDataParams}
   * @returns Promise resolving to permit2 batch data
   * @throws Error if SDK instance is not found or if permit2 batch data is invalid
   */
  async preparePermit2BatchData(
    params: PreparePermit2BatchDataParams,
  ): Promise<PreparePermit2BatchDataResult> {
    return preparePermit2BatchData(params, this.instance)
  }

  /**
   * Prepares the permit2 simple data for a single token. (Used to swap)
   * Use toSign.values to sign the permit2 simple data.
   * @param params @type {PreparePermit2DataParams}
   * @returns Promise resolving to permit2 simple data
   * @throws Error if SDK instance is not found or if permit2 simple data is invalid
   */
  async preparePermit2Data(params: PreparePermit2DataParams): Promise<PreparePermit2DataResult> {
    return preparePermit2Data(params, this.instance)
  }
}
