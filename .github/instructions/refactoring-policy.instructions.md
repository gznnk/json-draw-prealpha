## Refactoring Policy

- Do not leave temporary proxy or alias files to preserve backward compatibility during refactoring
- Always update all import paths and references immediately as part of the refactoring process
- Avoid deferring cleanup by leaving fallback entry points or legacy references in place
- Strive for consistency and integrity across the entire codebase after any structural changes
