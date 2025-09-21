/**
 * Enum-like type defining all available diagram component types.
 * Categorized into basic shapes and specialized node types.
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
	| "Text"
	| "Frame"
	| "Button"
	| "Input"
	| "NodeHeader"
	// Diagrams
	| "Sticky"
	// Nodes
	| "AgentNode"
	| "HubNode"
	| "ImageGenNode"
	| "LLMNode"
	| "PageDesignNode"
	| "SvgToDiagramNode"
	| "TextAreaNode"
	| "VectorStoreNode"
	| "WebSearchNode";
