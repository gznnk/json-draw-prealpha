## After Copilot Task

- After Copilot finishes generating or modifying code, always run `npm run build` to verify that no build errors were introduced
- When running build commands, ensure they are compatible with PowerShell syntax (e.g., use `npm run build` directly or `& npm run build` if needed)
- If any errors occur, manually fix them before continuing to the next task or committing the code
- This check ensures the codebase remains in a compilable state
- Do not rely solely on Copilot's output—manual validation and correction are required
- If the build succeeds without errors, commit the changes using the git-commit-push-with-message.bat script with an AI-generated commit message that describes the changes made
- Use the command: `.\.vscode\scripts\git-commit-push-with-message.bat "descriptive commit message"`
