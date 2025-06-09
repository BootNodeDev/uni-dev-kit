import type { PermitBatch } from "@uniswap/permit2-sdk";
import type { BatchPermitOptions } from "@uniswap/v4-sdk";
import type { TypedDataField } from "ethers";
import type { Address, Hex } from "viem";

/**
 * Interface for the parameters required to generate a Permit2 batch signature
 */
export interface PreparePermit2BatchDataParams {
	/** Array of token addresses to permit */
	tokens: (Address | string)[];
	/** Address that will be allowed to spend the tokens */
	spender: Address | string;
	/** User's wallet address */
	owner: Address | string;
	/** Signature deadline in seconds */
	sigDeadline?: number;
}

/**
 * Interface for the return value of the function
 */
export interface PreparePermit2BatchDataResult {
	/** Function to build the permit2 batch data with a signature */
	buildPermit2BatchDataWithSignature: (
		signature: string | Hex,
	) => BatchPermitOptions;
	/** User's wallet address */
	owner: Address | string;
	/** Permit2 batch data */
	permitBatch: PermitBatch;
	/** Data needed to sign the permit2 batch data */
	toSign: {
		/** Domain of the permit2 batch data */
		domain: {
			name: string;
			version: string;
			chainId: number;
			verifyingContract: `0x${string}`;
		};
		/** Types of the permit2 batch data */
		types: Record<string, TypedDataField[]>;
		/** Values of the permit2 batch data */
		values: PermitBatch;
		/** Primary type of the permit2 batch data */
		primaryType: "PermitBatch";
		/** Message of the permit2 batch data */
		message: Record<string, unknown>;
	};
}
