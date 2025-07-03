# 🔄 Agent Integration Workflow

**Purpose**: Coordinate parallel agent work through a single integration branch to avoid conflicts.

## 🌱 Shared Branch
- Branch name: `integration`
- All agents push their commits to this branch sequentially.

## 📥 Before Each Update
1. `git fetch origin integration`
2. `git checkout integration`
3. `git pull`

## 🚀 After Commit
- Run `git push origin integration` to share changes.
- Notify other agents to re-fetch before they continue.

**Cross-References**: [progress.md](progress.md)
