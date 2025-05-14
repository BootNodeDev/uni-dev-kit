import type { PublicClient } from "viem";

export type GenericProvider = PublicClient;

export type UniDevKitConfig = {
	rpcUrl: string;
	chainId: number;
};

export type UniDevKitInstance = {
	client: PublicClient;
	chainId: number;
	contracts: {
		poolManager: `0x${string}`;
		positionDescriptor: `0x${string}`;
		positionManager: `0x${string}`;
		quoter: `0x${string}`;
		stateView: `0x${string}`;
		universalRouter: `0x${string}`;
		permit2: `0x${string}`;
	};
};

export type UniDevKitContextType = {
	instance: UniDevKitInstance;
};
