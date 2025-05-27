# uniswap-dev-kit

[![CI](https://github.com/BootNodeDev/uni-dev-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/BootNodeDev/uni-dev-kit/actions/workflows/ci.yml)
[![Release](https://github.com/BootNodeDev/uni-dev-kit/actions/workflows/release.yml/badge.svg)](https://github.com/BootNodeDev/uni-dev-kit/actions/workflows/release.yml)
[![Docs](https://img.shields.io/badge/docs-typedoc-blue)](https://bootnodedev.github.io/uni-dev-kit)

> Modern TypeScript SDK for integrating Uniswap V4 into your dapp.  
> **Early version:** API may change rapidly.

## Features

- 🚀 Full TypeScript support
- 🔄 Multi-chain support out of the box
- 📦 Zero dependencies (except peer deps)
- 🔍 Comprehensive error handling
- 🧪 Fully tested
- 📚 Well documented

## Install

```bash
pnpm install uniswap-dev-kit
# or
npm install uniswap-dev-kit
```

## Quick Start

### 1. Configure and create SDK instances

```ts
import { UniDevKitV4 } from "uniswap-dev-kit";

// Create instance for Ethereum mainnet
const ethInstance = new UniDevKitV4({
  chainId: 1,
  rpcUrl: "https://eth.llamarpc.com",
  contracts: {
    poolManager: "0x...",
    positionDescriptor: "0x...",
    positionManager: "0x...",
    quoter: "0x...",
    stateView: "0x...",
    universalRouter: "0x...",
    permit2: "0x..."
  }
});

// Create instance for another chain (e.g., Base)
const baseInstance = new UniDevKitV4({
  chainId: 8453,
  rpcUrl: "https://mainnet.base.org",
  contracts: {
    // Base Uniswap V4 contract addresses...
  }
});
```

### 2. Get a quote

```ts
import { parseEther } from "viem";

const quote = await ethInstance.getQuote({
  tokens: [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  ],
  feeTier: 3000,
  amountIn: parseEther("1"),
  zeroForOne: true
});
console.log(quote.amountOut);
```

### 3. Get a pool

```ts
const pool = await ethInstance.getPool({
  tokens: [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  ],
  feeTier: 3000
});
console.log(pool.liquidity.toString());
```

### 4. Get a position

```ts
const position = await ethInstance.getPosition({
  tokenId: "123"
});
console.log({
  token0: position.token0.symbol,
  token1: position.token1.symbol,
  liquidity: position.position.liquidity.toString()
});
```

## Advanced Usage

### Error Handling

All SDK functions include comprehensive error handling:

```ts
try {
  const quote = await ethInstance.getQuote({
    tokens: [token0, token1],
    feeTier: 3000,
    amountIn: parseEther("1"),
    zeroForOne: true
  });
} catch (error) {
  // Handle specific error types
  if (error.message.includes("insufficient liquidity")) {
    // Handle liquidity error
  } else if (error.message.includes("invalid pool")) {
    // Handle pool error
  }
}
```

### Using with React

You can use the SDK with React Query for data fetching:

```tsx
import { useQuery } from '@tanstack/react-query';
import { UniDevKitV4 } from 'uniswap-dev-kit';

// Create instance once
const sdk = new UniDevKitV4({
  chainId: 1,
  rpcUrl: "https://eth.llamarpc.com",
  contracts: {
    // ... contract addresses
  }
});

// Simple hook for quotes
function useQuote() {
  return useQuery({
    queryKey: ['quote'],
    queryFn: () => sdk.getQuote({
      tokens: [
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      ],
      feeTier: 3000,
      amountIn: parseEther("1"),
      zeroForOne: true
    })
  });
}
```

---

## API Reference

See [full TypeDoc documentation](https://bootnodedev.github.io/uni-dev-kit) for all methods, types, and advanced usage.

---

## Development

### Scripts

- `pnpm build` — Build the library
- `pnpm test` — Run all tests
- `pnpm lint` — Lint code with Biome
- `pnpm format` — Format code with Biome
- `pnpm docs` — Generate API docs with TypeDoc

### Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Release

- Releases are automated with [semantic-release](https://semantic-release.gitbook.io/semantic-release/).
- Versioning: [semver](https://semver.org/)

---

## FAQ

- **Does it work in Node and browser?**  
  Yes, works in both environments.
- **Can I use my own ABIs?**  
  Yes, but Uniswap V4 ABIs are included.

---

## License

MIT

---

> Feedback, issues, and PRs welcome.  
> [API Docs](https://bootnodedev.github.io/uni-dev-kit) • [Open an Issue](https://github.com/BootNodeDev/uni-dev-kit/issues) 