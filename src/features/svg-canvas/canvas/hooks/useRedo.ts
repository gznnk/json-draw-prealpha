// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { clearSelectedRecursive } from "../utils/clearSelectedRecursive";
import { saveCanvasDataToLocalStorage } from "../utils/saveCanvasDataToLocalStorage";

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
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => {
			// 谺｡縺ｮ迥ｶ諷九ｒ蜿門ｾ・
			const nextIndex = prevState.historyIndex + 1;
			if (nextIndex >= prevState.history.length) {
				// 螻･豁ｴ縺後↑縺・ｴ蜷医・菴輔ｂ縺励↑縺・
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

			saveCanvasDataToLocalStorage(ret); // Save the canvas data to local storage.

			return ret;
		});
	}, []);
};
