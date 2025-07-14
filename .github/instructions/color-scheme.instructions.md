# Ant Design Blue Theme Color Scheme

This document outlines the color scheme used in the application's blue theme, based on Ant Design's design system. The color palette is designed to provide a consistent visual experience while ensuring accessibility and readability.

## Primary Colors

### Background Colors
- **Main Background**: `#0C0F1C` (Very dark blue)
- **Section Background**: `#1A1F33` (Dark navy)
- **Card/Element Background**: `#2A2F4C` (Dark blue)

### Text Colors
- **Primary Text**: `#C0C4D2` (Light gray with blue tint)
- **Secondary Text**: `#B0B0B0` (Medium gray)
- **Placeholder Text**: `#666B82` (Dark gray with blue tint)

### Accent Colors - Ant Design Blue
- **Primary Blue**: `#1890ff` (Ant Design primary color)
- **Primary Blue RGBA**: `rgba(24, 144, 255, 1)` (Solid primary blue)
- **Primary Blue Semi-Transparent**: `rgba(24, 144, 255, 0.8)` (80% opacity)
- **Primary Blue Light**: `rgba(24, 144, 255, 0.1)` (10% opacity for backgrounds)
- **Link Default**: `#1890ff` (Ant Design blue)
- **Link Hover**: `#40a9ff` (Ant Design blue hover state)

## UI Element Colors

### SVG Canvas Elements
- **Grid Pattern**: `rgba(24, 144, 255, 0.1)` (Light blue grid)
- **Drag Points**: `rgba(24, 144, 255, 0.8)` (Semi-transparent blue)
- **Selection Outline**: `rgba(24, 144, 255, 0.8)` (Semi-transparent blue)
- **Dash Pattern**: `strokeDasharray="4,2"` (4px dash, 2px gap)

### Code and Syntax
- **Code Block Background**: `#1A1F33` (Dark navy)
- **Inline Code Background**: `#2A2F4C` (Dark blue)
- **Code Border**: `rgba(24, 144, 255, 0.15)` (Light blue border)

### Interactive Elements
- **Caret Indicator**: `#B0B0B0` (Medium gray)
- **Input Border**: `#2A2F4C` (Dark blue)
- **Input Border Focus**: `rgba(24, 144, 255, 0.6)` (Blue focus state)
- **Button Primary**: `#1890ff` (Ant Design primary button)
- **Button Primary Hover**: `#40a9ff` (Ant Design button hover)

## Ant Design Color Values

### Core Blue Palette
- **Blue-1**: `#e6f7ff` (Lightest blue)
- **Blue-3**: `#91d5ff` (Light blue)
- **Blue-6**: `#1890ff` (Primary blue - main theme color)
- **Blue-7**: `#096dd9` (Darker blue)
- **Blue-10**: `#002766` (Darkest blue)

## Usage Guidelines

1. Use Ant Design blue (`#1890ff`) as the primary accent color throughout the application:
   - SVG canvas elements (grids, drag points, outlines)
   - Interactive elements (buttons, links, focus states)
   - Selection indicators and highlighting

2. Apply transparency levels consistently:
   - `rgba(24, 144, 255, 0.1)` for subtle background elements (grids)
   - `rgba(24, 144, 255, 0.8)` for interactive elements (drag points, outlines)
   - `rgba(24, 144, 255, 1)` for primary actions and focus states

3. Maintain visual hierarchy with background colors:
   - `#0C0F1C` for the main application background
   - `#1A1F33` for content sections and code blocks
   - `#2A2F4C` for UI elements, cards, and user messages

4. Ensure proper contrast between blue elements and backgrounds for accessibility.

5. Use consistent dash patterns (`strokeDasharray="4,2"`) for SVG dashed elements.

6. Apply blue theme colors consistently across all components to maintain Ant Design compatibility.
