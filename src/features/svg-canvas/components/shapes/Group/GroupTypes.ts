// Import types related to SvgCanvas.
import type { CreateDiagramType } from "../../../types/DiagramTypes";

/**
 * グループのデータ
 */
export type GroupData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	itemable: true;
}>;
