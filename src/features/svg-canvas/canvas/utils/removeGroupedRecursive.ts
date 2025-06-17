import type { Diagram } from "../../types/data/catalog/Diagram";
import { isItemableData } from "../../utils/validation/isItemableData";
import { isSelectableData } from "../../utils/validation/isSelectableData";

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
