// Import types.
import type { ConnectLineData } from "../../../types/data/shapes/ConnectLineData";
import { ConnectLineFeatures } from "../../../types/data/shapes/ConnectLineData";

// Import helpers.
import { CreateDefaultData } from "./CreateDefaultData";

/**
 * Default connect line data template.
 * Generated using Features definition and CreateDefaultData helper.
 */
export const ConnectLineDefaultData = CreateDefaultData<ConnectLineData>({
	type: "ConnectLine",
	options: ConnectLineFeatures,
	properties: {
		pathType: "Linear",
		stroke: "#002766",
		strokeWidth: "2px",
		startOwnerId: "",
		endOwnerId: "",
		autoRouting: true,
		endArrowHead: "Circle",
	},
});