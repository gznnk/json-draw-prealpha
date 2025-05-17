import type { DiagramType } from "../types/base/DiagramType";

// Import components related to SvgCanvas.
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

/**
 * Dummy component for components that are always wrapped by another component.
 */
const DummyComponent: React.FC = () => null;

/**
 * Maps diagram types to their corresponding React components.
 */
export const DiagramComponentCatalog: {
	// biome-ignore lint/suspicious/noExplicitAny: さまざまな図形の共通の型を作成するのは困難なため
	[key in DiagramType]: () => React.FC<any>;
} = {
	// Shapes
	ConnectLine: () => ConnectLine,
	ConnectPoint: () => DummyComponent,
	Ellipse: () => Ellipse,
	Group: () => Group,
	Image: () => Image,
	Path: () => Path,
	PathPoint: () => PathPoint,
	Rectangle: () => Rectangle,
	Svg: () => Svg,
	// Nodes
	AgentNode: () => AgentNode,
	HubNode: () => HubNode,
	ImageGenNode: () => ImageGenNode,
	SvgToDiagramNode: () => SvgToDiagramNode,
	LLMNode: () => LLMNode,
	TextAreaNode: () => TextAreaNode,
	VectorStoreNode: () => VectorStoreNode,
	WebSearchNode: () => WebSearchNode,
};
