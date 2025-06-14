// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { SvgCanvasScrollEvent } from "../../../types/events/SvgCanvasScrollEvent";

/**
 * Custom hook to handle navigation events using scroll functionality.
 * This provides a way to programmatically navigate to specific coordinates on the canvas.
 */
export const useNavigate = (onScroll: (e: SvgCanvasScrollEvent) => void) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		onScroll,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((minX: number, minY: number) => {
		// Bypass references to avoid function creation in every render.
		const { onScroll } = refBus.current;

		// Use scroll handler with the specified coordinates
		onScroll({ minX, minY, clientX: 0, clientY: 0 });
	}, []);
};
