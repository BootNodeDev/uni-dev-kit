# uniswap-dev-kit

[![CI](https://github.com/BootNodeDev/uni-dev-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/BootNodeDev/uni-dev-kit/actions/workflows/ci.yml)
[![Release](https://github.com/BootNodeDev/uni-dev-kit/actions/workflows/release.yml/badge.svg)](https://github.com/BootNodeDev/uni-dev-kit/actions/workflows/release.yml)
[![Docs](https://img.shields.io/badge/docs-typedoc-blue)](https://bootnodedev.github.io/uni-dev-kit)

A modern TypeScript library for integrating Uniswap V4 into your dapp.

## Installation

```bash
pnpm install uniswap-dev-kit
```

## Quick Start

### 1. Configure and create an SDK instance

```ts
import { createInstance } from 'uniswap-dev-kit';

const config = {
  chainId: 1,
  rpcUrl: 'https://eth.llamarpc.com',
  contracts: {
    poolManager: '0x...',
    positionDescriptor: '0x...',
    positionManager: '0x...',
    quoter: '0x...',
    stateView: '0x...',
    universalRouter: '0x...',
    permit2: '0x...'
  }
};

createInstance(config);
```

### 2. Use the getQuote function (vanilla JS/TS)

```ts
import { getQuote } from 'uniswap-dev-kit';
import { parseEther } from 'viem';

const quote = await getQuote({
  tokens: [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"  // WETH
  ],
  feeTier: 3000,
  tickSpacing: 60,
  amountIn: parseEther("1"), // 1 ETH in wei
  zeroForOne: true
});
console.log(quote.amountOut);
```

**Parameters of getQuote:**
- `tokens`: `[tokenA, tokenB]` (addresses)
- `feeTier`: pool fee (e.g. 3000)
- `tickSpacing`: pool tick spacing (e.g. 60)
- `amountIn`: amount to swap (bigint, e.g. `parseEther("1")`)
- `zeroForOne`: swap direction (true: tokenA→tokenB)
- `hooks` and `hookData`: optional

### 3. Use the useGetQuote hook (React)

```tsx
import { useGetQuote } from 'uniswap-dev-kit';
import { parseEther } from 'viem';

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
    }
  });

  if (isLoading) return <span>Loading...</span>;
  if (error) return <span>Error: {error.message}</span>;
  return <span>Quote: {data?.amountOut?.toString()}</span>;
}
```

## Documentation

See [API Documentation](https://bootnodedev.github.io/uni-dev-kit) for full API reference.

---

> This is an early version. API and features will evolve rapidly. 