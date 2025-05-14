import { supportedChains } from "@/config";
import { UNISWAP_V4_DEPLOYMENTS } from "@/constants/uniswap";
import type { UniDevKitConfig, UniDevKitInstance } from "@/types";
import {
	createPublicClient,
	http,
	type Address,
	type Chain,
	type PublicClient,
} from "viem";

export class UniDevKit {
	public instance: UniDevKitInstance;

	constructor(config: UniDevKitConfig) {
		const chain = supportedChains.find((chain) => chain.id === config.chainId);
		if (!chain) {
			throw new Error(`Chain ID ${config.chainId} not supported`);
		}

		const deployment = UNISWAP_V4_DEPLOYMENTS[config.chainId];
		if (!deployment) {
			throw new Error(`Chain ID ${config.chainId} not supported`);
		}

		const client = createPublicClient({
			chain: chain as Chain,
			transport: http(config.rpcUrl),
		}) as PublicClient;

		this.instance = {
			client,
			chainId: config.chainId,
			contracts: {
				poolManager: deployment.CONTRACTS.POOL_MANAGER as Address,
				positionDescriptor: deployment.CONTRACTS.POSITION_DESCRIPTOR as Address,
				positionManager: deployment.CONTRACTS.POSITION_MANAGER as Address,
				quoter: deployment.CONTRACTS.QUOTER as Address,
				stateView: deployment.CONTRACTS.STATE_VIEW as Address,
				universalRouter: deployment.CONTRACTS.UNIVERSAL_ROUTER as Address,
				permit2: deployment.CONTRACTS.PERMIT2 as Address,
			},
		};
	}

	getClient(): PublicClient {
		return this.instance.client;
	}

	getChainId(): number {
		return this.instance.chainId;
	}

	getContracts() {
		return this.instance.contracts;
	}
}
