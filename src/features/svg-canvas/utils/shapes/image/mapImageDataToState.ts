import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultImageState } from "../../../constants/state/shapes/DefaultImageState";
import type { ImageData } from "../../../types/data/shapes/ImageData";
import type { ImageState } from "../../../types/state/shapes/ImageState";

export const mapImageDataToState = createDataToStateMapper<ImageState>(
	DefaultImageState,
);

export const imageDataToState = (data: ImageData): ImageState =>
	mapImageDataToState(data);