// Import types.
import type { Diagram } from "../../types/data/catalog/Diagram";

/**
 * Type for the data of the SvgCanvas.
 */
export type SvgCanvasData = {
	id: string;
	minX: number;
	minY: number;
	items: Diagram[];
};
