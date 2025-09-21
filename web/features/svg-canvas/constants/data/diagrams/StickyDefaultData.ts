import type { StickyData } from "../../../types/data/diagrams/StickyData";
import { CreateDefaultData } from "../shapes/CreateDefaultData";

/**
 * Default data values for Sticky
 */
export const StickyDefaultData: StickyData = CreateDefaultData({
	type: "Sticky",
	options: {
		frameable: true,
		transformative: true,
		connectable: false,
		strokable: true,
		fillable: true,
		cornerRoundable: false,
		textable: true,
		selectable: true,
		fileDroppable: false,
	},
});
