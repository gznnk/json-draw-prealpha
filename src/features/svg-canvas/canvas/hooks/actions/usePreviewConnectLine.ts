// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { PreviewConnectLineEvent } from "../../../types/events/PreviewConnectLineEvent";
import type { SvgCanvasSubHooksProps } from "../../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { clearSelectedRecursive } from "../../utils/clearSelectedRecursive";

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
			if (e.eventType === "Start") {
				newState.items = clearSelectedRecursive(prevState.items);
				newState.multiSelectGroup = undefined;
			}

			return newState;
		});
	}, []);
};
