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
