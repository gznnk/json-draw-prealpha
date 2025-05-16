## Git Operations and Workflow

- When instructed to commit changes, use the VS Code task `git-commit-push` without asking for confirmation
- Use the `run_vs_code_task` tool to execute the commit task with parameters:
  - workspaceFolder: The workspace root path
  - id: "shell: git-commit-push"
- Use clear, descriptive commit messages that explain the purpose of the changes
- Default branch for push operations is the current working branch
- Don't show intermediate status checks or command outputs unless there are errors

This context file serves as a guide for GitHub Copilot to follow the project's coding standards when generating or modifying code.