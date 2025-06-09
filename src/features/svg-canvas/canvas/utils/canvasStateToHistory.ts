import { deepCopy } from "../../utils/common/deepCopy";
import type { SvgCanvasHistory, SvgCanvasState } from "../SvgCanvasTypes";

/**
 * Convert the canvas state to history format.
 *
 * @param canvasState - The state of the canvas.
 * @returns {SvgCanvasHistory} - The history format of the canvas state.
 */
export const canvasStateToHistory = (
	canvasState: SvgCanvasState,
): SvgCanvasHistory => {
	// Deep copy the canvas state to avoid mutating the original state
	const copiedState = deepCopy(canvasState);

	// Convert the canvas state to history format
	return {
		id: copiedState.id,
		minX: copiedState.minX,
		minY: copiedState.minY,
		items: copiedState.items,
	} as const satisfies SvgCanvasHistory;
};
