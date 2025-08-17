import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { ImageDefaultState } from "../../../constants/state/shapes/ImageDefaultState";
import type { ImageData } from "../../../types/data/shapes/ImageData";
import type { ImageState } from "../../../types/state/shapes/ImageState";

export const mapImageDataToState =
	createDataToStateMapper<ImageState>(ImageDefaultState);

export const imageDataToState = (data: ImageData): ImageState =>
	mapImageDataToState(data);
