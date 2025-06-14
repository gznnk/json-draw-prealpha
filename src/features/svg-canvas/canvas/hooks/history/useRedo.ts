// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { CanvasHooksProps } from "../../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { clearSelectedRecursive } from "../../utils/clearSelectedRecursive";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";

/**
 * Custom hook to handle redo events on the canvas.
 */
export const useRedo = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;
	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState, onDataChange } = refBus.current.props;

		setCanvasState((prevState) => {
			// Get the next state in the history.
			const nextIndex = prevState.historyIndex + 1;
			if (nextIndex >= prevState.history.length) {
				// If there is no next history, do nothing.
				return prevState;
			}
			const nextHistory = prevState.history[nextIndex];

			const ret = {
				...prevState,
				...nextHistory, // Overwrite the current state with the next history.
				historyIndex: nextIndex,
			};

			// Clear the selected items.
			ret.items = clearSelectedRecursive(ret.items);

			// Notify the data change.
			onDataChange?.(svgCanvasStateToData(ret));

			return ret;
		});
	}, []);
};
