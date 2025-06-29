// Import React.
import { useCallback } from "react";

// Import types related to SvgCanvas.
import type { CanvasHooksProps } from "../../SvgCanvasTypes";
import type { DiagramClickEvent } from "../../../types/events/DiagramClickEvent";
import { useSelect } from "../selection/useSelect";

/**
 * Custom hook to handle click events on the canvas.
 */
export const useClick = (props: CanvasHooksProps) => {
	const onSelect = useSelect(props);

	return useCallback(
		(e: DiagramClickEvent) => {
			if (e.isAncestorSelected) {
				onSelect({
					eventId: e.eventId,
					id: e.id,
					allowDescendantSelection: true,
				});
			}
		},
		[onSelect],
	);
};
