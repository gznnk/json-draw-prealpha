// Import React.
import { useCallback } from "react";

// Import types.
import type { DiagramHoverChangeEvent } from "../../../types/events/DiagramHoverChangeEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import type { Diagram } from "../../../types/data/catalog/Diagram";

// Import utilities.
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { isConnectableData } from "../../../utils/validation/isConnectableData";

/**
 * Custom hook to handle hover change events on the canvas.
 * This hook provides a centralized way to handle hover state changes
 * for diagram elements, enabling visual feedback and interactions.
 */
export const useHoverChange = (props: SvgCanvasSubHooksProps) => {
	return useCallback(
		(e: DiagramHoverChangeEvent) => {
			const { setCanvasState } = props;

			setCanvasState((prevState) => {
				// Update items to toggle showConnectPoints based on hover state
				const items = applyFunctionRecursively(
					prevState.items,
					(item: Diagram) => {
						// Check if this item's ID matches the hovered element
						if (item.id === e.id && isConnectableData(item)) {
							// Update showConnectPoints based on hover state
							return {
								...item,
								showConnectPoints: e.isHovered,
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
		},
		[props],
	);
};
