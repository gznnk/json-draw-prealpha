import type { Diagram, DiagramType } from "./DiagramTypes";
import { imageToBlob } from "../components/shapes/Image";
import { svgToBlob } from "../components/shapes/Svg";

/**
 * Maps diagram types to their corresponding export functions.
 * These functions convert diagram elements to exportable formats like Blob.
 */
export const DiagramExportFunctions: {
	[key in DiagramType]: ((diagram: Diagram) => Blob | undefined) | undefined;
} = {
	// Shapes
	ConnectLine: undefined,
	ConnectPoint: undefined,
	Ellipse: undefined,
	Group: undefined,
	Image: imageToBlob,
	Path: undefined,
	PathPoint: undefined,
	Rectangle: undefined,
	Svg: svgToBlob,
	// Nodes
	AgentNode: undefined,
	HubNode: undefined,
	ImageGenNode: undefined,
	SvgToDiagramNode: undefined,
	LLMNode: undefined,
	TextAreaNode: undefined,
	VectorStoreNode: undefined,
	WebSearchNode: undefined,
};
