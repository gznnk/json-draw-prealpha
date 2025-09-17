/**
 * Common type definitions for Diagram Atlas system
 * Structured type system used by each diagram's Atlas files
 */
import type { DiagramFeatures } from "../types/core/DiagramFeatures";
import type { DiagramType } from "../types/core/DiagramType";
import type { Frame } from "../types/core/Frame";
import type { DiagramData } from "../types/data/core/DiagramData";
import type { Diagram } from "../types/state/core/Diagram";
import type { ConnectPointState } from "../types/state/shapes/ConnectPointState";
export type {
	DataToStateMapper,
	StateToDataMapper,
} from "../registry/DiagramDefinition";

/**
 * Base structure type for Diagram Atlas
 *
 * @template TData - Data type
 * @template TState - State type
 * @template TProps - Props type
 */
export type DiagramAtlas<
	TData extends DiagramData,
	TState extends Diagram,
	// biome-ignore lint/suspicious/noExplicitAny: Generic type parameter requires flexibility
	TProps = any,
> = {
	// ============================================================================
	// Types
	// ============================================================================

	/** Type identifier */
	type: DiagramType;

	/** Data Types (Serialization) */
	features: DiagramFeatures;

	// ============================================================================
	// Defaults
	// ============================================================================

	/** Default Data */
	defaultData: TData;

	/** Default State */
	defaultState: TState;

	// ============================================================================
	// Components
	// ============================================================================

	/** Component */
	component: React.FC<TProps>;

	/** Minimap Component */
	minimapComponent: React.FC<TProps>;

	// ============================================================================
	// Utility Functions
	// ============================================================================

	/** Create Functions */
	createState: (props: { x: number; y: number }) => Diagram;

	/** Export Function */
	export: ((state: Diagram) => Blob | undefined) | undefined;

	/** Calculator Functions */
	calcConnectPointPosition: (state: Diagram) => ConnectPointState[];

	/** Transform Functions */
	transformItems:
		| ((ownerFrame: Frame, items: Diagram[]) => Diagram[])
		| undefined;

	/** Mapper Functions */
	dataToState: (data: DiagramData) => Diagram;
	stateToData: (state: Diagram) => DiagramData;
};

/**
 * Dummy implementation for unsupported functions
 */
export const dummyImplementation = () => {
	throw new Error("Not supported");
};

/**
 * Dummy implementation for unsupported components
 */
export const DummyComponent = () => {
	throw new Error("Not supported");
};
