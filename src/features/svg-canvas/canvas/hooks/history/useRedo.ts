// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import functions related to SvgCanvas.
import { useDataChange } from "./useDataChange";
import { clearSelectionRecursively } from "../../utils/clearSelectionRecursively";

/**
 * Custom hook to handle redo events on the canvas.
 */
export const useRedo = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const onDataChange = useDataChange(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		onDataChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;
		const { onDataChange } = refBus.current;

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
			ret.items = clearSelectionRecursively(ret.items);

			// Notify the data change.
			onDataChange(ret);

			return ret;
		});
	}, []);
};
