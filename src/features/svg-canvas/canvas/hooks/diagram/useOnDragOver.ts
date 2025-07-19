// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { DiagramDragDropEvent } from "../../../types/events/DiagramDragDropEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import utilities.
import { isConnectableData } from "../../../utils/validation/isConnectableData";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";

/**
 * Custom hook to handle drag over events on the canvas.
 * This hook provides a centralized way to handle drag over state
 * for diagram elements, enabling visual feedback during drag operations.
 */
export const useOnDragOver = (props: SvgCanvasSubHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramDragDropEvent) => {
		// Only show connect points if dragging a ConnectPoint
		if (e.dropItem.type === "ConnectPoint") {
			// Bypass references to avoid function creation in every render.
			const { setCanvasState } = refBus.current.props;

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
	}, []);
};
