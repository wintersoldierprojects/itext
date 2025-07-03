# 🔄 Agent Workflow

**Purpose**: Outline the branching strategy for parallel agents using feature branches and pull requests.

## 🌱 Feature Branches
- Create your branch from `main` using the naming pattern `agent-<name>/feature/<task>`.
- Never commit directly to `main` or another agent's branch.

## 📥 Before Working
1. `git checkout main && git pull`
2. `git checkout -b agent-<name>/feature/<task>`

## 🚀 Share Changes
- Push your feature branch: `git push -u origin agent-<name>/feature/<task>`
- Open a Pull Request targeting `main`. Wait for CI and review to merge.

**Cross-References**: [progress.md](progress.md)
