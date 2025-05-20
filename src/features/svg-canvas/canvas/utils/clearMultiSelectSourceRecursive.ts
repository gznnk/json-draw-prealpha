import type { Diagram } from "../../catalog/DiagramTypes";
import { isItemableData } from "../../utils/validation/isItemableData";
import { isSelectableData } from "../../utils/validation/isSelectableData";

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
