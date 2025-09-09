// Import types.
import type { DiagramData } from "../../types/data/core/DiagramData";

/**
 * Type for the data of the SvgCanvas.
 */
export type SvgCanvasData = {
	id: string;
	minX: number;
	minY: number;
	zoom: number;
	items: DiagramData[];
};
