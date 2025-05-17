// Import types related to SvgCanvas.
import type {
	ConnectLineData,
	ConnectPointData,
	EllipseData,
	GroupData,
	HubNodeData,
	ImageData,
	PathData,
	PathPointData,
	RectangleData,
	SvgData,
} from "../types/data";

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
