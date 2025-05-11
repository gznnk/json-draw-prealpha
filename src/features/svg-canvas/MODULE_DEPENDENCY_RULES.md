# svg-canvas Dependency Rules

## General Rules
```mermaid
graph TD
    utils --> types
    hooks --> types
    hooks --> utils
    components --> types
    canvas --> types
    canvas --> utils
    canvas --> hooks
    canvas --> components
```


## `types` Module

The `types` module must not import any code from outside the module itself.  
It serves as the root of the dependency tree.

Within the `types` module, files may import other files from the same module,  
but such imports must follow the dependency graph defined below.

```mermaid
graph TD
    core --> base
    data --> base
    data --> core
    events --> base
    events --> core
    events --> data
    props --> data
    props --> events
```

- `base`: Fundamental types with no dependencies on other types.
- `core`: Core types that optionally depend only on `base` types.
- `data`: Diagram data types that optionally depend on `base` and `core` types.
- `events`: Event-related types that optionally depend on `base`, `core`, and `data` types.
- `props`: Diagram props types that optionally depend on `data` and `events` types.