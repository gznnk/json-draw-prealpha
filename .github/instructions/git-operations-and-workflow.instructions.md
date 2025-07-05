## Git Operations and Workflow

- When instructed to commit changes, generate a descriptive commit message that summarizes the changes made
- Use the `run_in_terminal` tool to execute the git-commit-push-with-message.bat script with the AI-generated commit message
- Execute git operations using the following command:
  - `.\.vscode\scripts\git-commit-push-with-message.bat "AI-generated commit message"`
- The script automatically handles staging changes, committing with the provided message, and pushing to the remote repository
- Use clear, descriptive commit messages that explain the purpose of the changes in natural language
- Follow conventional commit format when appropriate (e.g., "feat:", "fix:", "docs:", "refactor:")
- Include context about what was changed and why it was changed
- Default branch for push operations is the current working branch
- Show commit results but don't show intermediate status checks unless there are errors

Example commit message formats:
- "Add new SVG canvas component with drag and drop functionality"
- "Fix issue with markdown editor not preserving formatting"
- "Update git workflow to support AI-generated commit messages"
- "Refactor component structure for better maintainability"

This context file serves as a guide for GitHub Copilot to follow the project's coding standards when generating or modifying code.