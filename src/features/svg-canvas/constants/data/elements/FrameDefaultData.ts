// Import types.
import type { FrameData } from "../../../types/data/elements/FrameData";

// Import constants.
import { CreateDefaultData } from "../shapes/CreateDefaultData";
import { FrameFeatures } from "../../../types/data/elements/FrameData";

/**
 * Default data values for Frame
 */
export const FrameDefaultData: FrameData = CreateDefaultData<FrameData>({
	type: "Frame",
	options: FrameFeatures,
	properties: {
		width: 100,
		height: 100,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
	},
});
