// Import types.
import type { HubNodeState } from "../nodes/HubNodeState";
import type { ConnectLineState } from "../shapes/ConnectLineState";
import type { ConnectPointState } from "../shapes/ConnectPointState";
import type { EllipseState } from "../shapes/EllipseState";
import type { GroupState } from "../shapes/GroupState";
import type { ImageState } from "../shapes/ImageState";
import type { PathPointState } from "../shapes/PathPointState";
import type { PathState } from "../shapes/PathState";
import type { RectangleState } from "../shapes/RectangleState";
import type { SvgState } from "../shapes/SvgState";
import type { TextState } from "../shapes/TextState";
import type { ButtonState } from "../diagrams/ButtonState";

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
	| TextState
	// Diagrams
	| ButtonState
	// Nodes
	| HubNodeState;
