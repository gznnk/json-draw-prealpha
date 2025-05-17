// Import types.
import type { ConnectPointMoveData } from "../types/events/ConnectPointMoveData";
import type { DiagramType } from "../types/base/DiagramType";
import type { Diagram } from "./DiagramTypes";

// Import utils.
import { calcEllipseConnectPointPosition } from "../utils/shapes/ellipse/calcEllipseConnectPointPosition";
import { calcRectangleConnectPointPosition } from "../utils/shapes/rectangle/calcRectangleConnectPointPosition";

/**
 * Maps diagram types to their corresponding connect point calculation functions.
 * These functions determine where connection points should be positioned on different shapes.
 */
export const DiagramConnectPointCalculators: {
	[key in DiagramType]: (diagram: Diagram) => ConnectPointMoveData[];
} = {
	// Shapes
	ConnectLine: () => [],
	ConnectPoint: () => [],
	Ellipse: (diagram) => calcEllipseConnectPointPosition(diagram),
	Group: () => [],
	Image: () => [],
	Path: () => [],
	PathPoint: () => [],
	Rectangle: (diagram) => calcRectangleConnectPointPosition(diagram),
	Svg: () => [],
	// Nodes
	AgentNode: (diagram) => calcRectangleConnectPointPosition(diagram),
	HubNode: (diagram) => calcEllipseConnectPointPosition(diagram),
	ImageGenNode: (diagram) => calcRectangleConnectPointPosition(diagram),
	SvgToDiagramNode: (diagram) => calcRectangleConnectPointPosition(diagram),
	LLMNode: (diagram) => calcRectangleConnectPointPosition(diagram),
	TextAreaNode: (diagram) => calcRectangleConnectPointPosition(diagram),
	VectorStoreNode: (diagram) => calcRectangleConnectPointPosition(diagram),
	WebSearchNode: (diagram) => calcRectangleConnectPointPosition(diagram),
};
