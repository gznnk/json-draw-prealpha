// Import React.
import { useCallback } from "react";

// Import types.
import type { DiagramClickEvent } from "../../../types/events/DiagramClickEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import hooks.
import { useOnSelect } from "../selection/useOnSelect";

/**
 * Custom hook to handle click events on the canvas.
 */
export const useOnClick = (
	props: SvgCanvasSubHooksProps,
	isCtrlPressed?: boolean,
) => {
	const onSelect = useOnSelect(props, isCtrlPressed);

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
