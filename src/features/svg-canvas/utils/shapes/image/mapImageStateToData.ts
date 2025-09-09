import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { ImageDefaultData } from "../../../constants/data/shapes/ImageDefaultData";
import type { ImageData } from "../../../types/data/shapes/ImageData";
import type { ImageState } from "../../../types/state/shapes/ImageState";
import type { Diagram } from "../../../types/state/catalog/Diagram";
import type { DiagramData } from "../../../types/data/catalog/DiagramData";

export const mapImageStateToData = createStateToDataMapper<ImageData>(
	ImageDefaultData,
);

export const imageStateToData = (state: Diagram): DiagramData =>
	mapImageStateToData(state as ImageState);