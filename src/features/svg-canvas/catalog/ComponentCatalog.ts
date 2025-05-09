import type React from "react";

// Import components
import { AgentNode } from "../components/nodes/AgentNode";
import { HubNode } from "../components/nodes/HubNode";
import { ImageGenNode } from "../components/nodes/ImageGenNode";
import { LLMNode } from "../components/nodes/LLMNode";
import { SvgToDiagramNode } from "../components/nodes/SvgToDiagramNode";
import { TextAreaNode } from "../components/nodes/TextAreaNode";
import { VectorStoreNode } from "../components/nodes/VectorStoreNode";
import { WebSearchNode } from "../components/nodes/WebSearchNode";
import { ConnectLine } from "../components/shapes/ConnectLine";
import { Ellipse } from "../components/shapes/Ellipse";
import { Group } from "../components/shapes/Group";
import { Image } from "../components/shapes/Image";
import { Path, PathPoint } from "../components/shapes/Path";
import { Rectangle } from "../components/shapes/Rectangle";
import { Svg } from "../components/shapes/Svg";

// Import types
import type { DiagramType } from "./DiagramTypes";

/**
 * Dummy component for components that are always wrapped by another component.
 */
const DummyComponent: React.FC = () => null;

/**
 * Maps diagram types to their corresponding React components.
 */
export const DiagramComponentCatalog: {
	// biome-ignore lint/suspicious/noExplicitAny: さまざまな図形の共通の型を作成するのは困難なため
	[key in DiagramType]: React.FC<any>;
} = {
	// Shapes
	ConnectLine,
	ConnectPoint: DummyComponent,
	Ellipse,
	Group,
	Image,
	Path,
	PathPoint,
	Rectangle,
	Svg,
	// Nodes
	AgentNode,
	HubNode,
	ImageGenNode,
	SvgToDiagramNode,
	LLMNode,
	TextAreaNode,
	VectorStoreNode,
	WebSearchNode,
};
