# Contributing to Nexus

Thanks for your interest. This project follows a PR-based workflow even for
solo maintenance — it keeps history clean and reviewable.

## Prerequisites

- Node.js 20 (see `.nvmrc`)
- pnpm 9+ (`corepack enable && corepack prepare pnpm@latest --activate`)
- Docker Desktop (8 GB RAM minimum)

## Local Development

    git clone https://github.com/you/nexus
    cd nexus
    cp .env.example .env
    make up
    make seed

## Workflow

1. Open an issue describing what you intend to change.
2. Create a branch: `git checkout -b feat/short-description`.
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/).
4. Push and open a PR referencing the issue (`Closes #123`).
5. Ensure CI is green before requesting review.

## Commit Convention

    <type>(<scope>): <subject>

    Types: feat | fix | docs | refactor | test | chore | perf | ci

## Tests

    pnpm test          # unit
    pnpm test:e2e      # end-to-end (requires full stack up)

All PRs must include tests for new behavior and must not regress coverage.

## Architecture Decisions

Significant changes require an ADR in `docs/adr/`. See
`docs/adr/0000-template.md`.