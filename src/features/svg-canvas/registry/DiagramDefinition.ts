// Import types.
import type { DiagramType } from "../types/core/DiagramType";
import type { Diagram } from "../types/state/catalog/Diagram";
import type { DiagramData } from "../types/data/catalog/DiagramData";
import type { ConnectPointState } from "../types/state/shapes/ConnectPointState";

/**
 * Type for state to data mapper function.
 * Used to convert specific diagram states to their corresponding data format.
 */
export type StateToDataMapper = (state: Diagram) => DiagramData;

/**
 * Definition of a diagram that includes all necessary functions and components.
 * This interface unifies component, calculator, creator, and exporter definitions.
 */
export type DiagramDefinition = {
	/** The diagram type identifier */
	type: DiagramType;

	/** React component factory for rendering the diagram */
	// biome-ignore lint/suspicious/noExplicitAny: Different shapes have different prop types
	component: React.FC<any>;

	/** Lightweight react component for MiniMap rendering without outlines, controls, and labels */
	// biome-ignore lint/suspicious/noExplicitAny: Different shapes have different prop types
	minimapComponent: React.FC<any>;

	/** Function to calculate connect point positions for the diagram */
	connectPointCalculator: (diagram: Diagram) => ConnectPointState[];

	/** Function to create a new instance of the diagram */
	createFunction: (props: { x: number; y: number }) => Diagram | undefined;

	/** Function to export the diagram to external format */
	exportFunction: ((diagram: Diagram) => Blob | undefined) | undefined;

	/** Function to map state to data format for serialization */
	stateToDataMapper: StateToDataMapper;
};
