import type { Address } from "viem";

/**
 * Token permissions structure for Permit2 SignatureTransfer
 * @public
 */
export interface TokenPermissions {
	/** The token contract address */
	token: Address;
	/** The amount to be transferred */
	amount: bigint;
}

/**
 * Permit data structure for SignatureTransfer operations
 * @public
 */
export interface PermitTransferFrom {
	/** Token and amount permissions */
	permitted: TokenPermissions;
	/** Unique nonce for replay protection */
	nonce: bigint;
	/** Unix timestamp when the permit expires */
	deadline: bigint;
}

/**
 * EIP-712 typed data structure for PermitTransferFrom signatures
 * @public
 */
export interface PermitTransferFromTypedData {
	/** EIP-712 domain separator */
	domain: {
		/** Domain name */
		name: string;
		/** Domain version */
		version: string;
		/** Chain ID */
		chainId: number;
		/** Verifying contract address */
		verifyingContract: Address;
	};
	/** EIP-712 type definitions */
	types: {
		/** PermitTransferFrom type definition */
		PermitTransferFrom: readonly [
			{ readonly name: "permitted"; readonly type: "TokenPermissions" },
			{ readonly name: "spender"; readonly type: "address" },
			{ readonly name: "nonce"; readonly type: "uint256" },
			{ readonly name: "deadline"; readonly type: "uint256" },
		];
		/** TokenPermissions type definition */
		TokenPermissions: readonly [
			{ readonly name: "token"; readonly type: "address" },
			{ readonly name: "amount"; readonly type: "uint256" },
		];
	};
	/** Primary type for signing */
	primaryType: "PermitTransferFrom";
	/** Message data to be signed */
	message: PermitTransferFrom & {
		/** Address authorized to execute the transfer */
		spender: Address;
	};
}

/**
 * Permit parameters for building typed data
 * @public
 */
export interface PermitParams {
	/** Token contract address */
	token: Address;
	/** Amount to be permitted for transfer */
	amount: bigint;
	/** Token owner address */
	owner: Address;
	/** Address authorized to execute the transfer */
	spender: Address;
	/** Optional unique nonce for replay protection (auto-fetched if not provided) */
	nonce?: bigint;
	/** Optional deadline in seconds from now (defaults to 30 minutes) */
	deadlineSeconds?: number;
}
