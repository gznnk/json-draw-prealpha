import type { Diagram } from "../../../types/data/catalog/Diagram";
import { isItemableData } from "../../validation/isItemableData";

/**
 * 指定したIDの図形を、配下のグループも含めて再帰的に取得する
 *
 * @param diagrams - 図形リスト
 * @param id - ID
 * @returns 指定したIDの図形
 */
export const getChildDiagramById = (
	diagrams: Diagram[],
	id: string,
): Diagram | undefined => {
	for (const diagram of diagrams) {
		if (diagram.id === id) {
			return diagram;
		}
		if (isItemableData<Diagram>(diagram)) {
			const ret = getChildDiagramById(diagram.items || [], id);
			if (ret) {
				return ret;
			}
		}
	}
	return undefined;
};
