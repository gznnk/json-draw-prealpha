// Import types related to SvgCanvas.
import {
	DiagramConnectPointCalculators,
	type Diagram,
} from "../types/DiagramCatalog";
import type { ConnectPointMoveData, EventType } from "../types/EventTypes";

// Import components related to SvgCanvas.
import { notifyConnectPointsMove } from "../components/shapes/ConnectLine";
import type { ConnectPointData } from "../components/shapes/ConnectPoint";
import { calcBoundsOfGroup } from "../components/shapes/Group";

// Import functions related to SvgCanvas.
import {
	isConnectableData,
	isItemableData,
	isSelectableData,
} from "../utils/Diagram";
import { deepCopy, newEventId } from "../utils/Util";

// Imports related to this component.
import type { ConnectableData } from "../types/DiagramTypes";
import { MAX_HISTORY_SIZE } from "./SvgCanvasConstants";
import type { SvgCanvasHistory, SvgCanvasState } from "./SvgCanvasTypes";

/**
 * Get the diagram by ID from the list of diagrams.
 *
 * @param {Diagram[]} diagrams - The list of diagrams to search.
 * @param {string} id - The ID of the diagram to find.
 * @returns {Diagram | undefined} - The diagram with the specified ID, or undefined if not found.
 */
export const getDiagramById = (
	diagrams: Diagram[],
	id: string,
): Diagram | undefined => {
	for (const diagram of diagrams) {
		if (diagram.id === id) {
			return diagram;
		}
		// Recursively search if the diagram has items.
		if (isItemableData(diagram)) {
			const ret = getDiagramById(diagram.items || [], id);
			if (ret) {
				return ret;
			}
		}
	}
};

/**
 * Apply a function recursively to a list of items.
 *
 * @param items - The list of items to apply the function to.
 * @param updateFunction - The function to apply to each item.
 * @returns {Diagram[]} - The updated list of items.
 */
export const applyRecursive = (
	items: Diagram[],
	updateFunction: (item: Diagram) => Diagram,
) => {
	let isItemChanged = false;
	const newItems: Diagram[] = [];
	for (const item of items) {
		const newItem = updateFunction(item);
		newItems.push(newItem);

		// Determine if the reference of the item has changed
		if (item !== newItem) {
			// If the item reference has changed, mark it as changed.
			isItemChanged = true;
		}
		if (isItemableData(item) && isItemableData(newItem)) {
			const newGroupItems = applyRecursive(item.items ?? [], updateFunction);
			// If the reference of the array has changed, mark it as modified.
			if (newGroupItems !== item.items) {
				newItem.items = newGroupItems;
				isItemChanged = true;
			}
		}
	}

	// If there are no changes, return the original array reference so React detects no modifications.
	return isItemChanged ? newItems : items;
};

/**
 * Get the selected items from a list of items.
 *
 * @param items - The list of items to search.
 * @param selectedItems - The list populated with found selected items.
 * @returns {Diagram[]} - The list of selected items.
 */
export const getSelectedItems = (
	items: Diagram[],
	selectedItems: Diagram[] = [],
) => {
	for (const item of items) {
		if (isSelectableData(item)) {
			if (item.isSelected) {
				selectedItems.push(item);
			} else if (isItemableData(item)) {
				getSelectedItems(item.items, selectedItems);
			}
		}
	}
	return selectedItems;
};

/**
 * Recursively apply the `isMultiSelectSource` property to the selected items.
 *
 * This function sets the `isMultiSelectSource` property to `true` for all selected items and their descendants.
 * If a group is selected, it applies the property to all items within that group.
 * Any item for which this function sets `isMultiSelectSource = true` will be hidden in the UI.
 *
 * @param items - The list of items to process.
 * @param isGroupMultiSelected - Indicates if the item is a group that is multi-selected.
 * @returns {Diagram[]} - The updated list of items with the `isMultiSelectSource` property applied.
 */
export const applyMultiSelectSourceRecursive = (
	items: Diagram[],
	isGroupMultiSelected = false,
): Diagram[] => {
	return items.map((item) => {
		const newItem = { ...item };
		if (!isSelectableData(newItem)) {
			return item;
		}
		newItem.isMultiSelectSource = isGroupMultiSelected || newItem.isSelected;
		if (isItemableData(newItem)) {
			newItem.items = applyMultiSelectSourceRecursive(
				newItem.items ?? [],
				newItem.isMultiSelectSource,
			);
		}
		return newItem;
	});
};

/**
 * Recursively clear the selection state of all items.
 *
 * @param items - The list of items to process.
 * @returns {Diagram[]} - The updated list of items with the selection state cleared.
 */
export const clearSelectedRecursive = (items: Diagram[]) => {
	return applyRecursive(items, (item) =>
		isSelectableData(item)
			? { ...item, isSelected: false, isMultiSelectSource: false } // 全ての図形の選択状態を解除し、かつ表示状態を元に戻す
			: item,
	);
};

/**
 * 複数選択時に、選択元として設定された図形の非表示を解除する
 *
 * @param items 図形配列
 * @returns 更新後の図形配列
 */
export const clearMultiSelectSourceRecursive = (
	items: Diagram[],
): Diagram[] => {
	return items.map((item) => {
		const newItem = { ...item };
		if (!isSelectableData(newItem)) {
			return item;
		}
		newItem.isMultiSelectSource = false;
		if (isItemableData(newItem)) {
			newItem.items = clearMultiSelectSourceRecursive(newItem.items ?? []);
		}
		return newItem;
	});
};

/**
 * グループ化された図形を図形配列から削除する
 *
 * @param items 図形配列
 * @returns 更新後の図形配列
 */
export const removeGroupedRecursive = (items: Diagram[]) => {
	return items.filter((item) => {
		if (isSelectableData(item) && item.isSelected) {
			return false;
		}
		if (isItemableData(item)) {
			item.items = removeGroupedRecursive(item.items ?? []);
			if (item.type === "Group" && item.items.length === 0) {
				return false;
			}
		}
		return true;
	});
};

/**
 * Ungroup selected groups.
 *
 * @param items - List of diagrams.
 * @returns Updated list of diagrams.
 */
export const ungroupSelectedGroupsRecursive = (items: Diagram[]) => {
	// Extract the diagrams from the selected groups.
	let extractedItems: Diagram[] = [];
	for (const item of [...items]) {
		if (
			item.type === "Group" &&
			isItemableData(item) &&
			item.items !== undefined
		) {
			if (item.isSelected) {
				for (const groupItem of item.items) {
					extractedItems.push(groupItem);
				}
			} else {
				item.items = ungroupSelectedGroupsRecursive(item.items);
				extractedItems.push(item);
			}
		} else {
			extractedItems.push(item);
		}
	}

	// Remove empty groups.
	extractedItems = extractedItems.filter((item) => {
		if (isItemableData(item) && item.type === "Group") {
			if (item.items?.length === 0) {
				return false;
			}
		}
		return true;
	});

	return extractedItems;
};

/**
 * Add a new state to the history stack.
 *
 * @param prevState - The previous state of the SvgCanvas.
 * @param newState - The new state to be added to the history.
 * @returns {SvgCanvasState} - The updated state of the SvgCanvas with the new history.
 */
export const addHistory = (
	prevState: SvgCanvasState,
	newState: SvgCanvasState,
): SvgCanvasState => {
	// When the last history event ID is the same as the new state, overwrite the history.
	if (prevState.lastHistoryEventId === newState.lastHistoryEventId) {
		// Overwrite the last history with the new state.
		const newHistory = prevState.history.slice(0, prevState.historyIndex);
		newHistory.push(canvasStateToHistory(newState));
		const ret = {
			...newState,
			history: newHistory,
			historyIndex: prevState.historyIndex,
			lastHistoryEventId: prevState.lastHistoryEventId,
		};

		// console.log("overwrite history", ret);

		return ret;
	}

	// Add a new history entry.
	let newHistory = prevState.history.slice(0, prevState.historyIndex + 1);
	newHistory.push(canvasStateToHistory(newState));
	let historyIndex = prevState.historyIndex + 1;

	// Remove the oldest history if the size exceeds the maximum limit.
	if (MAX_HISTORY_SIZE <= newHistory.length) {
		newHistory = newHistory.slice(1);
		historyIndex = MAX_HISTORY_SIZE - 1;
	}

	const ret = {
		...newState,
		history: newHistory,
		historyIndex,
	};

	// console.log("history", JSON.stringify(ret, null, 2));
	// console.log("history", ret);

	saveCanvasDataToLocalStorage(ret);

	return ret;
};

/**
 * Convert the canvas state to history format.
 *
 * @param canvasState - The state of the canvas.
 * @returns {SvgCanvasHistory} - The history format of the canvas state.
 */
const canvasStateToHistory = (
	canvasState: SvgCanvasState,
): SvgCanvasHistory => {
	// Deep copy the canvas state to avoid mutating the original state
	const copiedState = deepCopy(canvasState);

	// Convert the canvas state to history format
	return {
		minX: copiedState.minX,
		minY: copiedState.minY,
		width: copiedState.width,
		height: copiedState.height,
		items: copiedState.items,
	} as const satisfies SvgCanvasHistory;
};

export const saveCanvasDataToLocalStorage = (
	canvasState: SvgCanvasState,
): void => {
	// Save the canvas state to local storage
	const canvasData = {
		...canvasState,
		items: clearSelectedRecursive(canvasState.items), // Clear selected items before saving
		multiSelectGroup: undefined, // Exclude multiSelectGroup from local storage
		history: undefined, // Exclude history from local storage
		historyIndex: undefined, // Exclude history index from local storage
		lastHistoryEventId: undefined, // Exclude last history event ID from local storage
	};
	localStorage.setItem("canvasData", JSON.stringify(canvasData));
};

export const loadCanvasDataFromLocalStorage = ():
	| SvgCanvasState
	| undefined => {
	// Load the canvas state from local storage
	const canvasData = localStorage.getItem("canvasData");
	if (canvasData) {
		const canvasState = JSON.parse(canvasData) as SvgCanvasState;
		// Create a new history entry for the loaded state
		const historyEntry = canvasStateToHistory(canvasState);
		const newHistory = [historyEntry];
		const historyIndex = 0; // Set the history index to the first entry
		const lastHistoryEventId = newEventId(); // Generate a new event ID for the loaded state
		return {
			...canvasState,
			history: newHistory,
			historyIndex,
			lastHistoryEventId,
		};
	}
	return undefined;
};

/**
 * Create connect point move data for the new item.
 *
 * @param newItem - The new item for which to create connect point move data.
 * @returns {ConnectPointMoveData[]} - The connect point move data for the new item.
 */
export const createConnectPointMoveData = (
	newItem: Diagram,
): ConnectPointMoveData[] => {
	if (isConnectableData(newItem) && !newItem.isMultiSelectSource) {
		return DiagramConnectPointCalculators[newItem.type](newItem);
	}

	return [];
};

/**
 * Apply the connect point move data to the new item.
 *
 * Note: This is an **impure** function — it mutates the `newItem` argument directly.
 *
 * @param newItem - The new item to which the connect point data will be applied.
 * @param connectPoints - The connect point move data to be applied.
 */
export const applyConnectPointMoveData = (
	newItem: ConnectableData,
	connectPoints: ConnectPointMoveData[],
) => {
	newItem.connectPoints = connectPoints.map((c) => ({
		...c,
		type: "ConnectPoint",
	})) as ConnectPointData[];
};

export const updateConnectPoints = (newItem: Diagram): void => {
	if (isConnectableData(newItem)) {
		const connectPoints = createConnectPointMoveData(newItem);
		if (connectPoints.length > 0) {
			applyConnectPointMoveData(newItem, connectPoints);
		}
	}
};

export const updateConnectPointsRecursive = (newItem: Diagram): void => {
	updateConnectPoints(newItem);
	if (isItemableData(newItem)) {
		for (const childItem of newItem.items) {
			updateConnectPointsRecursive(childItem);
		}
	}
};

/**
 * Update the connect points and notify the move event.
 *
 * Note: This is an **impure** function — it mutates the `newItem` argument directly.
 *
 * @param eventId - The ID of the event.
 * @param eventType - The type of the event.
 * @param newItem - The new item to be updated.
 * @returns {Diagram} - The updated item.
 */
export const updateConnectPointsAndNotifyMove = (
	eventId: string,
	eventType: EventType,
	newItem: Diagram,
): Diagram => {
	const connectPoints = createConnectPointMoveData(newItem);
	if (connectPoints.length > 0) {
		applyConnectPointMoveData(
			newItem as ConnectableData, // newItem can be safely cast to ConnectableData when a connect point is created.
			connectPoints,
		);

		// Notify the connection point move event to ConnectLine components.
		notifyConnectPointsMove({
			eventId,
			eventType,
			points: connectPoints,
		});
	}
	return newItem;
};

export const updateConnectPointsAndCollect = (
	newItem: Diagram,
	connectPointMoveDataList: ConnectPointMoveData[],
): void => {
	if (isConnectableData(newItem)) {
		const connectPoints = createConnectPointMoveData(newItem);
		if (connectPoints.length > 0) {
			applyConnectPointMoveData(newItem, connectPoints);

			for (const connectPoint of newItem.connectPoints) {
				connectPointMoveDataList.push({
					id: connectPoint.id,
					x: connectPoint.x,
					y: connectPoint.y,
					name: connectPoint.name,
					ownerId: newItem.id,
					ownerShape: {
						...newItem,
					},
				});
			}
		}
	}
};

export const updateConnectPointsAndCollectRecursive = (
	newItem: Diagram,
	connectPointMoveDataList: ConnectPointMoveData[],
): void => {
	updateConnectPointsAndCollect(newItem, connectPointMoveDataList);
	if (isItemableData(newItem)) {
		for (const childItem of newItem.items) {
			updateConnectPointsAndCollectRecursive(
				childItem,
				connectPointMoveDataList,
			);
		}
	}
};

/**
 * Check if the event type is a history event.
 *
 * @param eventType - The type of the event to check.
 * @returns {boolean} - True if the event type is a history event, false otherwise.
 */
export const isHistoryEvent = (eventType: EventType): boolean => {
	return eventType === "End" || eventType === "Instant";
};

/**
 * Check if the event type is a diagram changing event.
 *
 * @param eventType - The type of the event to check.
 * @returns	{boolean} - True if the event type is a diagram changing event, false otherwise.
 */
export const isDiagramChangingEvent = (eventType: EventType): boolean => {
	return eventType !== "End" && eventType !== "Instant";
};

/**
 * Update the outline of all groups in the diagram.
 *
 * @param items - The list of diagrams to update.
 * @returns {Diagram[]} - The updated list of diagrams with the outline of all groups updated.
 */
export const updateOutlineOfAllGroups = (items: Diagram[]): Diagram[] => {
	return applyRecursive(items, (item) => {
		if (isItemableData(item)) {
			// Calculate the bounds of the group.
			const box = calcBoundsOfGroup(item);
			if (
				item.x === box.x &&
				item.y === box.y &&
				item.width === box.width &&
				item.height === box.height
			) {
				// If the bounds are the same, return the original object.
				// This is important for React to detect no changes in the reference.
				return item;
			}

			// Return the new object with updated bounds.
			return {
				...item,
				x: box.x,
				y: box.y,
				width: box.width,
				height: box.height,
			};
		}
		return item;
	});
};
