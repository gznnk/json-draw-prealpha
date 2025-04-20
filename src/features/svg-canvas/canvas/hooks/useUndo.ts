// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { saveCanvasDataToLocalStorage } from "../SvgCanvasFunctions";

/**
 * Custom hook to handle undo events on the canvas.
 */
export const useUndo = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => {
			// Get the previous state.
			const prevIndex = prevState.historyIndex - 1;
			if (prevIndex < 0) {
				// If there is no history, do nothing.
				return prevState;
			}
			const prevHistory = prevState.history[prevIndex];

			const ret = {
				...prevState,
				...prevHistory, // Overwrite the current state with the previous history.
				historyIndex: prevIndex,
			};

			// Save the canvas data to local storage.
			saveCanvasDataToLocalStorage(ret);

			return ret;
		});
	}, []);
};
