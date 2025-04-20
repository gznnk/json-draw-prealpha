// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { SvgCanvasResizeEvent } from "../../types/EventTypes";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

/**
 * Custom hook to handle canvas resize events on the canvas.
 */
export const useCanvasResize = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: SvgCanvasResizeEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => ({
			...prevState,
			...e, // Apply new minX, minY, width and height.
		}));
	}, []);
};
