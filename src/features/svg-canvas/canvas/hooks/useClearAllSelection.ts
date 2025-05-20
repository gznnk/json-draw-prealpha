// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { clearSelectedRecursive } from "../utils/clearSelectedRecursive";

/**
 * Custom hook to handle clear all selection events on the canvas.
 */
export const useClearAllSelection = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => ({
			...prevState,
			items: clearSelectedRecursive(prevState.items),
			multiSelectGroup: undefined,
			selectedItemId: undefined,
		}));
	}, []);
};
