# GitHub Copilot Context Guidelines

## Comment Style Guidelines

- Write all code comments in English to ensure LLM comprehension and international collaboration.
- Use JSDoc style comments for functions, methods, classes, and interfaces.
- For single-line comments, don't use periods at the end.
- For multi-line comments, use periods at the end of each sentence.
- Make comments descriptive but concise, focusing on "why" rather than "what".
- Add TypeScript type annotations to improve code clarity and Copilot's understanding.

### Examples of Good Comments:

```typescript
/**
 * Processes diagram events and updates the canvas state accordingly.
 * This handler manages both user interactions and system-generated events.
 * 
 * @param event - The diagram event to process
 * @param canvasState - Current state of the canvas
 * @returns Updated canvas state after processing the event
 */
function processDiagramEvent(event: DiagramEvent, canvasState: CanvasState): CanvasState {
  // Implementation
}

// Short utility to generate unique IDs
function generateUniqueId(): string {
  // Implementation
}
```

## React Component Structure

- Place React components in folders named after the component
- Use [ComponentName].tsx for the implementation file
- Create an index.tsx file for re-exporting the component and related types
- Define components as arrow functions assigned to constants, then export them
- Use React.memo for performance optimization where appropriate

## TypeScript Guidelines

- Use explicit typing instead of relying on inference when intent needs to be clear
- Prefer interfaces for public APIs and type aliases for complex types
- Use descriptive type names that explain the purpose

## File Organization

- Group related components, hooks, and utilities in feature folders
- Keep shared utilities in the utils folder
- Place shared types in the types folder

## Biome Linting and Formatting Rules

- Import Node.js built-in modules using the `node:` protocol prefix (e.g., `import fs from "node:fs"`)
- Use double quotes for strings consistently
- Include trailing commas in multi-line object literals and arrays
- Use semicolons at the end of statements
- Maintain consistent indentation (2 spaces)
- Avoid unused variables and imports
- Use parentheses for nested ternary expressions
- Add spaces around infix operators
- Prefer template literals over string concatenation when variables are involved
- Sort import statements alphabetically
- Avoid console statements in production code (except for proper logging utilities)

## Git Operations and Workflow

- When instructed to commit changes, use the VS Code task `git-commit-push` without asking for confirmation
- Use the `run_vs_code_task` tool to execute the commit task with parameters:
  - workspaceFolder: The workspace root path
  - id: "shell: git-commit-push"
- Use clear, descriptive commit messages that explain the purpose of the changes
- Default branch for push operations is the current working branch
- Don't show intermediate status checks or command outputs unless there are errors

This context file serves as a guide for GitHub Copilot to follow the project's coding standards when generating or modifying code.