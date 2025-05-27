import type { UniDevKitV4Instance } from "@/types/core";
import type { GetTokensParams } from "@/types/utils/getTokens";
import { Token } from "@uniswap/sdk-core";
import { erc20Abi, zeroAddress } from "viem";

/**
 * Retrieves Token instances for a list of token addresses on a specific chain.
 * @param params Parameters including token addresses
 * @param instance UniDevKitV4Instance
 * @returns Promise resolving to array of Token instances
 * @throws Error if token data cannot be fetched
 */
export async function getTokens(
	params: GetTokensParams,
	instance: UniDevKitV4Instance,
): Promise<Token[]> {
	const { addresses } = params;
	const { client, chain } = instance;

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
						chain.id,
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
				tokens.push(new Token(chain.id, address, decimals, symbol, name));
			}
		}

		return tokens;
	} catch (err) {
		throw new Error(`Failed to fetch token data: ${(err as Error).message}`);
	}
}
