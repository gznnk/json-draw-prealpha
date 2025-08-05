// Import types.
import type { SvgCanvasHistory } from "../types/SvgCanvasHistory";
import type { SvgCanvasState } from "../types/SvgCanvasState";

// Import utils.
import { deepCopy } from "../../utils/core/deepCopy";
import { svgCanvasStateToData } from "./svgCanvasStateToData";

/**
 * Convert the canvas state to history format.
 *
 * @param canvasState - The state of the canvas.
 * @returns {SvgCanvasHistory} - The history format of the canvas state.
 */
export const canvasStateToHistory = (
	canvasState: SvgCanvasState,
): SvgCanvasHistory => {
	// Convert the canvas state to data format with proper item types
	const canvasData = svgCanvasStateToData(canvasState);

	// Deep copy the canvas data to avoid mutating the original state
	return deepCopy(canvasData);
};
