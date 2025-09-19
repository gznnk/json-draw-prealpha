import { useCallback, useRef } from "react";

import type { PreviewConnectLineEvent } from "../../../types/events/PreviewConnectLineEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { clearSelectionRecursively } from "../../utils/clearSelectionRecursively";

/**
 * Custom hook to handle preview connect line events on the canvas.
 * Updates the canvas state to show or hide the preview connection line.
 */
export const usePreviewConnectLine = (props: SvgCanvasSubHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: PreviewConnectLineEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => {
			const newState = {
				...prevState,
				previewConnectLineState: e.pathData,
			};

			// Clear all selections when connection preview starts
			if (e.eventPhase === "Started") {
				newState.items = clearSelectionRecursively(prevState.items);
				newState.multiSelectGroup = undefined;
			}

			return newState;
		});
	}, []);
};
