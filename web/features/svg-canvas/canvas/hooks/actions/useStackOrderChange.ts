import { useCallback, useRef } from "react";

import type { StackOrderChangeEvent } from "../../../types/events/StackOrderChangeEvent";
import type { Diagram } from "../../../types/state/core/Diagram";
import { isItemableState } from "../../../utils/validation/isItemableState";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle stack order change events on the canvas.
 */
export const useStackOrderChange = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const addHistory = useAddHistory(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		addHistory,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: StackOrderChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState },
			addHistory,
		} = refBus.current;

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
					if (isItemableState(item)) {
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
			let newState: SvgCanvasState = {
				...prevState,
				items,
			};

			// Add history
			newState = addHistory(e.eventId, newState);

			return newState;
		});
	}, []);
};
