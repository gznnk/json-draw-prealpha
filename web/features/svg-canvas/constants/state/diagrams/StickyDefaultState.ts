import type { StickyState } from "../../../types/state/diagrams/StickyState";
import { CreateDefaultState } from "../shapes/CreateDefaultState";

/**
 * Default state values for Sticky
 */
export const StickyDefaultState: StickyState = CreateDefaultState({
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
	baseData: {
		fill: "#fff275",
		stroke: "#d4af37",
		text: "Sticky Note",
	},
});
