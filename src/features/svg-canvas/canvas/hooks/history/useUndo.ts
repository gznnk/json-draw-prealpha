// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import utils.
import { useDataChange } from "./useDataChange";
import { clearSelectionRecursively } from "../../utils/clearSelectionRecursively";

/**
 * Custom hook to handle undo events on the canvas.
 */
export const useUndo = (props: SvgCanvasSubHooksProps) => {
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

			// Clear the selected items.
			ret.items = clearSelectionRecursively(ret.items);

			// Notify the data change.
			onDataChange(ret);

			return ret;
		});
	}, []);
};
