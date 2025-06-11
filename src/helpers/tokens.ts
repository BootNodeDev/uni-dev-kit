/**
 * Sorts two tokens in a consistent order (lexicographically by address)
 * @param token0 First token address
 * @param token1 Second token address
 * @returns Tuple of [token0, token1] in sorted order
 */
export function sortTokens(
  token0: `0x${string}`,
  token1: `0x${string}`,
): [`0x${string}`, `0x${string}`] {
  return token0.toLowerCase() < token1.toLowerCase() ? [token0, token1] : [token1, token0]
}
