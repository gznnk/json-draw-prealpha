// Import React.
import { useCallback } from "react";

// Import types.
import type { DiagramHoverChangeEvent } from "../../../types/events/DiagramHoverChangeEvent";
import type { CanvasHooksProps } from "../../SvgCanvasTypes";

/**
 * Custom hook to handle hover change events on the canvas.
 * This hook provides a centralized way to handle hover state changes
 * for diagram elements, enabling visual feedback and interactions.
 */
export const useHoverChange = (_props: CanvasHooksProps) => {
	return useCallback((e: DiagramHoverChangeEvent) => {
		// TODO: Implement hover change logic here
		// For now, just log the event for debugging purposes
		console.log("Hover change event:", e);
	}, []);
};
