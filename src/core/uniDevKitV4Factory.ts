import { UniDevKitV4 } from "@/core/uniDevKitV4";
import type { UniDevKitV4Config } from "@/types/core";

const instances = new Map<number, UniDevKitV4>();

/**
 * Singleton factory for managing multiple UniDevKitV4 instances.
 * This approach ensures that each chain has a single instance,
 * reducing the risk of duplicate clients and configuration mismatches.
 */
export function createInstance(config: UniDevKitV4Config): UniDevKitV4 {
	const { chainId } = config;

	// Return existing instance if it exists
	if (instances.has(chainId)) {
		console.warn(
			`Instance for chain ID ${chainId} already exists. Reusing existing instance.`,
		);
		const instance = instances.get(chainId);
		if (!instance)
			throw new Error("Unexpected: Instance not found after has check");
		return instance;
	}

	// Create a new instance if it doesn't exist
	const instance = new UniDevKitV4(config);
	instances.set(chainId, instance);
	return instance;
}

/**
 * Retrieves an existing UniDevKitV4 instance.
 * If there is only one instance, it returns it without requiring a chain ID.
 * If there are multiple instances, it requires a chain ID.
 * @param chainId - (Optional) The chain ID to retrieve.
 * @returns The existing UniDevKitV4 instance.
 * @throws Will throw an error if the instance does not exist.
 */
export function getInstance(chainId?: number): UniDevKitV4 {
	const instanceCount = instances.size;

	// Return the single instance if there's only one
	if (instanceCount === 1 && !chainId) {
		return Array.from(instances.values())[0];
	}

	// Require chainId if there are multiple instances
	if (instanceCount > 1 && !chainId) {
		throw new Error(
			`Multiple instances found. Please specify a chain ID. Available chains: ${listChainIds().join(", ")}`,
		);
	}

	if (!chainId) throw new Error("Chain ID is required");
	// Return the instance for the specified chain ID
	const instance = instances.get(chainId);
	if (!instance) {
		throw new Error(
			`No instance found for chain ID ${chainId}. Make sure to call createInstance() first.`,
		);
	}

	return instance;
}

/**
 * Clears all registered instances.
 */
export function resetInstances(): void {
	instances.clear();
}

/**
 * Lists all registered chain IDs.
 * @returns An array of all registered chain IDs.
 */
export function listChainIds(): number[] {
	return Array.from(instances.keys());
}

/**
 * Removes a specific instance by chain ID.
 * @param chainId - The chain ID to remove.
 */
export function removeInstance(chainId: number): void {
	instances.delete(chainId);
}
