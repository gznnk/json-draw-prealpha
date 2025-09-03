// Import types.
import type { NodeHeaderData } from "../../../types/data/elements/NodeHeaderData";

// Import constants.
import { NodeHeaderFeatures } from "../../../types/data/elements/NodeHeaderData";
import { CreateDefaultData } from "../shapes/CreateDefaultData";

/**
 * Default data values for NodeHeader
 */
export const NodeHeaderDefaultData: NodeHeaderData =
	CreateDefaultData<NodeHeaderData>({
		type: "NodeHeader",
		options: NodeHeaderFeatures,
		properties: {
			height: 30,
			fontColor: "#000000",
			fontSize: 18,
			fontFamily: "Segoe UI",
			fontWeight: "400",
			textAlign: "left",
			verticalAlign: "middle",
			iconBackgroundColor: "#E6E6E6",
		},
	});
