import { getInstance } from "@/core/uniDevKitV4Factory";
import { Token } from "@uniswap/sdk-core";
import { type Address, erc20Abi } from "viem";

/**
 * Retrieves Token instances for a list of token addresses on a specific chain.
 * @param {Object} params - The parameters object
 * @param {[Address, ...Address[]]} params.addresses - Array of token contract addresses (at least one)
 * @param {number} params.chainId - The chain ID where the tokens exist
 * @returns {Promise<Token[] | null>} Array of Token instances or null if the operation fails
 * @throws {Error} If SDK instance is not found
 */
export async function getTokenInstances({
	addresses,
	chainId,
}: {
	addresses: [Address, ...Address[]];
	chainId: number;
}): Promise<Token[] | null> {
	const sdk = getInstance(chainId);

	if (!sdk) {
		throw new Error("SDK not found. Please create an instance first.");
	}

	const client = sdk.getClient();

	const calls = addresses.flatMap((address) => [
		{ address, abi: erc20Abi, functionName: "symbol" },
		{ address, abi: erc20Abi, functionName: "name" },
		{ address, abi: erc20Abi, functionName: "decimals" },
	]);

	try {
		const results = await client.multicall({
			contracts: calls,
			allowFailure: false,
		});

		const tokens: Token[] = [];
		let resultIndex = 0;

		for (const address of addresses) {
			const symbol = results[resultIndex++] as string;
			const name = results[resultIndex++] as string;
			const decimals = results[resultIndex++] as number;

			tokens.push(new Token(chainId, address, decimals, symbol, name) as Token);
		}

		return tokens;
	} catch (err) {
		console.error("getTokenInstances failed:", err);
		return null;
	}
}
