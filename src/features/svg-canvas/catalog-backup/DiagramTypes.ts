// Import types related to SvgCanvas.
import type {
	ConnectLineData,
	ConnectPointData,
	EllipseData,
	GroupData,
	ImageData,
	PathData,
	PathPointData,
	RectangleData,
	SvgData,
} from "../types/data";
import type { HubNodeData } from "../components/nodes/HubNode";
import type { DiagramType } from "../types/base/DiagramType";

/**
 * Union type representing all diagram data types.
 * This type is used throughout the catalog to ensure type safety.
 */
export type Diagram =
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
	// Nodes
	| HubNodeData;

/**
 * Ensures that the diagram has a type property that is a DiagramType.
 * This is needed for type safety when accessing DiagramComponentCatalog[item.type].
 */
export type TypedDiagram = Diagram & {
	type: DiagramType;
};

// Re-export DiagramType for convenience
export type { DiagramType };
