# Contributing to uniswap-dev-kit

Thanks for your interest in contributing! Here's how to get started:

## Setup

```bash
pnpm install
```

- Use Node.js 20+
- Use `pnpm run dev` for local development
- Run tests with `pnpm test`
- Generate docs with `pnpm run docs`

## Branching & PRs

- Branch from `main`
- Use descriptive branch names (e.g. `feature/add-foo-hook`)
- Open a pull request with a clear description
- Link related issues if any

## Code Style

- TypeScript only, no `any` unless justified
- Use Biome for linting/formatting: `pnpm run lint` and `pnpm run format`
- 100% test coverage for new features/bugfixes
- Add/maintain JSDoc comments for public APIs

## Commit Messages

- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- This enables automated releases and changelogs

## Review Process

- All PRs require review and CI passing before merge

---

Questions? Open an issue or ask in your PR! 