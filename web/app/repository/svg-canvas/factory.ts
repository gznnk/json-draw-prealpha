import type { SvgCanvasRepository } from "./interface";
import { JsonFileSvgCanvasRepository } from "./jsonFileImpl";

/**
 * Creates and returns a SvgCanvasRepository implementation.
 * Currently returns a JSON file-based implementation that loads from data/sample.json.
 *
 * @returns A SvgCanvasRepository instance
 */
export const createSvgCanvasRepository = (): SvgCanvasRepository => {
	return new JsonFileSvgCanvasRepository();
};
