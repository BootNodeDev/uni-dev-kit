import { getChainById } from "@/constants/chains";
import { getInstance } from "@/core/uniDevKitV4Factory";
import { Token } from "@uniswap/sdk-core";
import { type Address, erc20Abi, zeroAddress } from "viem";

/**
 * Retrieves Token instances for a list of token addresses on a specific chain.
 * @param {Object} params - The parameters object
 * @param {[Address, ...Address[]]} params.addresses - Array of token contract addresses (at least one)
 * @param {number} params.chainId - The chain ID where the tokens exist (optional)
 * @returns {Promise<Token[] | null>} Array of Token instances or null if the operation fails
 * @throws {Error} If SDK instance is not found
 */
export async function getTokens({
	addresses,
	chainId,
}: {
	addresses: [Address, ...Address[]];
	chainId?: number;
}): Promise<Token[] | null> {
	const sdk = getInstance(chainId);
	const currentChainId = chainId || sdk.getChainId();
	const chain = getChainById(currentChainId);

	if (!sdk) {
		throw new Error("SDK not found. Please create an instance first.");
	}

	const client = sdk.getClient();

	const calls = addresses
		.filter((address) => address !== zeroAddress) // filter out native currency
		.flatMap((address) => [
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
			if (address === zeroAddress) {
				// For native currency, use chain data from wagmi
				const nativeCurrency = chain.nativeCurrency;
				tokens.push(
					new Token(
						currentChainId,
						address,
						nativeCurrency.decimals,
						nativeCurrency.symbol,
						nativeCurrency.name,
					),
				);
			} else {
				// For ERC20 tokens, use multicall results
				const symbol = results[resultIndex++] as string;
				const name = results[resultIndex++] as string;
				const decimals = results[resultIndex++] as number;
				tokens.push(new Token(currentChainId, address, decimals, symbol, name));
			}
		}

		return tokens;
	} catch (err) {
		console.error("getTokens failed:", err);
		return null;
	}
}
