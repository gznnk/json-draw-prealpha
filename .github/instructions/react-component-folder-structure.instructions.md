## React Component Folder Structure

- Folder name should match the component name exactly
- Use [ComponentName].tsx for the main component implementation file
- Use [ComponentName]Styled.ts for emotion style definitions related to the component
- Use [ComponentName]Constants.ts for constant definitions related to the component
- Use [ComponentName]Types.ts for type definitions related to the component
- Use [ComponentName]Functions.ts for utility functions related to the component
- Re-export all items meant to be referenced from outside through index.tsx
- When a component consists of multiple components, divide them into separate folders following the same naming rules for folder names and internal files