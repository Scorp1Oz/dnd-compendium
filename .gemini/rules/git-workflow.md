# Git Deployment Workflow Rule

## Policy
1. **Never auto-push**: Do NOT commit or push changes to Git / GitHub automatically upon making edits.
2. **On-Demand Only**: Only commit and push when the user explicitly instructs to do so (e.g., "выгрузи на гитхаб", "запушь", "отправь в гит", "push to github").
3. **Execution Steps on Request**:
   - Run `git status` to see what changed.
   - Stage appropriate project files (`git add ...`), avoiding sensitive/temporary files.
   - Craft a concise, meaningful commit message summarizing the user's latest features/fixes.
   - Push to the current active branch on `origin` (`git push origin <branch>`).
   - Confirm to the user with a summary of committed changes.
