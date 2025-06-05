import type { UniDevKitV4Instance } from "@/types/core";
import { http, createPublicClient } from "viem";
import { mainnet } from "viem/chains";
import { vi } from "vitest";

export const createMockSdkInstance = (
	overrides?: Partial<UniDevKitV4Instance>,
): UniDevKitV4Instance => {
	const client = createPublicClient({
		chain: mainnet,
		transport: http(),
	});

	// Mock the multicall function
	vi.spyOn(client, "multicall").mockImplementation(async () => []);

	return {
		client,
		chain: mainnet,
		contracts: {
			poolManager: "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8",
			positionDescriptor: "0x91a40C733c97c6Dc441A0071F8FbF4907dd13151",
			positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
			quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
			stateView: "0x4eD4C8B7eF27d4d242c4D1267E1B1E39c14b9E73",
			universalRouter: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
		},
		...overrides,
	};
};
