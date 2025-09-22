import type { SvgCanvasRepository } from "./interface";
import { LocalStorageSvgCanvasRepository } from "./localStorageImpl";

/**
 * Creates and returns a SvgCanvasRepository implementation.
 * Currently returns a localStorage-based implementation.
 *
 * @returns A SvgCanvasRepository instance
 */
export const createSvgCanvasRepository = (): SvgCanvasRepository => {
	return new LocalStorageSvgCanvasRepository();
};
