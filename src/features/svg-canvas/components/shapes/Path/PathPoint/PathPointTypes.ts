// Import types related to SvgCanvas.
import type { DiagramBaseData } from "../../../../types/base";

/**
 * 折れ線の頂点のデータ
 */
export type PathPointData = DiagramBaseData & {
	hidden: boolean;
};
