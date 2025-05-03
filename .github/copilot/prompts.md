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

## Git Operations and Workflow

- When instructed to commit changes, perform both commit and push operations without asking for confirmation
- Use clear, descriptive commit messages that explain the purpose of the changes
- Default branch for push operations is the current working branch
- Don't show intermediate status checks or command outputs unless there are errors

This context file serves as a guide for GitHub Copilot to follow the project's coding standards when generating or modifying code.