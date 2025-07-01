// Import React.
import { useCallback } from "react";

// Import types related to SvgCanvas.
import type { CanvasHooksProps } from "../../SvgCanvasTypes";
import type { DiagramClickEvent } from "../../../types/events/DiagramClickEvent";
import { useSelect } from "../selection/useSelect";

/**
 * Custom hook to handle click events on the canvas.
 */
export const useClick = (props: CanvasHooksProps, isCtrlPressed?: boolean) => {
	const onSelect = useSelect(props, isCtrlPressed);

	return useCallback(
		(e: DiagramClickEvent) => {
			onSelect({
				eventId: e.eventId,
				id: e.id,
				isTriggeredByClick: true,
				isSelectedOnPointerDown: e.isSelectedOnPointerDown,
				isAncestorSelectedOnPointerDown: e.isAncestorSelectedOnPointerDown,
			});
		},
		[onSelect],
	);
};
