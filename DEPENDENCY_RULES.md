# App Dependency Rules

## Architecture
```mermaid
graph TD
    app --> features
    app --> shared
    features --> shared
    shared -. NG .-> others
```

## Feature
```mermaid
graph TD
    app/App.tsx --> features/llm-chat-ui
    app/App.tsx --> features/svg-canvas
    features/llm-chat-ui --> features/markdown
    features/svg-canvas --> features/markdown
    features/svg-canvas --> shared/ai-tools
```

## FIXME
```mermaid
graph TD
    features/llm-chat-ui -. 避けたい .-> features/svg-canvas
    features/llm-chat-ui -. NG .-> app/tools
```