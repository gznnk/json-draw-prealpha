// Import types.
import type { ButtonState } from "../elements/ButtonState";
import type { AgentNodeState } from "../nodes/AgentNodeState";
import type { HubNodeState } from "../nodes/HubNodeState";
import type { ImageGenNodeState } from "../nodes/ImageGenNodeState";
import type { LLMNodeState } from "../nodes/LLMNodeState";
import type { PageDesignNodeState } from "../nodes/PageDesignNodeState";
import type { SvgToDiagramNodeState } from "../nodes/SvgToDiagramNodeState";
import type { TextAreaNodeState } from "../nodes/TextAreaNodeState";
import type { VectorStoreNodeState } from "../nodes/VectorStoreNodeState";
import type { WebSearchNodeState } from "../nodes/WebSearchNodeState";
import type { ConnectLineState } from "../shapes/ConnectLineState";
import type { ConnectPointState } from "../shapes/ConnectPointState";
import type { EllipseState } from "../shapes/EllipseState";
import type { GroupState } from "../shapes/GroupState";
import type { ImageState } from "../shapes/ImageState";
import type { PathPointState } from "../shapes/PathPointState";
import type { PathState } from "../shapes/PathState";
import type { RectangleState } from "../shapes/RectangleState";
import type { SvgState } from "../shapes/SvgState";

// Import element state types.
import type { FrameState } from "../elements/FrameState";

/**
 * Union type representing all diagram state types.
 * This type is used throughout the catalog to ensure type safety.
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
	// Elements
	| FrameState
	// Diagrams
	| ButtonState
	// Nodes
	| AgentNodeState
	| HubNodeState
	| ImageGenNodeState
	| LLMNodeState
	| PageDesignNodeState
	| SvgToDiagramNodeState
	| TextAreaNodeState
	| VectorStoreNodeState
	| WebSearchNodeState;