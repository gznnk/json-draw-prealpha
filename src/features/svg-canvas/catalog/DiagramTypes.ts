// Import types related to SvgCanvas.
import type { ConnectLineData } from "../types/data/shapes/ConnectLineData";
import type { ConnectPointData } from "../types/data/shapes/ConnectPointData";
import type { EllipseData } from "../types/data/shapes/EllipseData";
import type { GroupData } from "../types/data/shapes/GroupData";
import type { HubNodeData } from "../types/data/nodes/HubNodeData";
import type { ImageData } from "../types/data/shapes/ImageData";
import type { PathData } from "../types/data/shapes/PathData";
import type { PathPointData } from "../types/data/shapes/PathPointData";
import type { RectangleData } from "../types/data/shapes/RectangleData";
import type { SvgData } from "../types/data/shapes/SvgData";

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
