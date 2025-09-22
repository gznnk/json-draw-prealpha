## React Component Coding Style

- Define all React components using arrow function syntax
- Do not use default exports
- Declare the component as a `const` with a `*Component` suffix, e.g. `const ButtonComponent`
- Export components as `memo(Component)` to enable memoization by default

```tsx
// Example
import { memo } from "react";

const ButtonComponent = (): JSX.Element => {
	return <button>Click</button>;
};

export const Button = memo(ButtonComponent);
```
