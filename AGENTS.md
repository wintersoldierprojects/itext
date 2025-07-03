# AGENTS.md

**Read `Codex.md` first.** Return here for agent-specific rules.

## Key Rules
- Parse `Codex.md` and this file at the start and end of every task.
- Run Coding, Security, QA, CI/CD and Architecture agents in parallel.
- Produce linted, type-safe code with tests and passing CI before commit.
- Follow repository naming conventions and PR protocols.
- Provide terminal logs, test reports and citations in PRs.

## Task Flow
1. Load `AGENTS.md` and `Codex.md`.
2. Spawn agents.
3. Retrieve relevant docs and code.
4. Lint, type-check and test.
5. Commit with a clear message and "Testing Done" summary.
6. Summarize results with citations.

## Collaboration Rules
- Use branches named `agent-<name>/feature/<topic>`.
- Stay within your folder; shared files require a PR.
- Keep commits atomic and rebase before PRs.
- Branches merge automatically when tests pass and are then deleted.
- Commit and push often to avoid losing work.

## Documentation Reference
| Location | Purpose |
| --- | --- |
| `/Codex.md` | Primary project guide |
| `/docs/` | Main documentation |
| `/docs/archive/` | Historical records (read-only) |

See `Documentation/README.md` for folder details.

---
For development guidelines on Next.js and React, consult `Codex.md` and the docs folder. Push changes frequently; branches are auto-merged after successful tests.
