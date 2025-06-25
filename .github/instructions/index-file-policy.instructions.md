## Index File Policy

- Only create `index.ts` or `index.tsx` files inside React component folders.
- Do not generate index files for feature, shared, or other non-component directories.
- Import modules by their explicit file paths outside of component folders.
- This keeps folder boundaries clear and avoids ambiguous imports.
