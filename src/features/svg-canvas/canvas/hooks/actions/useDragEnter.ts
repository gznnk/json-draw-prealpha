// Import React.
import { useCallback } from "react";

// Import types.
import type { DiagramDragDropEvent } from "../../../types/events/DiagramDragDropEvent";
import type { SvgCanvasSubHooksProps } from "../../SvgCanvasTypes";
import type { Diagram } from "../../../types/data/catalog/Diagram";

// Import utilities.
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { isConnectableData } from "../../../utils/validation/isConnectableData";

/**
 * Custom hook to handle drag enter events on the canvas.
 * This hook provides a centralized way to handle drag enter state
 * for diagram elements, enabling visual feedback during drag operations.
 */
export const useDragEnter = (props: SvgCanvasSubHooksProps) => {
	return useCallback(
		(e: DiagramDragDropEvent) => {
			const { setCanvasState } = props;

			// Only show connect points if dragging a ConnectPoint
			if (e.dropItem.type === "ConnectPoint") {
				setCanvasState((prevState) => {
					// Update items to show connect points for connectable elements
					const items = applyFunctionRecursively(
						prevState.items,
						(item: Diagram) => {
							// Check if this item can have connect points
							if (item.id === e.dropTargetItem.id && isConnectableData(item)) {
								// Show connect points when ConnectPoint is being dragged over
								return {
									...item,
									showConnectPoints: true,
								};
							}
							return item;
						},
					);

					return {
						...prevState,
						items,
					};
				});
			}
		},
		[props],
	);
};
