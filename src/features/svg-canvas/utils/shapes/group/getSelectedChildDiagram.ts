import type { Diagram } from "../../../types/data/catalog/Diagram";
import { isItemableData } from "../../validation/isItemableData";
import { isSelectableData } from "../../validation/isSelectableData";

/**
 * 選択されたグループ内の図形を、配下のグループも含めて再帰的に取得する
 *
 * @param {Diagram[]} diagrams 図形リスト
 * @returns {string | undefined} 選択されたグループ内の図形
 */
export const getSelectedChildDiagram = (
	diagrams: Diagram[],
): Diagram | undefined => {
	for (const diagram of diagrams) {
		if (isSelectableData(diagram) && diagram.isSelected) {
			return diagram;
		}
		if (isItemableData<Diagram>(diagram)) {
			const ret = getSelectedChildDiagram(diagram.items || []);
			if (ret) {
				return ret;
			}
		}
	}
	return undefined;
};
