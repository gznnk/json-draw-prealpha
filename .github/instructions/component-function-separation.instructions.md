# Component and Function Separation Rules

This document defines the separation rules for React components and their utility functions to maintain clean architecture and improve code maintainability.

## Separation Criteria

### Utility Functions File ([ComponentName]Utils.ts)

Place logic in utility functions when it meets these criteria:

- **Pure Functions**: No side effects, same input always produces same output
- **Mathematical Calculations**: Coordinate transformations, scaling, geometric calculations
- **Data Transformations**: Processing, filtering, or converting data structures
- **Reusable Logic**: Functions that could be used by other components
- **React-Independent**: Logic that doesn't depend on React hooks or component lifecycle
- **Testable Units**: Logic that can be easily unit tested in isolation

**Examples of utility functions:**

```typescript
// Coordinate transformation
export const transformToMiniMapCoords = (
	x: number,
	y: number,
	bounds: Bounds,
): Point => {
	// Pure calculation logic
};

// Data extraction
export const extractTransformativeItems = (items: Diagram[]): Diagram[] => {
	// Pure data processing
};

// Mathematical calculations
export const calculateScale = (
	bounds: Bounds,
	width: number,
	height: number,
): number => {
	// Pure mathematical computation
};
```

### Component File ([ComponentName].tsx)

Keep logic in components when it involves:

- **React Hooks**: `useMemo`, `useCallback`, `useState`, `useEffect`, etc.
- **UI Event Handling**: Click handlers, drag handlers, keyboard events
- **Component State Management**: Managing local component state and effects
- **Props Dependencies**: Logic that depends on component props and their changes
- **JSX Generation**: Creating and rendering React elements
- **Component Lifecycle**: Logic tied to mounting, unmounting, or updates

**Examples of component logic:**

```typescript
// Memoized calculations based on props
const canvasBounds = useMemo(() => {
  return calculateCombinedCanvasBounds(items, viewportBounds);
}, [items, viewportBounds]);

// Event handlers
const handleClick = useCallback((e: React.MouseEvent) => {
  // Handle user interaction
}, [dependencies]);

// JSX rendering with component state
const miniMapItems = useMemo(() => {
  const itemData = generateMiniMapItems(items, bounds, scale);
  return itemData.map(item => <MiniMapItem key={item.id} {...item} />);
}, [items, bounds, scale]);
```

## Implementation Guidelines

1. **Start with Utility Functions**: When implementing new logic, first consider if it can be a pure function
2. **Extract Complex Logic**: Move complex calculations from components to utility functions
3. **Keep Hooks in Components**: Never move React hook usage to utility functions
4. **Maintain Single Responsibility**: Each utility function should have one clear purpose
5. **Use Descriptive Names**: Function names should clearly indicate their purpose and return type
6. **Add JSDoc Comments**: Document utility functions with clear parameter and return descriptions

## Benefits of This Separation

- **Testability**: Pure functions are easier to unit test
- **Reusability**: Utility functions can be imported and used in multiple components
- **Performance**: Pure functions can be easily memoized and optimized
- **Maintainability**: Clear separation of concerns makes code easier to understand
- **Debugging**: Isolated logic is easier to debug and reason about

## Example Structure

```
ComponentName/
├── ComponentName.tsx           # React component with hooks and JSX
├── ComponentNameUtils.ts       # Pure utility functions
├── ComponentNameTypes.ts       # Type definitions
├── ComponentNameStyled.ts      # Styled components
└── index.tsx                   # Re-exports
```

## Migration Strategy

When refactoring existing components:

1. Identify pure functions that can be extracted
2. Move mathematical calculations to utility functions
3. Keep React-specific logic in components
4. Update imports and dependencies
5. Add unit tests for extracted functions
6. Verify component still works correctly

This separation ensures clean, maintainable, and testable code architecture.
