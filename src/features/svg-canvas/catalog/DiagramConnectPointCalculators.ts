import type { ConnectPointMoveData } from "../types/events";
import type { Diagram, DiagramType } from "./DiagramTypes";
import { calcEllipseConnectPointPosition } from "../components/shapes/Ellipse";
import { calcRectangleConnectPointPosition } from "../components/shapes/Rectangle";

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
