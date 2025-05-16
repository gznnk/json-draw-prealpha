## TypeScript Guidelines

- Use explicit typing instead of relying on inference when intent needs to be clear
- Prefer interfaces for public APIs and type aliases for complex types
- Use descriptive type names that explain the purpose
- Use `type` instead of `interface` for React props definitions to avoid unintentional property merging and keep props consistent with utility types
- Avoid using default exports, prefer named exports for all modules
  - This improves maintainability, refactoring, and static analysis
  - Named exports make import statements consistent and self-documenting
  - Named exports support better tree-shaking in the final bundle