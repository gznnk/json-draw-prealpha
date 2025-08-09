// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import constants.
import { MAX_HISTORY_SIZE } from "../../SvgCanvasConstants";

// Import utils.
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";
import { canvasStateToHistory } from "../../utils/canvasStateToHistory";

/**
 * Custom hook to add history entries to the canvas.
 * @param props - The sub hooks properties containing the onDataChange callback.
 * @returns A callback function to add history entries.
 */
export const useAddHistory = (props: SvgCanvasSubHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		onDataChange: props.onDataChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((eventId: string, canvasState: SvgCanvasState) => {
		// When the last history event ID is the same as the new state, overwrite the history.
		if (canvasState.lastHistoryEventId === eventId) {
			// Overwrite the last history with the new state.
			const newHistory = canvasState.history.slice(0, canvasState.historyIndex);
			newHistory.push(canvasStateToHistory(canvasState));
			canvasState.history = newHistory;
		} else {
			// Add a new history entry.
			let newHistory = canvasState.history.slice(
				0,
				canvasState.historyIndex + 1,
			);
			newHistory.push(canvasStateToHistory(canvasState));

			// Remove the oldest history if the size exceeds the maximum limit.
			if (MAX_HISTORY_SIZE < newHistory.length) {
				newHistory = newHistory.slice(1);
			}

			canvasState.history = newHistory;
		}
		canvasState.lastHistoryEventId = eventId;
		canvasState.historyIndex = canvasState.history.length - 1;

		refBus.current.onDataChange?.(svgCanvasStateToData(canvasState));
	}, []);
};
