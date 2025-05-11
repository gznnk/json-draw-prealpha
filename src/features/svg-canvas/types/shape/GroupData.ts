import type { CreateDiagramType } from "../DiagramTypes";

/**
 * グループのデータ
 */
export type GroupData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	itemable: true;
}>;
