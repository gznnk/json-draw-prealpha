# Adding New Shapes to SVG Canvas

This document outlines the complete procedure for adding new shapes to the SVG canvas system. The architecture follows a structured pattern that ensures consistency and maintainability across all shape implementations.

## Architecture Overview

The SVG canvas shape system consists of several key components:
- **Components**: React components that render the shapes
- **Types**: TypeScript definitions for data and state
- **Constants**: Default values for data and state
- **Utils**: Utility functions for shape operations
- **Registry**: Central registration system for shape definitions

## Shape Types: Shapes vs. Nodes

Before adding new elements, it's important to understand the distinction:

- **Shapes**: Basic geometric elements (Rectangle, Ellipse, Path, etc.) - placed in `shapes/` folders
- **Nodes**: Workflow/diagram nodes with specific business logic (LLM, Agent, Hub, etc.) - placed in `nodes/` folders

Both follow similar patterns but have different purposes and locations.

## Required Files Checklist

When adding a new shape (e.g., "MyShape"), you must create the following files:

### 1. Component Files

**For Shapes:**
```
src/features/svg-canvas/components/shapes/MyShape/
├── index.tsx                    # Export barrel
├── MyShape.tsx                  # Main component
├── MyShapeMinimap.tsx          # Minimap representation
└── MyShapeStyled.tsx           # Styled components (if needed)
```

**For Workflow Nodes:**
```
src/features/svg-canvas/components/nodes/MyNode/
├── index.tsx                    # Export barrel
├── MyNode.tsx                   # Main component
├── MyNodeMinimap.tsx           # Minimap representation
└── MyNodeStyled.tsx            # Styled components (if needed)
```

### 2. Type Definitions

**For Shapes:**
```
src/features/svg-canvas/types/data/shapes/MyShapeData.ts     # Data type definition
src/features/svg-canvas/types/state/shapes/MyShapeState.ts   # State type definition  
src/features/svg-canvas/types/props/shapes/MyShapeProps.ts   # Props type definition
```

**For Workflow Nodes:**
```
src/features/svg-canvas/types/data/nodes/MyNodeData.ts       # Data type definition
src/features/svg-canvas/types/state/nodes/MyNodeState.ts     # State type definition  
src/features/svg-canvas/types/props/nodes/MyNodeProps.ts     # Props type definition
```

### 3. Default Values

**For Shapes:**
```
src/features/svg-canvas/constants/data/shapes/MyShapeDefaultData.ts    # Default data values
src/features/svg-canvas/constants/state/shapes/MyShapeDefaultState.ts  # Default state values
```

**For Workflow Nodes:**
```
src/features/svg-canvas/constants/data/nodes/MyNodeDefaultData.ts      # Default data values
src/features/svg-canvas/constants/state/nodes/MyNodeDefaultState.ts    # Default state values
```

### 4. Utility Functions

**For Shapes:**
```
src/features/svg-canvas/utils/shapes/myShape/
├── createMyShapeState.ts           # State creation function
├── mapMyShapeDataToState.ts        # Data to state mapper
├── mapMyShapeStateToData.ts        # State to data mapper
├── calcMyShapeConnectPointPosition.ts  # Connect point calculator (if connectable)
└── createMyShapeConnectPoint.ts    # Connect point creator (if connectable)
```

**For Workflow Nodes:**
```
src/features/svg-canvas/utils/nodes/myNode/
├── createMyNodeState.ts            # State creation function
├── mapMyNodeDataToState.ts         # Data to state mapper
├── mapMyNodeStateToData.ts         # State to data mapper
├── calcMyNodeConnectPointPosition.ts   # Connect point calculator (if connectable)
└── createMyNodeConnectPoint.ts     # Connect point creator (if connectable)
```

## Step-by-Step Implementation Guide

**Note**: This guide uses "MyShape" as an example for basic shapes. For workflow nodes, replace "MyShape" with "MyNode" and use the `nodes/` folder structure instead of `shapes/` throughout the guide.

### Step 1: Define Shape Features and Data Type

Create `src/features/svg-canvas/types/data/shapes/MyShapeData.ts`:

```typescript
// Import types.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { CreateDataType } from "./CreateDataType";

/**
 * Diagram features for MyShape shapes.
 */
export const MyShapeFeatures = {
	transformative: true,     // Can be transformed (resize, rotate)
	connectable: true,        // Can connect to other shapes
	strokable: true,          // Has stroke properties
	fillable: true,           // Has fill properties
	textable: true,           // Can contain text
	selectable: true,         // Can be selected
	fileDroppable: false,     // Can accept file drops
} as const satisfies DiagramFeatures;

/**
 * Data type for MyShape shapes.
 * Contains properties specific to MyShape diagram elements.
 */
export type MyShapeData = CreateDataType<typeof MyShapeFeatures> & {
	// Add shape-specific properties here
	customProperty: number;
};
```

### Step 2: Define State Type

Create `src/features/svg-canvas/types/state/shapes/MyShapeState.ts`:

```typescript
// Import types.
import type {
	MyShapeData,
	MyShapeFeatures,
} from "../../data/shapes/MyShapeData";
import type { CreateStateType } from "./CreateStateType";

/**
 * State type for MyShape shapes.
 * Contains properties specific to MyShape diagram elements.
 */
export type MyShapeState = CreateStateType<
	MyShapeData,
	typeof MyShapeFeatures
>;
```

### Step 3: Define Props Type

Create `src/features/svg-canvas/types/props/shapes/MyShapeProps.ts`:

```typescript
// Import types.
import type { MyShapeFeatures } from "../../data/shapes/MyShapeData";
import type { MyShapeState } from "../../state/shapes/MyShapeState";
import type { CreateDiagramProps } from "./CreateDiagramProps";

/**
 * Props for MyShape component
 */
export type MyShapeProps = CreateDiagramProps<
	MyShapeState,
	typeof MyShapeFeatures
>;
```

### Step 4: Create Default Data Values

Create `src/features/svg-canvas/constants/data/shapes/MyShapeDefaultData.ts`:

```typescript
// Import types.
import type { MyShapeData } from "../../../types/data/shapes/MyShapeData";

// Import constants.
import { CreateDefaultData } from "./CreateDefaultData";

/**
 * Default data values for MyShape
 */
export const MyShapeDefaultData: MyShapeData = {
	...CreateDefaultData.MyShape,
	customProperty: 0,
};
```

### Step 5: Create Default State Values

Create `src/features/svg-canvas/constants/state/shapes/MyShapeDefaultState.ts`:

```typescript
// Import types.
import type { MyShapeState } from "../../../types/state/shapes/MyShapeState";

// Import constants.
import { CreateDefaultState } from "./CreateDefaultState";

/**
 * Default state values for MyShape
 */
export const MyShapeDefaultState: MyShapeState = CreateDefaultState.MyShape;
```

### Step 6: Implement Utility Functions

Create the state creation function in `src/features/svg-canvas/utils/shapes/myShape/createMyShapeState.ts`:

```typescript
// Import types.
import type { MyShapeState } from "../../../types/state/shapes/MyShapeState";

// Import constants.
import { MyShapeDefaultState } from "../../../constants/state/shapes/MyShapeDefaultState";

// Import utils.
import { newId } from "../common/newId";

/**
 * Create MyShape state
 */
export const createMyShapeState = ({ x, y }: { x: number; y: number }): MyShapeState => ({
	...MyShapeDefaultState,
	id: newId(),
	x,
	y,
});
```

Create data-to-state mapper in `src/features/svg-canvas/utils/shapes/myShape/mapMyShapeDataToState.ts`:

```typescript
// Import types.
import type { MyShapeData } from "../../../types/data/shapes/MyShapeData";
import type { MyShapeState } from "../../../types/state/shapes/MyShapeState";

// Import constants.
import { MyShapeDefaultState } from "../../../constants/state/shapes/MyShapeDefaultState";

// Import utils.
import { mapCreateDataToState } from "../common/mapCreateDataToState";

/**
 * Maps MyShape data to state
 */
export const mapMyShapeDataToState = (data: MyShapeData): MyShapeState => ({
	...MyShapeDefaultState,
	...mapCreateDataToState(data),
	customProperty: data.customProperty,
});
```

Create state-to-data mapper in `src/features/svg-canvas/utils/shapes/myShape/mapMyShapeStateToData.ts`:

```typescript
// Import types.
import type { MyShapeData } from "../../../types/data/shapes/MyShapeData";
import type { MyShapeState } from "../../../types/state/shapes/MyShapeState";

// Import utils.
import { mapCreateStateToData } from "../common/mapCreateStateToData";

/**
 * Maps MyShape state to data
 */
export const mapMyShapeStateToData = (state: MyShapeState): MyShapeData => ({
	...mapCreateStateToData(state),
	customProperty: state.customProperty,
});
```

### Step 7: Implement Connect Point Functions (if connectable)

If your shape supports connections, create connect point calculator in `src/features/svg-canvas/utils/shapes/myShape/calcMyShapeConnectPointPosition.ts`:

```typescript
// Import types.
import type { Diagram } from "../../../types/state/catalog/Diagram";
import type { ConnectPointState } from "../../../types/state/shapes/ConnectPointState";
import type { MyShapeState } from "../../../types/state/shapes/MyShapeState";

// Import utils.
import { createMyShapeConnectPoint } from "./createMyShapeConnectPoint";

/**
 * Calculate connect point positions for MyShape
 */
export const calcMyShapeConnectPointPosition = (diagram: Diagram): ConnectPointState[] => {
	const shape = diagram as MyShapeState;
	return [
		createMyShapeConnectPoint(shape, "top"),
		createMyShapeConnectPoint(shape, "right"),
		createMyShapeConnectPoint(shape, "bottom"),
		createMyShapeConnectPoint(shape, "left"),
	];
};
```

Create connect point creator in `src/features/svg-canvas/utils/shapes/myShape/createMyShapeConnectPoint.ts`:

```typescript
// Import types.
import type { ConnectPointState } from "../../../types/state/shapes/ConnectPointState";
import type { MyShapeState } from "../../../types/state/shapes/MyShapeState";

// Import constants.
import { ConnectPointDefaultState } from "../../../constants/state/shapes/ConnectPointDefaultState";

// Import utils.
import { newId } from "../common/newId";

/**
 * Create connect point for MyShape
 */
export const createMyShapeConnectPoint = (
	shape: MyShapeState,
	position: "top" | "right" | "bottom" | "left",
): ConnectPointState => {
	// Calculate position based on shape dimensions and position
	let x = shape.x;
	let y = shape.y;
	
	switch (position) {
		case "top":
			y = shape.y - shape.height / 2;
			break;
		case "right":
			x = shape.x + shape.width / 2;
			break;
		case "bottom":
			y = shape.y + shape.height / 2;
			break;
		case "left":
			x = shape.x - shape.width / 2;
			break;
	}

	return {
		...ConnectPointDefaultState,
		id: newId(),
		x,
		y,
		ownerId: shape.id,
	};
};
```

### Step 8: Implement React Components

Create the main component in `src/features/svg-canvas/components/shapes/MyShape/MyShape.tsx`:

```typescript
// Import React.
import type React from "react";
import { memo, useMemo, useRef } from "react";

// Import types.
import type { MyShapeProps } from "../../../types/props/shapes/MyShapeProps";

// Import components.
import { Outline } from "../../core/Outline";
import { PositionLabel } from "../../core/PositionLabel";
import { Textable } from "../../core/Textable";
import { Transformative } from "../../core/Transformative";
import { ConnectPoints } from "../ConnectPoints";

// Import hooks.
import { useClick } from "../../../hooks/useClick";
import { useDrag } from "../../../hooks/useDrag";
import { useFileDrop } from "../../../hooks/useFileDrop";
import { useHover } from "../../../hooks/useHover";
import { useSelect } from "../../../hooks/useSelect";
import { useText } from "../../../hooks/useText";

// Import utils.
import { mergeProps } from "../../../utils/core/mergeProps";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";

/**
 * MyShape component
 */
const MyShapeComponent: React.FC<MyShapeProps> = ({
	// Extract all required props here
	id,
	x,
	y,
	width,
	height,
	// ... other props
}) => {
	// Reference to the SVG element to be transformed
	const svgRef = useRef<SVGElement>({} as SVGElement);

	// Implement hooks for interaction (drag, click, select, etc.)
	const { onDoubleClick } = useText({
		id,
		isSelected,
		isTextEditEnabled,
		onTextChange,
	});

	const dragProps = useDrag({
		id,
		type: "MyShape",
		x,
		y,
		ref: svgRef,
		onDrag,
		onDragOver,
		onDragLeave,
	});

	// ... other hooks

	// Merge all interaction props
	const composedProps = mergeProps(
		dragProps,
		clickProps,
		selectProps,
		hoverProps,
		fileDropProps,
	);

	// Memoize owner shape for connect points
	const ownerShape = useMemo(
		() => ({
			x,
			y,
			width,
			height,
			rotation,
			scaleX,
			scaleY,
		}),
		[x, y, width, height, rotation, scaleX, scaleY],
	);

	// Generate transform attribute
	const transform = createSvgTransform(
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	return (
		<>
			{/* Main SVG element - implement your shape here */}
			{/* Example: <rect>, <circle>, <path>, etc. */}
			
			{/* Text support */}
			{isTextEditEnabled && (
				<Textable
					x={-width / 2}
					y={-height / 2}
					width={width}
					height={height}
					transform={transform}
					text={text}
					textType={textType}
					fontColor={fontColor}
					fontSize={fontSize}
					fontFamily={fontFamily}
					fontWeight={fontWeight}
					textAlign={textAlign}
					verticalAlign={verticalAlign}
					isTextEditing={isTextEditing}
				/>
			)}
			
			{/* Selection outline */}
			<Outline
				x={x}
				y={y}
				width={width}
				height={height}
				rotation={rotation}
				scaleX={scaleX}
				scaleY={scaleY}
				showOutline={showOutline}
			/>
			
			{/* Transform controls */}
			{showTransformControls && (
				<Transformative
					id={id}
					type="MyShape"
					x={x}
					y={y}
					width={width}
					height={height}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
					keepProportion={keepProportion}
					showTransformControls={showTransformControls}
					isTransforming={isTransforming}
					onTransform={onTransform}
				/>
			)}
			
			{/* Connect points */}
			<ConnectPoints
				ownerId={id}
				ownerShape={ownerShape}
				connectPoints={connectPoints}
				showConnectPoints={showConnectPoints}
				shouldRender={!isDragging && !isTransforming && !isSelected}
				onConnect={onConnect}
				onPreviewConnectLine={onPreviewConnectLine}
			/>
			
			{/* Position label during drag */}
			{isSelected && isDragging && (
				<PositionLabel
					x={x}
					y={y}
					width={width}
					height={height}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
				/>
			)}
		</>
	);
};

export const MyShape = memo(MyShapeComponent);
```

Create the minimap component in `src/features/svg-canvas/components/shapes/MyShape/MyShapeMinimap.tsx`:

```typescript
// Import React.
import type React from "react";
import { memo } from "react";

// Import types.
import type { MyShapeProps } from "../../../types/props/shapes/MyShapeProps";

// Import utils.
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";

/**
 * MyShape minimap component (simplified version for minimap)
 */
const MyShapeMinimapComponent: React.FC<MyShapeProps> = ({
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	fill,
	stroke,
	strokeWidth,
}) => {
	// Generate transform attribute
	const transform = createSvgTransform(
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	return (
		<>
			{/* Simplified version of your shape for minimap */}
			{/* Remove interactivity, text, and complex features */}
		</>
	);
};

export const MyShapeMinimap = memo(MyShapeMinimapComponent);
```

Create the export barrel in `src/features/svg-canvas/components/shapes/MyShape/index.tsx`:

```typescript
export { MyShape } from "./MyShape";
export { MyShapeMinimap } from "./MyShapeMinimap";
```

### Step 9: Create Atlas Object

Create an Atlas object for your shape/node. 

**For Shapes**, create in `src/features/svg-canvas/atlas/shapes/MyShapeAtlas.ts`:  
**For Workflow Nodes**, create in `src/features/svg-canvas/atlas/nodes/MyNodeAtlas.ts`:

```typescript
/**
 * MyShape Atlas (or MyNode Atlas for workflow nodes)
 *
 * Complete index and registry for MyShape-related components.
 * This atlas provides centralized access to all MyShape-related types,
 * default values, components, and utility functions.
 */
// ============================================================================
// Types
// ============================================================================
import type {
	DiagramAtlas,
	DataToStateMapper,
	StateToDataMapper,
} from "../DiagramAtlas";
import type { MyShapeData } from "../../types/data/shapes/MyShapeData";
import type { MyShapeState } from "../../types/state/shapes/MyShapeState";
import type { MyShapeProps } from "../../types/props/shapes/MyShapeProps";
import { MyShapeFeatures } from "../../types/data/shapes/MyShapeData";

// ============================================================================
// Defaults
// ============================================================================
import { MyShapeDefaultData } from "../../constants/data/shapes/MyShapeDefaultData";
import { MyShapeDefaultState } from "../../constants/state/shapes/MyShapeDefaultState";

// ============================================================================
// Components
// ============================================================================
import { MyShape, MyShapeMinimap } from "../../components/shapes/MyShape";

// ============================================================================
// Utility Functions
// ============================================================================
import { createMyShapeState } from "../../utils/shapes/myShape/createMyShapeState";
import { calcMyShapeConnectPointPosition } from "../../utils/shapes/myShape/calcMyShapeConnectPointPosition";
import { mapMyShapeDataToState } from "../../utils/shapes/myShape/mapMyShapeDataToState";
import { mapMyShapeStateToData } from "../../utils/shapes/myShape/mapMyShapeStateToData";

/**
 * MyShape Atlas Type Definition
 */
type MyShapeAtlas = DiagramAtlas<
	MyShapeData,
	MyShapeState,
	MyShapeProps
>;

/**
 * MyShape Atlas Implementation
 */
export const MyShapeAtlas: MyShapeAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "MyShape",
	features: MyShapeFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: MyShapeDefaultData,
	defaultState: MyShapeDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: MyShape,
	minimapComponent: MyShapeMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createMyShapeState,
	export: undefined, // Optional: implement if shape can be exported
	calcConnectPointPosition: calcMyShapeConnectPointPosition,
	dataToState: mapMyShapeDataToState as DataToStateMapper,
	stateToData: mapMyShapeStateToData as StateToDataMapper,
};
```

**Note for Workflow Nodes**: Replace `shapes/` paths with `nodes/` and use appropriate node-specific imports (e.g., `calcRectangleConnectPointPosition` for most nodes).

### Step 10: Register the Atlas

Add your Atlas to the registry in `src/features/svg-canvas/canvas/SvgCanvasRegistry.ts`:

```typescript
// Import your Atlas object
import { MyShapeAtlas } from "../atlas/shapes/MyShapeAtlas";
// OR for nodes: import { MyNodeAtlas } from "../atlas/nodes/MyNodeAtlas";

// Register your Atlas in the appropriate category (maintain alphabetical order)
export const initializeSvgCanvasDiagrams = (): void => {
	// Clear existing registrations to avoid duplicates
	DiagramRegistry.clear();

	// ============================================================================
	// Shape Atlas Registration
	// ============================================================================
	DiagramRegistry.register(ConnectLineAtlas);
	DiagramRegistry.register(ConnectPointAtlas);
	DiagramRegistry.register(EllipseAtlas);
	DiagramRegistry.register(GroupAtlas);
	DiagramRegistry.register(ImageAtlas);
	DiagramRegistry.register(MyShapeAtlas); // Add your shape Atlas here (alphabetical order)
	DiagramRegistry.register(PathAtlas);
	DiagramRegistry.register(PathPointAtlas);
	DiagramRegistry.register(RectangleAtlas);
	DiagramRegistry.register(SvgAtlas);
	DiagramRegistry.register(TextAtlas);

	// ============================================================================
	// Node Atlas Registration
	// ============================================================================
	DiagramRegistry.register(AgentNodeAtlas);
	DiagramRegistry.register(HubNodeAtlas);
	DiagramRegistry.register(ImageGenNodeAtlas);
	DiagramRegistry.register(LLMNodeAtlas);
	DiagramRegistry.register(MyNodeAtlas); // OR add your node Atlas here (alphabetical order)
	DiagramRegistry.register(PageDesignNodeAtlas);
	DiagramRegistry.register(SvgToDiagramNodeAtlas);
	DiagramRegistry.register(TextAreaNodeAtlas);
	DiagramRegistry.register(VectorStoreNodeAtlas);
	DiagramRegistry.register(WebSearchNodeAtlas);
};
```

### Step 11: Update Type Definitions

Add your shape type to the DiagramType union in `src/features/svg-canvas/types/core/DiagramType.ts`:

```typescript
export type DiagramType =
	| "Rectangle"
	| "Ellipse"
	| "MyShape"  // Add your shape here
	// ... other types
```

### Step 12: Update Catalog Type Unions

**IMPORTANT**: You must add your new type to the catalog union types:

Add your data type to `src/features/svg-canvas/types/data/catalog/DiagramData.ts`:

```typescript
// Import your data type
import type { MyShapeData } from "../shapes/MyShapeData";
// OR for nodes: import type { MyNodeData } from "../nodes/MyNodeData";

/**
 * Union type representing all diagram data types.
 */
export type DiagramData =
	// Shapes
	| ConnectLineData
	| ConnectPointData
	| EllipseData
	| GroupData
	| ImageData
	| PathData
	| PathPointData
	| RectangleData
	| SvgData
	| MyShapeData  // Add your shape data type here
	// Nodes
	| HubNodeData;
	// | MyNodeData  // OR add your node data type here
```

Add your state type to `src/features/svg-canvas/types/state/catalog/Diagram.ts`:

```typescript
// Import your state type
import type { MyShapeState } from "../shapes/MyShapeState";
// OR for nodes: import type { MyNodeState } from "../nodes/MyNodeState";

/**
 * Union type representing all diagram state types.
 */
export type Diagram =
	// Shapes
	| ConnectLineState
	| ConnectPointState
	| EllipseState
	| GroupState
	| ImageState
	| PathState
	| PathPointState
	| RectangleState
	| SvgState
	| MyShapeState  // Add your shape state type here
	// Nodes
	| HubNodeState;
	// | MyNodeState  // OR add your node state type here
```

### Step 13: Update Default Data Constants

Add your shape's default data to `src/features/svg-canvas/constants/data/shapes/CreateDefaultData.ts`:

```typescript
export const CreateDefaultData = {
	// ... existing shapes
	MyShape: {
		// Define default values for your shape
		...DiagramBaseDefaultData,
		...TransformativeDefaultData,
		...StrokableDefaultData,
		...FillableDefaultData,
		...TextableDefaultData,
		customProperty: 0,
	},
} as const;
```

Add your shape's default state to `src/features/svg-canvas/constants/state/shapes/CreateDefaultState.ts`:

```typescript
export const CreateDefaultState = {
	// ... existing shapes
	MyShape: {
		...DiagramBaseDefaultState,
		...TransformativeDefaultState,
		...SelectableDefaultState,
		...StrokableDefaultState,
		...FillableDefaultState,
		...TextableDefaultState,
		...ItemableDefaultState,
		customProperty: 0,
	},
} as const;
```

### Step 14: Verify All Exports

Ensure all your new files are properly exported through their respective index files:

**For shapes**, update exports in:
- `src/features/svg-canvas/components/shapes/index.ts` (if exists)
- `src/features/svg-canvas/types/data/shapes/index.ts` (if exists)
- `src/features/svg-canvas/types/state/shapes/index.ts` (if exists)
- `src/features/svg-canvas/utils/shapes/index.ts` (if exists)

**For nodes**, update exports in:
- `src/features/svg-canvas/components/nodes/index.ts` (if exists)
- `src/features/svg-canvas/types/data/nodes/index.ts` (if exists)
- `src/features/svg-canvas/types/state/nodes/index.ts` (if exists)
- `src/features/svg-canvas/utils/nodes/index.ts` (if exists)

## Important Design Patterns

### 1. Feature Composition
- Use the feature system to compose capabilities (transformative, connectable, etc.)
- Only include features your shape actually needs
- Features determine which props and state properties are available

### 2. Memoization
- Always wrap components with `memo()` for performance
- Use `useMemo()` for expensive calculations and object creation
- Memoize the `ownerShape` object for connect points

### 3. Hook Integration
- Use the provided interaction hooks (useDrag, useClick, useSelect, etc.)
- Merge hook properties using `mergeProps()`
- Follow the established pattern for hook composition

### 4. Transform System
- Use `createSvgTransform()` for consistent transformation
- Apply transforms to the main SVG element
- Remember that shapes are positioned from their center point

### 5. Connect Point System
- Implement connect points if your shape should support connections
- Calculate positions relative to the shape's center and dimensions
- Use the established connect point creation pattern

## Testing Your Shape

1. **Build the application**: Run `npm run build` to ensure no TypeScript errors
2. **Visual testing**: Add your shape to a test diagram and verify:
   - Rendering appears correct
   - Selection works properly
   - Dragging functions correctly
   - Transform controls work (if transformative)
   - Connect points appear and function (if connectable)
   - Text editing works (if textable)
3. **Minimap testing**: Verify your shape appears correctly in the minimap

## Common Pitfalls

1. **Missing Atlas creation**: Don't forget to create the Atlas object for your shape/node
2. **Missing Atlas registration**: Ensure your Atlas is registered in SvgCanvasRegistry
3. **Atlas organization**: Put shape Atlas in `atlas/shapes/`, node Atlas in `atlas/nodes/`
4. **Alphabetical ordering**: Maintain alphabetical order in registry and import statements
5. **Missing exports**: Ensure all new files are properly exported through index files
6. **Type mismatches**: Verify that your data, state, and props types align correctly
7. **Catalog union types**: Must add your types to both `DiagramData.ts` and `Diagram.ts` unions
8. **DiagramType union**: Must add your type string to the `DiagramType` union
9. **Default value consistency**: Ensure default data and state values are consistent
10. **Transform center**: Remember that shapes are positioned from their center, not top-left
11. **Feature consistency**: Make sure your component implementation matches declared features
12. **Folder structure**: Use `shapes/` for basic elements, `nodes/` for workflow nodes
13. **Atlas imports**: Use proper import paths in your Atlas files (../../types/, ../../components/, etc.)

By following this guide, you'll create a shape that integrates seamlessly with the existing SVG canvas architecture while maintaining consistency and performance.

## Atlas System Benefits

The new Atlas system provides several advantages:

1. **Centralized Organization**: All shape/node-related code is organized in one place
2. **Type Safety**: Atlas objects ensure consistent type definitions across all components
3. **Developer Reference**: Atlas files serve as comprehensive documentation
4. **Maintainability**: Changes to a diagram type only require updating the Atlas file
5. **Consistency**: Uniform structure across all diagram types
6. **Discovery**: Easy to find all components, utilities, and types for a diagram type

Each Atlas object consolidates:
- Type definitions (Data, State, Props, Features)
- Default values (DefaultData, DefaultState)
- React components (Component, MinimapComponent)
- Utility functions (createState, mappers, calculators)
- Export functions (if applicable)

This makes the system more maintainable and easier to understand for developers working with the SVG canvas.