// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { DiagramHoverChangeEvent } from "../../../types/events/DiagramHoverChangeEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import utilities.
import { isConnectableData } from "../../../utils/validation/isConnectableData";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";

/**
 * Custom hook to handle hover change events on the canvas.
 * This hook provides a centralized way to handle hover state changes
 * for diagram elements, enabling visual feedback and interactions.
 */
export const useOnHoverChange = (props: SvgCanvasSubHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramHoverChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

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
	}, []);
};
