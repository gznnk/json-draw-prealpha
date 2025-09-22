import { canvasStateToData } from "./canvasStateToData";
import { deepCopy } from "../../utils/core/deepCopy";
import type { SvgCanvasHistory } from "../types/SvgCanvasHistory";
import type { SvgCanvasState } from "../types/SvgCanvasState";

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
	const canvasData = canvasStateToData(canvasState);

	// Deep copy the canvas data to avoid mutating the original state
	return deepCopy(canvasData);
};
