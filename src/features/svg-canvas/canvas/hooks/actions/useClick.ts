// Import React.
import { useCallback } from "react";

// Import types.
import type { DiagramClickEvent } from "../../../types/events/DiagramClickEvent";
import type { SvgCanvasSubHooksProps } from "../../SvgCanvasTypes";

// Import hooks.
import { useSelect } from "../selection/useSelect";

/**
 * Custom hook to handle click events on the canvas.
 */
export const useClick = (props: SvgCanvasSubHooksProps, isCtrlPressed?: boolean) => {
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
