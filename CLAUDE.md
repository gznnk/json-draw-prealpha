# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Worktree Management

```bash
npm run create-worktree <branch-name>           # Create new branch and worktree
npm run merge-and-cleanup-worktree "<message>"  # Commit, merge, and cleanup worktree
```

### Core Development

```bash
npm run dev          # Start development server
npm run build        # Build for production (runs tsc -b && vite build)
npm run build:notify # Build for production with notification
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:notify  # Run ESLint with notification
npm run format           # Format all code with Prettier
npm run format:changed   # Format files changed since last commit
npm run format:staged    # Format staged files only
npm run format:untracked # Format untracked files only
npm run format:all       # Format changed + staged + untracked files
npm run format:check     # Check code formatting with Prettier
npm test             # Run Jest tests
npm test:notify      # Run Jest tests with notification
```

### Notifications

```bash
npm run notify                 # Send default notification
npm run notify:success         # Success notification preset
npm run notify:error           # Error notification preset  
npm run notify:build           # Build completion preset
npm run notify:test            # Test completion preset
npm run notify:deploy          # Deployment completion preset

# Custom notifications
npm run notify -- --title "Custom Title" --message "Custom message"
npm run notify -- --build --wait  # Wait for user interaction
npm run notify -- "Quick message" # Simple message
```

### Deployment

```bash
npm run deploy       # Build and deploy to GitHub Pages
```

### Dependency Analysis

```bash
npm run dep          # Generate dependency graph, list, and check circular deps
npm run dep:check    # Check for circular dependencies only
npm run dep:graph    # Generate dependency graph SVG
npm run dep:list     # Output dependency list
npm run dep:circle   # Check circular dependencies with madge
```

## Architecture Overview

This is a React TypeScript application built with Vite that provides an AI-powered visual workflow editor with SVG canvas functionality.

### Project Structure

```
src/
├── app/                    # Main application layer
│   ├── components/         # Core UI components (Header, Body, Page, etc.)
│   ├── hooks/             # Application-level hooks
│   ├── models/            # Data models (Conversation, Work, SvgCanvas)
│   ├── repository/        # Data persistence layer
│   └── tools/             # Application tools
├── features/              # Feature modules
│   ├── svg-canvas/        # Interactive SVG canvas with nodes and connections
│   ├── llm-chat-ui/       # Chat interface for AI interactions
│   └── markdown-editor/   # Markdown editor with preview
├── shared/                # Shared utilities
│   ├── llm-client/        # LLM client abstraction (OpenAI, Anthropic)
│   ├── event-bus/         # Event system
│   └── markdown/          # Markdown processing
└── utils/                 # General utilities
```

### Dependency Rules

- Architecture follows: `app` → `features` → `shared`
- `shared` modules must not depend on other layers
- Cross-feature dependencies should be minimized
- Use the event bus for loose coupling between features

### Key Features

- **SVG Canvas**: Interactive canvas with drag-and-drop nodes, connections, transformations
- **AI Integration**: OpenAI GPT-4 and Anthropic Claude integration
- **Node Types**: LLM, Agent, Text, Image Generation, Web Search, Vector Store, Hub nodes
- **Markdown Support**: Real-time rendering with KaTeX math and syntax highlighting
- **Chat UI**: Streaming responses with markdown rendering

## Coding Standards

### React Components

- Use arrow function syntax with `const ComponentNameComponent`
- Export as `memo(ComponentNameComponent)` for memoization
- No default exports - use named exports only
- Define props using `type` (not `interface`)

```tsx
import { memo } from "react";

const ButtonComponent = (): JSX.Element => {
	return <button>Click</button>;
};

export const Button = memo(ButtonComponent);
```

### TypeScript

- Use explicit typing when intent needs clarity
- Prefer `type` over `interface` for props
- Named exports only (no default exports)
- Use `node:` prefix for Node.js built-in modules

### Code Style (ESLint + Prettier)

- Double quotes for strings
- Semicolons required
- Tab indentation (2-space equivalent)
- Trailing commas in multi-line structures
- Template literals over string concatenation
- Automatic import organization and sorting
- Consistent code formatting with Prettier

## Testing

- Jest with jsdom environment
- Testing Library for React components
- Test files: `**/?(*.)+(spec|test).[tj]s?(x)`

## SVG Canvas Architecture

The SVG canvas is the core feature with complex state management:

- **Canvas State**: Managed through hooks in `features/svg-canvas/canvas/hooks/`
- **Node System**: Various node types in `features/svg-canvas/components/nodes/`
- **Tools System**: Extensible tool system in `features/svg-canvas/tools/`
- **Event System**: Custom event bus for component communication
- **Registry Pattern**: Diagram types registered in `features/svg-canvas/registry/`

### Shape Management

For adding, modifying, or deleting shapes on the canvas, refer to the `adding-shapes.md` documentation which provides detailed guidance on shape operations.

Key canvas capabilities:

- Multi-select with area selection
- Undo/redo history
- Copy/paste functionality
- Node grouping/ungrouping
- Connection lines between nodes
- Minimap navigation
- Zoom and pan
- Transform operations (resize, rotate)

## AI Integration

- LLM client abstraction supports OpenAI and Anthropic
- Workflow agent can generate canvas diagrams from natural language
- Function calling system for AI tool integration
- Streaming responses in chat UI

## Task Completion Verification

**IMPORTANT**: After completing any task, follow these steps:

1. Run `npm run build:notify` to verify that your changes don't introduce build errors (with notification)
2. Fix any TypeScript errors or build issues if they occur
3. Run `npm run lint:notify` to check for ESLint errors and fix any issues (with notification)
4. Run `npm run format:all` to format all modified files (changed + staged + untracked), or use specific commands like `format:changed` if needed
5. **Send completion notification** using `npm run notify:success` or appropriate preset
6. Ask the user if they want to commit the changes
7. If approved, create a commit with an appropriate commit message

**Note**: Use `npm run build`, `npm run lint`, and `npm run test` (without `:notify`) for CI/CD compatibility. Use the `:notify` versions for local development to get completion notifications.

### When to Send Notifications

**MANDATORY** - Send notifications in these scenarios:
- ✅ Task completion: `npm run notify:success`
- ❌ Task failed/errors: `npm run notify:error`
- 🏗️ Build completion: `npm run notify:build` (automatic with `npm run build`)
- 🧪 Test completion: `npm run notify:test` (automatic with `npm run test`)
- 🚀 Deployment: `npm run notify:deploy`

**OPTIONAL** - Consider notifications for:
- Long-running operations (>30 seconds)
- Multi-step task milestones
- Before requesting user review/feedback

## Dependencies Note

This project uses:

- React 19 with Emotion for styling
- OpenAI SDK and Anthropic SDK for AI features
- markdown-it, KaTeX, highlight.js for rich text
- Jest for testing
- ESLint and Prettier for code quality and formatting
