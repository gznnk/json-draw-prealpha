// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../catalog/DiagramTypes";
import type { StackOrderChangeEvent } from "../../types/events/StackOrderChangeEvent";
import type { CanvasHooksProps, SvgCanvasState } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { isItemableData } from "../../utils/validation/isItemableData";
import { newEventId } from "../../utils/common/newEventId";
import { addHistory } from "../utils/addHistory";

/**
 * Custom hook to handle stack order change events on the canvas.
 */
export const useStackOrderChange = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: StackOrderChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

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

			// 蜀榊ｸｰ逧・↓謗｢縺励（d縺御ｸ閾ｴ縺吶ｋ蝗ｳ蠖｢縺ｮ螻槭☆繧玖ｦｪ縺ｮitems驟榊・繧貞ｯｾ雎｡縺ｫ荳ｦ縺ｳ譖ｿ縺医ｋ
			const updateOrderRecursive = (items: Diagram[]): Diagram[] => {
				return items.map((item) => {
					if (isItemableData(item)) {
						// 繧ｰ繝ｫ繝ｼ繝怜・繧貞・蟶ｰ逧・↓隱ｿ譟ｻ
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

			// top-level 縺ｫ縺ゅｋ蝣ｴ蜷医・蟇ｾ蠢・
			let items = prevState.items;
			if (items.some((item) => item.id === e.id)) {
				items = moveInList(items);
			} else {
				items = updateOrderRecursive(items);
			}

			// 螻･豁ｴ縺ｫ霑ｽ蜉
			let newState: SvgCanvasState = {
				...prevState,
				items,
			};

			// Add a new history entry.
			newState.lastHistoryEventId = newEventId(); // TODO: Trigger蛛ｴ縺ｧ險ｭ螳壹☆繧九ｈ縺・↓縺吶ｋ
			newState = addHistory(prevState, newState);

			return newState;
		});
	}, []);
};
