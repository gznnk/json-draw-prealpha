import type { DiagramBaseData } from "../../base/DiagramBaseData";

/**
 * Data type for path vertices.
 * Represents individual points that make up a path or polyline.
 */
export type PathPointData = DiagramBaseData & {
	hidden?: boolean;
};
