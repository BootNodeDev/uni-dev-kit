import { getChainById } from "@/constants/chains";
import type { BuildSwapCallDataParams } from "@/types";
import type { UniDevKitV4Config, UniDevKitV4Instance } from "@/types/core";
import type { PoolParams } from "@/types/utils/getPool";
import type { GetPoolKeyFromPoolIdParams } from "@/types/utils/getPoolKeyFromPoolId";
import type {
	GetPositionParams,
	GetPositionResponse,
} from "@/types/utils/getPosition";
import type { QuoteParams, QuoteResponse } from "@/types/utils/getQuote";
import type { GetTokensParams } from "@/types/utils/getTokens";
import type {
	Permit2CallData,
	PermitParams,
	PermitTransferFromTypedData,
} from "@/utils/buildPermit2TypedData";
import {
	buildPermit2DataFromSignature,
	buildPermit2TypedData,
} from "@/utils/buildPermit2TypedData";
import { buildSwapCallData } from "@/utils/buildSwapCallData";
import { getPool } from "@/utils/getPool";
import { getPoolKeyFromPoolId } from "@/utils/getPoolKeyFromPoolId";
import { getPosition } from "@/utils/getPosition";
import { getQuote } from "@/utils/getQuote";
import { getTokens } from "@/utils/getTokens";
import type { Token } from "@uniswap/sdk-core";
import type { Pool, PoolKey } from "@uniswap/v4-sdk";
import type { Abi, Address, Hex, PublicClient } from "viem";
import { http, createPublicClient } from "viem";

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
	 * Loads the ABI for a specific contract using dynamic imports.
	 * This method is used internally to lazy load ABIs only when needed.
	 * @param name - The name of the contract to load the ABI for
	 * @returns Promise resolving to the contract's ABI
	 * @throws Will throw an error if the contract ABI is not found
	 * @private
	 */
	private async loadAbi(
		name: keyof UniDevKitV4Config["contracts"],
	): Promise<Abi> {
		const abiMap: Record<
			keyof UniDevKitV4Config["contracts"],
			() => Promise<Abi> | null
		> = {
			permit2: () => import("@/constants/abis/Permit2").then((m) => m.default),
			poolManager: () =>
				import("@/constants/abis/V4PoolManager").then((m) => m.default),
			positionManager: () =>
				import("@/constants/abis/V4PositionMananger").then((m) => m.default),
			positionDescriptor: () => null, // TODO: add position descriptor abi
			quoter: () => import("@/constants/abis/V4Quoter").then((m) => m.default),
			stateView: () =>
				import("@/constants/abis/V4StateView").then((m) => m.default),
			universalRouter: () =>
				import("@/constants/abis/V4UniversalRouter").then((m) => m.default),
		};

		const loader = abiMap[name];
		if (!loader) {
			throw new Error(`Contract abi for ${name} not found.`);
		}
		const abi = await loader();
		if (abi === null) {
			throw new Error(`Contract abi for ${name} not found.`);
		}
		return abi;
	}

	/**
	 * Retrieves the ABI for a specific contract.
	 * This method uses dynamic imports to load ABIs on demand, reducing the initial bundle size.
	 * @param name - The name of the contract (e.g., "poolManager", "quoter")
	 * @returns Promise resolving to the contract's ABI
	 * @throws Will throw an error if the contract ABI is not found
	 * @example
	 * ```typescript
	 * const poolManagerAbi = await uniDevKit.getContractAbi('poolManager');
	 * ```
	 */
	async getContractAbi(
		name: keyof UniDevKitV4Config["contracts"],
	): Promise<Abi> {
		return this.loadAbi(name);
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

	async buildPermit2TypedData(
		params: PermitParams,
	): Promise<PermitTransferFromTypedData> {
		return buildPermit2TypedData(params, this.instance);
	}

	buildPermit2DataFromSignature(
		typedData: PermitTransferFromTypedData,
		signature: Hex,
		owner: Address,
	): Permit2CallData {
		return buildPermit2DataFromSignature(typedData, signature, owner);
	}

	async buildSwapCallData(params: BuildSwapCallDataParams): Promise<Hex> {
		return buildSwapCallData(params, this.instance);
	}
}
