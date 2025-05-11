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

## React Component Folder Structure

- Folder name should match the component name exactly
- Use [ComponentName].tsx for the main component implementation file
- Use [ComponentName]Styled.ts for emotion style definitions related to the component
- Use [ComponentName]Constants.ts for constant definitions related to the component
- Use [ComponentName]Types.ts for type definitions related to the component
- Use [ComponentName]Functions.ts for utility functions related to the component
- Re-export all items meant to be referenced from outside through index.tsx
- When a component consists of multiple components, divide them into separate folders following the same naming rules for folder names and internal files

## TypeScript Guidelines

- Use explicit typing instead of relying on inference when intent needs to be clear
- Prefer interfaces for public APIs and type aliases for complex types
- Use descriptive type names that explain the purpose
- Avoid using default exports, prefer named exports for all modules
  - This improves maintainability, refactoring, and static analysis
  - Named exports make import statements consistent and self-documenting
  - Named exports support better tree-shaking in the final bundle

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

## YAGNI (You Aren't Gonna Need It) Principle

- Do not implement functionality solely on the speculation that it might be needed in the future
- Write the minimum amount of code necessary to meet the current requirements
- Avoid over-engineering with excessive generalization or abstraction
- Do not create extension points or interfaces without concrete use cases
- Embrace refactoring to accommodate changing requirements when they actually arise
- Prioritize simple, readable, and maintainable code over speculative features

## Git Operations and Workflow

- When instructed to commit changes, use the VS Code task `git-commit-push` without asking for confirmation
- Use the `run_vs_code_task` tool to execute the commit task with parameters:
  - workspaceFolder: The workspace root path
  - id: "shell: git-commit-push"
- Use clear, descriptive commit messages that explain the purpose of the changes
- Default branch for push operations is the current working branch
- Don't show intermediate status checks or command outputs unless there are errors

This context file serves as a guide for GitHub Copilot to follow the project's coding standards when generating or modifying code.