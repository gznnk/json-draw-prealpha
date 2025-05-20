import { MAX_HISTORY_SIZE } from "../SvgCanvasConstants";
import type { SvgCanvasState } from "../SvgCanvasTypes";
import { canvasStateToHistory } from "./canvasStateToHistory";
import { saveCanvasDataToLocalStorage } from "./saveCanvasDataToLocalStorage";

/**
 * Add a new state to the history stack.
 *
 * @param prevState - The previous state of the SvgCanvas.
 * @param newState - The new state to be added to the history.
 * @returns {SvgCanvasState} - The updated state of the SvgCanvas with the new history.
 */
export const addHistory = (
	prevState: SvgCanvasState,
	newState: SvgCanvasState,
): SvgCanvasState => {
	// When the last history event ID is the same as the new state, overwrite the history.
	if (prevState.lastHistoryEventId === newState.lastHistoryEventId) {
		// Overwrite the last history with the new state.
		const newHistory = prevState.history.slice(0, prevState.historyIndex);
		newHistory.push(canvasStateToHistory(newState));
		const ret = {
			...newState,
			history: newHistory,
			historyIndex: newHistory.length - 1,
			lastHistoryEventId: prevState.lastHistoryEventId,
		};

		// console.log("overwrite history", ret);

		return ret;
	}

	// Add a new history entry.
	let newHistory = prevState.history.slice(0, prevState.historyIndex + 1);
	newHistory.push(canvasStateToHistory(newState));

	// Remove the oldest history if the size exceeds the maximum limit.
	if (MAX_HISTORY_SIZE < newHistory.length) {
		newHistory = newHistory.slice(1);
	}

	const ret = {
		...newState,
		history: newHistory,
		historyIndex: newHistory.length - 1,
	};

	// console.log("history", JSON.stringify(ret, null, 2));
	// console.log("history", ret);

	saveCanvasDataToLocalStorage(ret); // Save the canvas data to local storage.

	return ret;
};
