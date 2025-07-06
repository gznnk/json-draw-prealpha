## Git Operations and Workflow

- When instructed to commit changes, generate a descriptive commit message that summarizes the entire work session or task, not just the most recent changes
- Always prefix commit messages with "[Copilot]" to identify that the changes were made by GitHub Copilot
- Use the `run_in_terminal` tool to execute the git-commit-push-with-message.bat script with the AI-generated commit message
- Execute git operations using the following command:
  - `.\.vscode\scripts\git-commit-push-with-message.bat "[Copilot] AI-generated commit message"`
- The script automatically handles staging changes, committing with the provided message, and pushing to the remote repository
- Generate commit messages that provide an overview of the complete work session, including all related changes and their collective purpose
- Follow conventional commit format when appropriate (e.g., "[Copilot] feat:", "[Copilot] fix:", "[Copilot] docs:", "[Copilot] refactor:")
- Include context about what was changed and why it was changed, focusing on the overall objectives achieved
- Default branch for push operations is the current working branch
- Show commit results but don't show intermediate status checks unless there are errors

Example commit message formats:
- "[Copilot] Implement complete SVG canvas system with drag and drop functionality"
- "[Copilot] Fix multiple markdown editor issues including formatting and parsing"
- "[Copilot] Update git workflow and commit message generation system"
- "[Copilot] Refactor component architecture for improved maintainability and performance"
- "[Copilot] feat: Add comprehensive user authentication and authorization system"
- "[Copilot] fix: Resolve canvas rendering performance issues and memory leaks"

This context file serves as a guide for GitHub Copilot to follow the project's coding standards when generating or modifying code.