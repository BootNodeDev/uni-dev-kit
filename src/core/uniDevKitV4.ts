import { getChainById } from "@/constants/chains";
import type { UniDevKitV4Config, UniDevKitV4Instance } from "@/types/core";
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
		this.instance = this.createInstance(config);
	}

	/**
	 * Creates a new internal instance for the SDK.
	 * This method is used internally to reset the instance when the configuration changes.
	 * @param config - The complete configuration for the SDK.
	 * @returns A new instance of UniDevKitV4.
	 */
	private createInstance(config: UniDevKitV4Config): UniDevKitV4Instance {
		const client = this.createClient(config);
		return {
			client: client as PublicClient,
			chainId: config.chainId,
			contracts: config.contracts,
		};
	}

	/**
	 * Creates a new PublicClient for the specified chain ID and RPC URL.
	 * @param config - The complete configuration for the SDK.
	 * @returns A new PublicClient instance.
	 */
	private createClient(config: UniDevKitV4Config) {
		const { chainId, rpcUrl } = config;

		const chain = getChainById(chainId);

		return createPublicClient({
			chain,
			transport: http(rpcUrl || chain.rpcUrls.default.http[0]),
		});
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
		return this.instance.chainId;
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
	 * Updates the SDK configuration with a complete new set of parameters.
	 * This method will reset the client and instance to reflect the new configuration.
	 * @param config - The complete configuration for the SDK.
	 * @throws Will throw an error if the configuration is invalid.
	 */
	updateConfig(config: UniDevKitV4Config): void {
		this.instance = this.createInstance(config);
	}
}
