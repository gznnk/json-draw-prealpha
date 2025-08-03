import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { ImageDefaultData } from "../../../constants/data/shapes/ImageDefaultData";
import type { ImageData } from "../../../types/data/shapes/ImageData";
import type { ImageState } from "../../../types/state/shapes/ImageState";

export const mapImageStateToData = createStateToDataMapper<ImageData>(
	ImageDefaultData,
);

export const imageStateToData = (state: ImageState): ImageData =>
	mapImageStateToData(state);