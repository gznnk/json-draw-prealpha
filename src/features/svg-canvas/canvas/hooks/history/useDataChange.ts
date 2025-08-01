// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import utils.
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";

/**
 * Custom hook to handle data changes in the canvas.
 * @param onDataChange - The callback function to handle data changes.
 * @returns A callback function to handle data changes.
 */
export const useDataChange = (props: SvgCanvasSubHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		onDataChange: props.onDataChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((canvasState: SvgCanvasState) => {
		refBus.current.onDataChange?.(svgCanvasStateToData(canvasState));
	}, []);
};
