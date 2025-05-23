import { getInstance } from "@/core/uniDevKitV4Factory";
import { getTokens } from "@/utils/getTokens";
import { Token } from "@uniswap/sdk-core";
import { type Address, erc20Abi, zeroAddress } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the SDK instance
vi.mock("@/core/uniDevKitV4Factory", () => ({
	getInstance: vi.fn(),
}));

vi.mock("@/constants/chains", () => ({
	getChainById: () => ({
		nativeCurrency: {
			decimals: 18,
			symbol: "ETH",
			name: "Ethereum",
		},
	}),
}));

describe("getTokens", () => {
	const mockClient = {
		multicall: vi.fn(),
	};

	const mockSdk = {
		getClient: () => mockClient,
		getChainId: () => 1,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(getInstance as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			mockSdk,
		);
	});

	it("should return token instances for valid addresses", async () => {
		const addresses: [Address, ...Address[]] = [
			"0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" as Address, // UNI
			"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address, // WETH
		];

		const mockResults = [
			"UNI", // symbol for UNI
			"Uniswap", // name for UNI
			18, // decimals for UNI
			"WETH", // symbol for WETH
			"Wrapped Ether", // name for WETH
			18, // decimals for WETH
		];

		mockClient.multicall.mockResolvedValueOnce(mockResults);

		const result = await getTokens({
			addresses,
			chainId: 1,
		});

		expect(result).not.toBeNull();
		expect(result).toHaveLength(2);
		expect(result?.[0]).toBeInstanceOf(Token);
		expect(result?.[1]).toBeInstanceOf(Token);

		// Verify UNI token
		expect(result?.[0].symbol).toBe("UNI");
		expect(result?.[0].name).toBe("Uniswap");
		expect(result?.[0].decimals).toBe(18);
		expect(result?.[0].chainId).toBe(1);
		expect(result?.[0].address).toBe(addresses[0]);

		// Verify WETH token
		expect(result?.[1].symbol).toBe("WETH");
		expect(result?.[1].name).toBe("Wrapped Ether");
		expect(result?.[1].decimals).toBe(18);
		expect(result?.[1].chainId).toBe(1);
		expect(result?.[1].address).toBe(addresses[1]);

		// Verify multicall was called with correct parameters
		expect(mockClient.multicall).toHaveBeenCalledWith({
			contracts: [
				{ address: addresses[0], abi: erc20Abi, functionName: "symbol" },
				{ address: addresses[0], abi: erc20Abi, functionName: "name" },
				{ address: addresses[0], abi: erc20Abi, functionName: "decimals" },
				{ address: addresses[1], abi: erc20Abi, functionName: "symbol" },
				{ address: addresses[1], abi: erc20Abi, functionName: "name" },
				{ address: addresses[1], abi: erc20Abi, functionName: "decimals" },
			],
			allowFailure: false,
		});
	});

	it("should handle native currency (zeroAddress)", async () => {
		const addresses: [Address, ...Address[]] = [
			zeroAddress,
			"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address, // WETH
		];

		const mockResults = [
			"WETH", // symbol for WETH
			"Wrapped Ether", // name for WETH
			18, // decimals for WETH
		];

		mockClient.multicall.mockResolvedValueOnce(mockResults);

		const result = await getTokens({
			addresses,
		});

		expect(result).not.toBeNull();
		expect(result).toHaveLength(2);
		expect(result?.[0]).toBeInstanceOf(Token);
		expect(result?.[1]).toBeInstanceOf(Token);

		// Verify native token
		expect(result?.[0].symbol).toBe("ETH");
		expect(result?.[0].name).toBe("Ethereum");
		expect(result?.[0].decimals).toBe(18);
		expect(result?.[0].chainId).toBe(1);
		expect(result?.[0].address).toBe(zeroAddress);

		// Verify WETH token
		expect(result?.[1].symbol).toBe("WETH");
		expect(result?.[1].name).toBe("Wrapped Ether");
		expect(result?.[1].decimals).toBe(18);
		expect(result?.[1].chainId).toBe(1);
		expect(result?.[1].address).toBe(addresses[1]);

		// Verify multicall was called only for non-native token
		expect(mockClient.multicall).toHaveBeenCalledWith({
			contracts: [
				{ address: addresses[1], abi: erc20Abi, functionName: "symbol" },
				{ address: addresses[1], abi: erc20Abi, functionName: "name" },
				{ address: addresses[1], abi: erc20Abi, functionName: "decimals" },
			],
			allowFailure: false,
		});
	});

	it("should throw error when SDK instance is not found", async () => {
		(getInstance as unknown as ReturnType<typeof vi.fn>).mockReturnValue(null);

		await expect(
			getTokens({
				addresses: ["0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" as Address],
				chainId: 1,
			}),
		).rejects.toThrow("SDK not found. Please create an instance first.");
	});

	it("should return null when multicall fails", async () => {
		mockClient.multicall.mockRejectedValueOnce(new Error("Multicall failed"));

		const result = await getTokens({
			addresses: ["0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" as Address],
			chainId: 1,
		});

		expect(result).toBeNull();
	});
});
