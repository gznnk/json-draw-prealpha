// Import SvgCanvas related types.
import type { Diagram } from "../types/DiagramTypes";
import type { SvgCanvasState } from "../hooks/canvasHooks";

// Import SvgCanvas related functions.
import { isItemableData, isSelectableData } from "./Diagram";
import { deepCopy } from "./Util";

/**
 * Max history size for the history stack.
 */
const MAX_HISTORY_SIZE = 20;

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
 * 選択されている図形を取得する
 *
 * @param items 図形配列
 * @param selectedItems １つ前の再帰呼び出し時の選択されている図形の配列
 * @returns 選択されている図形の配列
 */
export const getSelectedItems = (
	items: Diagram[],
	selectedItems?: Diagram[],
) => {
	const _selectedItems = selectedItems ?? [];
	for (const item of items) {
		if (isSelectableData(item)) {
			if (item.isSelected) {
				_selectedItems.push(item);
			} else if (isItemableData(item)) {
				getSelectedItems(item.items, _selectedItems);
			}
		}
	}
	return _selectedItems;
};

/**
 * 複数選択時に、選択されている図形を選択元として設定する（非表示にする）
 *
 * @param items 図形配列
 * @param isGroupMultiSelected 複数選択されたグループか
 * @returns 更新後の図形配列
 */
export const applyMultiSelectSourceRecursive = (
	items: Diagram[],
	isGroupMultiSelected: boolean,
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
	// Clear the history stack and index from the history data.
	newState.history = [];
	newState.historyIndex = -1;

	// When the last history event ID is the same as the new state, overwrite the history.
	if (prevState.lastHistoryEventId === newState.lastHistoryEventId) {
		// Overwrite the last history with the new state.
		const newHistory = prevState.history.slice(0, prevState.historyIndex);
		newHistory.push(deepCopy(newState));
		const ret = {
			...newState,
			history: newHistory,
			historyIndex: prevState.historyIndex,
			lastHistoryEventId: prevState.lastHistoryEventId,
		};

		// console.log("overwrite history", ret);

		return ret;
	}

	// 履歴を追加
	let newHistory = prevState.history.slice(0, prevState.historyIndex + 1);
	newHistory.push(deepCopy(newState));
	let historyIndex = prevState.historyIndex + 1;

	// 履歴のサイズが最大値を超えた場合、古い履歴を削除
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

	return ret;
};
