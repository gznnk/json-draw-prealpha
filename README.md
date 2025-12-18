# JSON Draw Pre-Alpha

A JSON-based diagram editor with AI integration capabilities. This is a pre-alpha preview release.

This project provides a visual diagram editor built with React and TypeScript. Create interactive diagrams with SVG canvas, supporting various node types including text, images, and AI-enhanced features for workflow automation.

## Live Demo

[https://gznnk.github.io/json-draw-prealpha/](https://gznnk.github.io/json-draw-prealpha/)

## Features

- **Interactive SVG Canvas**: Drag-and-drop nodes, connections, and transformations
- **AI Integration**: OpenAI GPT-4 and Anthropic Claude support
- **Node Types**: LLM, Agent, Text, Image Generation, Web Search, Vector Store, Hub nodes
- **Markdown Support**: Real-time rendering with KaTeX math and syntax highlighting
- **Chat UI**: Streaming responses with markdown rendering

## Quick Start

### Requirements

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd json-draw-prealpha

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Production build
npm run build

# Preview build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## Development Commands

```bash
# Code quality
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm test              # Run tests

# Dependency analysis
npm run dep           # Generate dependency graph and check circular deps
npm run dep:check     # Check circular dependencies only
```

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.
