import type { StickyData } from "../../../types/data/diagrams/StickyData";
import { StickyFeatures } from "../../../types/data/diagrams/StickyData";
import { CreateDefaultData } from "../shapes/CreateDefaultData";

/**
 * Default data values for Sticky
 */
export const StickyDefaultData: StickyData = CreateDefaultData<StickyData>({
	type: "Sticky",
	options: StickyFeatures,
	properties: {
		width: 160,
		height: 120,
		fill: "#fef08a",
		stroke: "#fef08a",
		strokeWidth: "1px",
		text: "Sticky Note",
		fontSize: 14,
		fontColor: "#000000",
		fontWeight: "normal",
		textAlign: "center",
		verticalAlign: "center",
	},
});