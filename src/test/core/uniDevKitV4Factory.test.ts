import {
	createInstance,
	getInstance,
	listChainIds,
	removeInstance,
	resetInstances,
} from "@/core/uniDevKitV4Factory";
import type { UniDevKitV4Config } from "@/types";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("UniDevKitV4Factory", () => {
	let config: UniDevKitV4Config;

	beforeEach(() => {
		config = {
			chainId: 1,
			rpcUrl: "https://eth.llamarpc.com",
			contracts: {
				poolManager: "0x1234567890123456789012345678901234567890",
				positionDescriptor: "0x1234567890123456789012345678901234567890",
				positionManager: "0x1234567890123456789012345678901234567890",
				quoter: "0x1234567890123456789012345678901234567890",
				stateView: "0x1234567890123456789012345678901234567890",
				universalRouter: "0x1234567890123456789012345678901234567890",
				permit2: "0x1234567890123456789012345678901234567890",
			},
		};
	});

	afterEach(() => {
		resetInstances();
	});

	it("should create and get instance", () => {
		const instance = createInstance(config);
		const retrievedInstance = getInstance(config.chainId);
		expect(retrievedInstance).toBe(instance);
	});

	it("should reuse existing instance", () => {
		const instance1 = createInstance(config);
		const instance2 = createInstance(config);
		expect(instance1).toBe(instance2);
	});

	it("should list chain IDs", () => {
		createInstance(config);
		const chainIds = listChainIds();
		expect(chainIds).toContain(config.chainId);
	});

	it("should remove instance", () => {
		createInstance(config);
		removeInstance(config.chainId);
		expect(() => getInstance(config.chainId)).toThrow();
	});

	it("should reset all instances", () => {
		createInstance(config);
		resetInstances();
		expect(() => getInstance(config.chainId)).toThrow();
	});

	it("should throw when getting non-existent instance", () => {
		expect(() => getInstance(999)).toThrow();
	});

	it("should get default instance when only one chain is configured", () => {
		const instance = createInstance(config);
		const defaultInstance = getInstance();
		expect(defaultInstance).toBe(instance);
	});

	it("should throw when getting default instance with multiple chains", () => {
		createInstance(config);
		createInstance({ ...config, chainId: 8453 });
		expect(() => getInstance()).toThrow(
			"Multiple instances found. Please specify a chain ID. Available chains: 1, 8453",
		);
	});

	describe("Multiple chain configurations", () => {
		it("should handle multiple chains with different RPCs", () => {
			const mainnet = createInstance(config);
			const base = createInstance({
				...config,
				chainId: 8453,
				rpcUrl: "https://base-rpc.com",
			});
			const arbitrum = createInstance({
				...config,
				chainId: 42161,
				rpcUrl: "https://arbitrum-rpc.com",
			});

			expect(getInstance(1)).toBe(mainnet);
			expect(getInstance(8453)).toBe(base);
			expect(getInstance(42161)).toBe(arbitrum);
		});

		it("should handle multiple chains with different native currencies", () => {
			const mainnet = createInstance(config);
			const polygon = createInstance({
				...config,
				chainId: 137,
			});

			expect(getInstance(1)).toBe(mainnet);
			expect(getInstance(137)).toBe(polygon);
		});

		it("should list all configured chain IDs", () => {
			createInstance(config); // mainnet
			createInstance({ ...config, chainId: 8453 }); // base
			createInstance({ ...config, chainId: 137 }); // polygon

			const chainIds = listChainIds();
			expect(chainIds).toHaveLength(3);
			expect(chainIds).toContain(1);
			expect(chainIds).toContain(8453);
			expect(chainIds).toContain(137);
		});

		it("should remove specific chain instance", () => {
			createInstance(config); // mainnet
			createInstance({ ...config, chainId: 8453 }); // base
			createInstance({ ...config, chainId: 137 }); // polygon

			removeInstance(8453);
			const chainIds = listChainIds();
			expect(chainIds).toHaveLength(2);
			expect(chainIds).not.toContain(8453);
			expect(() => getInstance(8453)).toThrow();
		});
	});
});
