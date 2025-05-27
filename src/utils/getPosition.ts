import { V4PositionManagerAbi } from "@/constants/abis/V4PositionMananger";
import { V4StateViewAbi } from "@/constants/abis/V4StateView";
import { decodePositionInfo } from "@/helpers/positions";
import type { UniDevKitV4Instance } from "@/types/core";
import type {
	GetPositionParams,
	GetPositionResponse,
} from "@/types/utils/getPosition";
import { getTokens } from "@/utils/getTokens";
import { Pool, Position as V4Position } from "@uniswap/v4-sdk";

/**
 * Retrieves a Uniswap V4 position instance for a given token ID.
 * @param params Position parameters including token ID
 * @param instance UniDevKitV4Instance
 * @returns Promise resolving to position data
 * @throws Error if SDK instance is not found or if position data is invalid
 */
export async function getPosition(
	params: GetPositionParams,
	instance: UniDevKitV4Instance,
): Promise<GetPositionResponse> {
	const { client, contracts } = instance;

	const { positionManager, stateView } = contracts;

	// Fetch poolKey and raw position info
	const [poolAndPositionInfo, liquidity] = await client.multicall({
		allowFailure: false,
		contracts: [
			{
				address: positionManager,
				abi: V4PositionManagerAbi,
				functionName: "getPoolAndPositionInfo",
				args: [BigInt(params.tokenId)],
			},
			{
				address: positionManager,
				abi: V4PositionManagerAbi,
				functionName: "getPositionLiquidity",
				args: [BigInt(params.tokenId)],
			},
		],
	});

	const [poolKey, rawInfo] = poolAndPositionInfo;
	const { currency0, currency1, fee, tickSpacing, hooks } = poolKey;

	if (liquidity === 0n) {
		throw new Error("Liquidity is 0");
	}

	const tokens = await getTokens(
		{
			addresses: [currency0, currency1],
		},
		instance,
	);

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
		position,
		pool,
		token0,
		token1,
		poolId,
		tokenId: params.tokenId,
	};
}
