import type { DiagramType } from "../types/base/DiagramType";
import type { ConnectPointMoveData } from "../types/events/ConnectPointMoveData";
import type { Diagram } from "../types/data/catalog/Diagram";

/**
 * Definition of a diagram that includes all necessary functions and components.
 * This interface unifies component, calculator, creator, and exporter definitions.
 */
export type DiagramDefinition = {
	/** The diagram type identifier */
	type: DiagramType;

	/** React component factory for rendering the diagram */
	// biome-ignore lint/suspicious/noExplicitAny: Different shapes have different prop types
	component: () => React.FC<any>;

	/** Function to calculate connect point positions for the diagram */
	connectPointCalculator: (diagram: Diagram) => ConnectPointMoveData[];
	/** Function to create a new instance of the diagram */
	createFunction: (props: { x: number; y: number }) => Diagram | undefined;
	/** Function to export the diagram to external format */
	exportFunction: ((diagram: Diagram) => Blob | undefined) | undefined;
};
