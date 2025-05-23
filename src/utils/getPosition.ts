import { V4PositionManagerAbi } from "@/constants/abis/V4PositionMananger";
import { V4StateViewAbi } from "@/constants/abis/V4StateView";
import { getInstance } from "@/core/uniDevKitV4Factory";
import { decodePositionInfo } from "@/helpers/positions";
import { getTokens } from "@/utils/getTokens";
import type { Token } from "@uniswap/sdk-core";
import { Pool, Position as V4Position } from "@uniswap/v4-sdk";

interface PositionResult {
	token0: Token;
	token1: Token;
	amounts: {
		amount0: string;
		amount1: string;
	};
	tickLower: number;
	tickUpper: number;
	liquidity: bigint;
	poolId: `0x${string}`;
}

export async function getPosition(
	tokenId: string,
	chainId?: number,
): Promise<PositionResult | undefined> {
	const sdk = getInstance(chainId);
	if (!sdk) throw new Error("SDK not initialized");

	const client = sdk.getClient();
	const positionManager = sdk.getContractAddress("positionManager");
	const stateView = sdk.getContractAddress("stateView");

	const [poolAndPositionInfo, liquidity] = await client.multicall({
		allowFailure: false,
		contracts: [
			{
				address: positionManager,
				abi: V4PositionManagerAbi,
				functionName: "getPoolAndPositionInfo",
				args: [BigInt(tokenId)],
			},
			{
				address: positionManager,
				abi: V4PositionManagerAbi,
				functionName: "getPositionLiquidity",
				args: [BigInt(tokenId)],
			},
		],
	});

	const [poolKey, rawInfo] = poolAndPositionInfo;

	const { currency0, currency1, fee, tickSpacing, hooks } = poolKey;

	console.log("poolKey", poolKey);
	console.log("rawInfo", rawInfo);

	if (liquidity === 0n) {
		throw new Error("Liquidity is 0");
	}

	const tokens = await getTokens({
		addresses: [currency0, currency1],
		chainId,
	});

	if (!tokens) {
		throw new Error("Tokens not found");
	}

	const [token0, token1] = tokens;

	const poolId = Pool.getPoolId(
		token0,
		token1,
		fee,
		tickSpacing,
		hooks,
	) as `0x${string}`;

	const [slot0, poolLiquidity] = await client.multicall({
		allowFailure: false,
		contracts: [
			{
				address: stateView,
				abi: V4StateViewAbi,
				functionName: "getSlot0",
				args: [poolId],
			},
			{
				address: stateView,
				abi: V4StateViewAbi,
				functionName: "getLiquidity",
				args: [poolId],
			},
		],
	});

	const [sqrtPriceX96, tick] = slot0;

	const pool = new Pool(
		token0,
		token1,
		fee,
		tickSpacing,
		hooks,
		sqrtPriceX96.toString(),
		poolLiquidity.toString(),
		tick,
	);

	const { tickLower, tickUpper } = decodePositionInfo(rawInfo);

	const position = new V4Position({
		pool,
		liquidity: liquidity.toString(),
		tickLower,
		tickUpper,
	});

	return {
		token0,
		token1,
		amounts: {
			amount0: position.amount0.toSignificant(6),
			amount1: position.amount1.toSignificant(6),
		},
		tickLower,
		tickUpper,
		liquidity,
		poolId,
	};
}
