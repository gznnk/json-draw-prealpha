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
 * Custom hook to handle drag leave events on the canvas.
 * This hook provides a centralized way to handle drag leave state
 * for diagram elements, enabling visual feedback during drag operations.
 */
export const useDragLeave = (props: SvgCanvasSubHooksProps) => {
	return useCallback(
		(e: DiagramDragDropEvent) => {
			const { setCanvasState } = props;

			// Hide connect points when ConnectPoint drag leaves
			if (e.dropItem.type === "ConnectPoint") {
				setCanvasState((prevState) => {
					// Update items to hide connect points for connectable elements
					const items = applyFunctionRecursively(
						prevState.items,
						(item: Diagram) => {
							// Check if this item can have connect points
							if (item.id === e.dropTargetItem.id && isConnectableData(item)) {
								// Hide connect points when ConnectPoint drag leaves
								return {
									...item,
									showConnectPoints: false,
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
