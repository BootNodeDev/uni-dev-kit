import {
	arbitrum,
	avalanche,
	base,
	blast,
	bsc,
	celo,
	mainnet,
	optimism,
	polygon,
	worldchain,
	zksync,
	zora,
} from "wagmi/chains";
// uniswap supported chains
/* 
Ethereum
Arbitrum
Optimism
Polygon
Base
BNB
Avalanche C-Chain
CELO
Blast
ZKsync
Zora
WorldChain
*/

export const supportedChains = [
	arbitrum,
	optimism,
	polygon,
	base,
	bsc,
	avalanche,
	celo,
	blast,
	zksync,
	zora,
	worldchain,
	mainnet,
] as const;

export const getChainById = (chainId: number) => {
	const chain = supportedChains.find((chain) => chain.id === chainId);
	if (!chain) {
		throw new Error(`Chain with id ${chainId} not found`);
	}
	return chain;
};
