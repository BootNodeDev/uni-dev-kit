# uniswap-dev-kit

[![CI](https://github.com/BootNodeDev/uni-dev-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/BootNodeDev/uni-dev-kit/actions/workflows/ci.yml)
[![Release](https://github.com/BootNodeDev/uni-dev-kit/actions/workflows/release.yml/badge.svg)](https://github.com/BootNodeDev/uni-dev-kit/actions/workflows/release.yml)
[![Docs](https://img.shields.io/badge/docs-typedoc-blue)](https://bootnodedev.github.io/uni-dev-kit)

> Modern TypeScript SDK for integrating Uniswap V4 into your dapp.  
> **Early version:** API may change rapidly.

---

## Install

```bash
pnpm install uniswap-dev-kit
# or
npm install uniswap-dev-kit
```

## Quick Start

### 1. Configure and create SDK instances

```ts
import { createInstance } from "uniswap-dev-kit";

// Create instance for Ethereum mainnet
createInstance({
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
createInstance({
  chainId: 8453,
  rpcUrl: "https://mainnet.base.org",
  contracts: {
    // Base Uniswap V4 contract addresses...
  }
});
```

The SDK automatically manages multiple instances based on chainId. When using hooks or utilities, just specify the chainId to use the corresponding instance:

```ts
// Will use Ethereum mainnet instance
const ethPool = await getPool({ tokens: [...] }, 1);

// Will use Base instance
const basePool = await getPool({ tokens: [...] }, 8453);

// If you only have one instance, chainId is optional
const singleChainPool = await getPool({ tokens: [...] });
```

### 2. Get a quote (vanilla JS/TS)

```ts
import { getQuote } from "uniswap-dev-kit";
import { parseEther } from "viem";

const quote = await getQuote(
  {
    tokens: [
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    ],
    feeTier: 3000,
    tickSpacing: 60,
    amountIn: parseEther("1"),
  },
  1,
  {
    enabled: true,
    staleTime: 30000,
    gcTime: 300000,
    retry: 3,
    onSuccess: (data) => console.log("Quote received:", data),
  },
);
console.log(quote.amountOut);
```

### 3. Use in React (with hooks)

#### Get a quote

```tsx
import { useGetQuote } from "uniswap-dev-kit";
import { parseEther } from "viem";

function QuoteComponent() {
  const { data, isLoading, error } = useGetQuote({
    params: {
      tokens: [
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      ],
      feeTier: 3000,
      tickSpacing: 60,
      amountIn: parseEther("1"),
      zeroForOne: true
    },
    chainId: 1
  });

  if (isLoading) return <span>Loading...</span>;
  if (error) return <span>Error: {error.message}</span>;
  return <span>Quote: {data?.amountOut?.toString()}</span>;
}
```

#### Get a pool

```tsx
import { useGetPool } from "uniswap-dev-kit";

function PoolComponent() {
  const { data, isLoading, error } = useGetPool({
    params: {
      tokens: [
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      ],
      fee: 3000,
    },
    chainId: 1
  });

  if (isLoading) return <span>Loading...</span>;
  if (error) return <span>Error: {error.message}</span>;
  return <span>Pool: {JSON.stringify(data)}</span>;
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

- **Which React versions are supported?**  
  React 18+ (see peerDependencies)
- **Does it work in Node and browser?**  
  Yes, but hooks are React-only.
- **Can I use my own ABIs?**  
  Yes, but Uniswap V4 ABIs are included.

---

## License

MIT

---

> Feedback, issues, and PRs welcome.  
> [API Docs](https://bootnodedev.github.io/uni-dev-kit) • [Open an Issue](https://github.com/BootNodeDev/uni-dev-kit/issues) 