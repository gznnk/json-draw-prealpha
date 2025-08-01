// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { StackOrderChangeEvent } from "../../../types/events/StackOrderChangeEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import type { SvgCanvasState } from "../../types/SvgCanvasState";

// Import functions related to SvgCanvas.
import { isItemableData } from "../../../utils/validation/isItemableData";


// Import hooks.
import { useDataChange } from "../history/useDataChange";

/**
 * Custom hook to handle stack order change events on the canvas.
 */
export const useStackOrderChange = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const onDataChange = useDataChange(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		onDataChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: StackOrderChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;
		const { onDataChange } = refBus.current;

		setCanvasState((prevState) => {
			const moveInList = (items: Diagram[]): Diagram[] => {
				const index = items.findIndex((item) => item.id === e.id);
				if (index === -1) return items;

				const newItems = [...items];
				const [target] = newItems.splice(index, 1); // remove

				switch (e.changeType) {
					case "bringToFront":
						newItems.push(target);
						break;
					case "sendToBack":
						newItems.unshift(target);
						break;
					case "bringForward":
						if (index < newItems.length - 1) {
							newItems.splice(index + 1, 0, target);
						} else {
							newItems.push(target);
						}
						break;
					case "sendBackward":
						if (index > 0) {
							newItems.splice(index - 1, 0, target);
						} else {
							newItems.unshift(target);
						}
						break;
				}
				return newItems;
			};

			// Recursively search for the item with matching id and reorder the parent's items array
			const updateOrderRecursive = (items: Diagram[]): Diagram[] => {
				return items.map((item) => {
					if (isItemableData(item)) {
						// Check if this group contains the target item
						if (item.items?.some((child) => child.id === e.id)) {
							return {
								...item,
								items: moveInList(item.items),
							};
						}
						return {
							...item,
							items: updateOrderRecursive(item.items ?? []),
						};
					}
					return item;
				});
			};

			// Handle items at the top level
			let items = prevState.items;
			if (items.some((item) => item.id === e.id)) {
				items = moveInList(items);
			} else {
				items = updateOrderRecursive(items);
			}

			// Create new state
			const newState: SvgCanvasState = {
				...prevState,
				items,
			};

			// Notify the data change.
			onDataChange(e.eventId, newState);

			return newState;
		});
	}, []);
};
