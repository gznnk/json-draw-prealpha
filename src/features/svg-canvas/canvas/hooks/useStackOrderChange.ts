// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../catalog/DiagramTypes";
import type { StackOrderChangeEvent } from "../../types/events/StackOrderChangeEvent";
import type { CanvasHooksProps, SvgCanvasState } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { isItemableData } from "../../utils/validation/isItemableData";
import { newEventId } from "../../utils/common/newEventId";
import { addHistory } from "../SvgCanvasFunctions";

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

			// 再帰的に探し、idが一致する図形の属する親のitems配列を対象に並び替える
			const updateOrderRecursive = (items: Diagram[]): Diagram[] => {
				return items.map((item) => {
					if (isItemableData(item)) {
						// グループ内を再帰的に調査
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

			// top-level にある場合の対応
			let items = prevState.items;
			if (items.some((item) => item.id === e.id)) {
				items = moveInList(items);
			} else {
				items = updateOrderRecursive(items);
			}

			// 履歴に追加
			let newState: SvgCanvasState = {
				...prevState,
				items,
			};

			// Add a new history entry.
			newState.lastHistoryEventId = newEventId(); // TODO: Trigger側で設定するようにする
			newState = addHistory(prevState, newState);

			return newState;
		});
	}, []);
};
