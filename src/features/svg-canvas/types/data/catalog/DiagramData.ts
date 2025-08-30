// Import data types.
import type { ButtonData } from "../elements/ButtonData";
import type { AgentNodeData } from "../nodes/AgentNodeData";
import type { HubNodeData } from "../nodes/HubNodeData";
import type { ImageGenNodeData } from "../nodes/ImageGenNodeData";
import type { LLMNodeData } from "../nodes/LLMNodeData";
import type { PageDesignNodeData } from "../nodes/PageDesignNodeData";
import type { SvgToDiagramNodeData } from "../nodes/SvgToDiagramNodeData";
import type { TextAreaNodeData } from "../nodes/TextAreaNodeData";
import type { VectorStoreNodeData } from "../nodes/VectorStoreNodeData";
import type { WebSearchNodeData } from "../nodes/WebSearchNodeData";
import type { ConnectLineData } from "../shapes/ConnectLineData";
import type { ConnectPointData } from "../shapes/ConnectPointData";
import type { EllipseData } from "../shapes/EllipseData";
import type { GroupData } from "../shapes/GroupData";
import type { ImageData } from "../shapes/ImageData";
import type { PathData } from "../shapes/PathData";
import type { PathPointData } from "../shapes/PathPointData";
import type { RectangleData } from "../shapes/RectangleData";
import type { SvgData } from "../shapes/SvgData";

// Import element data types.
import type { FrameData } from "../elements/FrameData";

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
	// Elements
	| FrameData
	// Diagrams
	| ButtonData
	// Nodes
	| AgentNodeData
	| HubNodeData
	| ImageGenNodeData
	| LLMNodeData
	| PageDesignNodeData
	| SvgToDiagramNodeData
	| TextAreaNodeData
	| VectorStoreNodeData
	| WebSearchNodeData;