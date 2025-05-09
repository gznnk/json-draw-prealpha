// Import types from existing files
import type { ConnectLineData } from "../components/shapes/ConnectLine";
import type { ConnectPointData } from "../components/shapes/ConnectPoint";
import type { EllipseData } from "../components/shapes/Ellipse";
import type { GroupData } from "../components/shapes/Group";
import type { ImageData } from "../components/shapes/Image";
import type { PathData, PathPointData } from "../components/shapes/Path";
import type { RectangleData } from "../components/shapes/Rectangle";
import type { SvgData } from "../components/shapes/Svg";
import type { HubNodeData } from "../components/nodes/HubNode";

/**
 * Types of diagram components.
 */
export type DiagramType =
	// Shapes
	| "ConnectLine"
	| "ConnectPoint"
	| "Ellipse"
	| "Group"
	| "Image"
	| "Path"
	| "PathPoint"
	| "Rectangle"
	| "Svg"
	// Nodes
	| "AgentNode"
	| "HubNode"
	| "ImageGenNode"
	| "SvgToDiagramNode"
	| "LLMNode"
	| "TextAreaNode"
	| "VectorStoreNode"
	| "WebSearchNode";

/**
 * Union type representing all diagram data types.
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
