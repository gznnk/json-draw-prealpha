import type { SvgCanvasData } from "../../../features/svg-canvas/canvas/types/SvgCanvasData";

/**
 * Property definitions for the CanvasView component.
 * Receives canvas data from the parent component.
 */
export type CanvasViewProps = {
	/** Data used to render the canvas */
	content: SvgCanvasData;
	/** Optional unique identifier for the component */
	id?: string;

	onDataChange?: (data: SvgCanvasData) => void;
};
