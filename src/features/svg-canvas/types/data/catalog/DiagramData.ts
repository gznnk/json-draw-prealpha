// Import data types.
import type { HubNodeData } from "../nodes/HubNodeData";
import type { ConnectLineData } from "../shapes/ConnectLineData";
import type { ConnectPointData } from "../shapes/ConnectPointData";
import type { EllipseData } from "../shapes/EllipseData";
import type { GroupData } from "../shapes/GroupData";
import type { ImageData } from "../shapes/ImageData";
import type { PathData } from "../shapes/PathData";
import type { PathPointData } from "../shapes/PathPointData";
import type { RectangleData } from "../shapes/RectangleData";
import type { SvgData } from "../shapes/SvgData";

/**
 * Union type representing all diagram data types.
 * This type corresponds to the Diagram union for state types and is used for serialization.
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
	// Nodes
	| HubNodeData;
