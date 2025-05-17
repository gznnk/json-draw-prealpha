# svg-canvas Dependency Rules

## General Rules
```mermaid
graph TD
    utils --> types
    hooks --> types
    hooks --> utils
    components --> types
    components --> utils
    components --> hooks
    canvas --> types
    canvas --> utils
    canvas --> hooks
    canvas --> components
```


## `types` Module
```mermaid
graph TD
    data --> data/core
    data --> data/shapes
    data --> data/nodes
    data/core --> base
    data/shapes --> data/core
    data/shapes --> base
    data/nodes --> data/shapes
    events --> base
    events --> data
    props --> data
    props --> events
```

## `components` Module
```mermaid
graph TD
    core --> icons
    shapes --> core
    nodes --> shapes
    menus --> icons
```