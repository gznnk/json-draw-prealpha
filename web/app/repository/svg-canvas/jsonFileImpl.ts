import type { SvgCanvasRepository } from "./interface";
import type { SvgCanvas } from "../../models/SvgCanvas";

/**
 * JsonFileSvgCanvasRepository provides a SvgCanvasRepository implementation
 * that loads SvgCanvas data from a static JSON file (data/sample.json).
 * This implementation is read-only and does not persist changes.
 */
export class JsonFileSvgCanvasRepository implements SvgCanvasRepository {
	private canvasData: SvgCanvas[] | null = null;
	private loadPromise: Promise<void> | null = null;

	/**
	 * Loads canvas data from data/sample.json using dynamic import
	 */
	private async loadData(): Promise<void> {
		if (this.canvasData !== null) {
			return;
		}

		if (this.loadPromise) {
			return this.loadPromise;
		}

		this.loadPromise = (async () => {
			try {
				const module = await import("../../../../data/sample.json");
				const sampleData = module.default;

				// Handle both single canvas and array of canvases
				if (Array.isArray(sampleData)) {
					this.canvasData = sampleData as SvgCanvas[];
				} else {
					this.canvasData = [sampleData as SvgCanvas];
				}
			} catch (error) {
				console.error("Failed to load canvas data from sample.json:", error);
				this.canvasData = [];
			}
		})();

		return this.loadPromise;
	}

	/**
	 * Retrieves the first canvas from the loaded data.
	 * ID parameter is ignored in this implementation.
	 *
	 * @param _id - The ID of the SvgCanvas to retrieve (ignored)
	 * @returns Promise resolving to the first SvgCanvas if available, undefined otherwise
	 */
	async getCanvasById(_id: string): Promise<SvgCanvas | undefined> {
		await this.loadData();
		return this.canvasData?.[0];
	}

	/**
	 * Updates a canvas (no-op in this implementation as it's read-only)
	 *
	 * @param canvas - The SvgCanvas object to update
	 */
	async updateCanvas(canvas: SvgCanvas): Promise<void> {
		// This implementation is read-only, so we just log the update
		// In a real application, this might trigger a save to localStorage or another backend
		console.log("Canvas updated (not persisted):", canvas.id);
	}
}
