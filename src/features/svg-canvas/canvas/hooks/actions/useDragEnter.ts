// Import React.
import { useCallback } from "react";

// Import types.
import type { DiagramDragDropEvent } from "../../../types/events/DiagramDragDropEvent";
import type { CanvasHooksProps } from "../../SvgCanvasTypes";

/**
 * Custom hook to handle drag enter events on the canvas.
 * This hook provides a centralized way to handle drag enter state
 * for diagram elements, enabling visual feedback during drag operations.
 */
export const useDragEnter = (_props: CanvasHooksProps) => {
	return useCallback((e: DiagramDragDropEvent) => {
		// TODO: Implement drag enter logic here
		// For now, just log the event for debugging purposes
		console.log("Drag enter event:", e);
	}, []);
};
