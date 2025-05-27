import { getChainById } from "@/constants/chains";
import type { UniDevKitV4Config, UniDevKitV4Instance } from "@/types/core";
import type { PoolParams } from "@/types/utils/getPool";
import type { GetPoolKeyFromPoolIdParams } from "@/types/utils/getPoolKeyFromPoolId";
import type {
	GetPositionParams,
	GetPositionResponse,
} from "@/types/utils/getPosition";
import type { QuoteParams, QuoteResponse } from "@/types/utils/getQuote";
import type { GetTokensParams } from "@/types/utils/getTokens";
import { getPool } from "@/utils/getPool";
import { getPoolKeyFromPoolId } from "@/utils/getPoolKeyFromPoolId";
import { getPosition } from "@/utils/getPosition";
import { getQuote } from "@/utils/getQuote";
import { getTokens } from "@/utils/getTokens";
import type { Token } from "@uniswap/sdk-core";
import type { Pool, PoolKey } from "@uniswap/v4-sdk";
import {
	http,
	type Address,
	type PublicClient,
	createPublicClient,
} from "viem";

/**
 * Main class for interacting with Uniswap V4 contracts.
 * Provides a flexible and scalable way to interact with different chains
 * and contracts without requiring multiple instances.
 */
export class UniDevKitV4 {
	private instance: UniDevKitV4Instance;

	/**
	 * Creates a new UniDevKitV4 instance.
	 * @param config - The complete configuration for the SDK, including chain ID, RPC URL, and contract addresses.
	 * @throws Will throw an error if the configuration is invalid.
	 */
	constructor(config: UniDevKitV4Config) {
		const chain = getChainById(config.chainId);
		const client = createPublicClient({
			chain,
			transport: http(config.rpcUrl || chain.rpcUrls.default.http[0]),
		});

		this.instance = {
			client: client as PublicClient,
			chain,
			contracts: config.contracts,
		};
	}

	/**
	 * Returns the current PublicClient instance.
	 * @returns The current PublicClient.
	 */
	getClient(): UniDevKitV4Instance["client"] {
		return this.instance.client;
	}

	/**
	 * Returns the current chain ID.
	 * @returns The chain ID currently configured.
	 */
	getChainId(): number {
		return this.instance.chain.id;
	}

	/**
	 * Returns the current set of contract addresses.
	 * @returns An object containing the configured contract addresses.
	 */
	getContracts(): UniDevKitV4Config["contracts"] {
		return this.instance.contracts;
	}

	/**
	 * Returns the address of a specific contract.
	 * @param name - The name of the contract (e.g., "quoter", "poolManager").
	 * @returns The address of the specified contract.
	 * @throws Will throw an error if the contract address is not found.
	 */
	getContractAddress(name: keyof UniDevKitV4Config["contracts"]): Address {
		const address = this.instance.contracts[name];
		if (!address) {
			throw new Error(`Contract address for ${name} not found.`);
		}
		return address;
	}

	/**
	 * Retrieves a Uniswap V4 pool instance for a given token pair.
	 * @param params Pool parameters including tokens, fee tier, tick spacing, and hooks configuration
	 * @returns Promise resolving to pool data
	 * @throws Error if pool data cannot be fetched
	 */
	async getPool(params: PoolParams): Promise<Pool> {
		return getPool(params, this.instance);
	}

	/**
	 * Retrieves token information for a given array of token addresses.
	 * @param params Parameters including token addresses
	 * @returns Promise resolving to Token instances for each token address.
	 * @throws Error if token data cannot be fetched
	 */
	async getTokens(params: GetTokensParams): Promise<Token[]> {
		return getTokens(params, this.instance);
	}

	/**
	 * Retrieves a Uniswap V4 position information for a given token ID.
	 * @param params Position parameters including token ID
	 * @returns Promise resolving to position data including pool, token0, token1, poolId, and tokenId
	 * @throws Error if SDK instance is not found or if position data is invalid
	 */
	async getPosition(params: GetPositionParams): Promise<GetPositionResponse> {
		return getPosition(params, this.instance);
	}

	/**
	 * Retrieves a Uniswap V4 quote for a given token pair and amount in.
	 * @param params Quote parameters including token pair and amount in
	 * @returns Promise resolving to quote data including amount out, estimated gas used, and timestamp
	 * @throws Error if SDK instance is not found or if quote data is invalid
	 */
	async getQuote(params: QuoteParams): Promise<QuoteResponse> {
		return getQuote(params, this.instance);
	}

	async getPoolKeyFromPoolId(
		params: GetPoolKeyFromPoolIdParams,
	): Promise<PoolKey> {
		return getPoolKeyFromPoolId(params, this.instance);
	}
}
