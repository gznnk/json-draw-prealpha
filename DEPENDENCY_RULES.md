# App Dependency Rules

## Architecture

```mermaid
graph TD
    app --> features
    app --> shared
    features --> shared
    features --> features
    shared -. NG .-> others
```
