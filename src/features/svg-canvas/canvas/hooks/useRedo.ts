// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { saveCanvasDataToLocalStorage } from "../SvgCanvasFunctions";

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
			// 次の状態を取得
			const nextIndex = prevState.historyIndex + 1;
			if (nextIndex >= prevState.history.length) {
				// 履歴がない場合は何もしない
				return prevState;
			}
			const nextHistory = prevState.history[nextIndex];

			const ret = {
				...prevState,
				...nextHistory, // Overwrite the current state with the next history.
				historyIndex: nextIndex,
			};

			saveCanvasDataToLocalStorage(ret); // Save the canvas data to local storage.

			return ret;
		});
	}, []);
};
