## Comment Style Guidelines

- Write all code comments in English to ensure LLM comprehension.
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