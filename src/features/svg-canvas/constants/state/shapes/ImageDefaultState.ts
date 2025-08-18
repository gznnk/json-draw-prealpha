// Import types.
import type { ImageState } from "../../../types/state/shapes/ImageState";
import { ImageFeatures } from "../../../types/data/shapes/ImageData";

// Import constants.
import { ImageDefaultData } from "../../data/shapes/ImageDefaultData";

// Import helpers.
import { CreateDefaultState } from "./CreateDefaultState";

export const ImageDefaultState = CreateDefaultState<ImageState>({
	type: "Image",
	options: ImageFeatures,
	baseData: ImageDefaultData,
});
