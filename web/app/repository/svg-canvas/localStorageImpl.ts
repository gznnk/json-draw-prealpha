import type { SvgCanvasRepository } from "./interface";
import type { SvgCanvas } from "../../models/SvgCanvas";

/**
 * LocalStorageSvgCanvasRepository provides a SvgCanvasRepository implementation
 * that persists SvgCanvas objects to the browser's localStorage.
 */
export class LocalStorageSvgCanvasRepository implements SvgCanvasRepository {
	private readonly storageKey = "svgCanvases";

	/**
	 * Private helper method to save an array of SvgCanvas objects to localStorage.
	 *
	 * @param canvases - Array of SvgCanvas objects to save
	 * @returns Promise that resolves when the operation is complete
	 */
	private async saveCanvasesInternal(canvases: SvgCanvas[]): Promise<void> {
		setTimeout(() => {
			// This is a workaround to avoid blocking the main thread.
			try {
				const serialized = JSON.stringify(canvases);
				window.localStorage.setItem(this.storageKey, serialized);
			} catch (error) {
				// Rethrow with context for easier debugging
				throw new Error(
					`Failed to save SVG canvases to localStorage: ${(error as Error).message}`,
				);
			}
		}, 0);
	}

	/**
	 * Private helper method to retrieve all SvgCanvas objects from localStorage.
	 *
	 * @returns Promise resolving to an array of SvgCanvas objects
	 */
	private async getCanvasesInternal(): Promise<SvgCanvas[]> {
		try {
			const data = window.localStorage.getItem(this.storageKey);
			if (!data) {
				return [];
			}
			const parsed = JSON.parse(data) as SvgCanvas[];
			return Array.isArray(parsed) ? parsed : [];
		} catch (error) {
			// Rethrow with context for easier debugging
			throw new Error(
				`Failed to load SVG canvases from localStorage: ${(error as Error).message}`,
			);
		}
	}

	/**
	 * Updates a specific SvgCanvas in localStorage.
	 *
	 * @param canvas - The SvgCanvas object to update
	 * @returns Promise that resolves when the operation completes
	 */
	async updateCanvas(canvas: SvgCanvas): Promise<void> {
		try {
			const canvases = await this.getCanvasesInternal();
			const index = canvases.findIndex((c: SvgCanvas) => c.id === canvas.id);

			if (index === -1) {
				// If not found, add it
				canvases.push(canvas);
			} else {
				// If found, update it
				canvases[index] = canvas;
			}

			await this.saveCanvasesInternal(canvases);
		} catch (error) {
			throw new Error(
				`Failed to update SVG canvas in localStorage: ${(error as Error).message}`,
			);
		}
	}

	/**
	 * Retrieves a specific SvgCanvas by its ID.
	 *
	 * @param id - The ID of the SvgCanvas to retrieve
	 * @returns Promise resolving to the SvgCanvas if found, undefined otherwise
	 */
	async getCanvasById(id: string): Promise<SvgCanvas | undefined> {
		try {
			const canvases = await this.getCanvasesInternal();
			return canvases.find((canvas: SvgCanvas) => canvas.id === id);
		} catch (error) {
			throw new Error(
				`Failed to get SVG canvas by ID from localStorage: ${(error as Error).message}`,
			);
		}
	}

	/**
	 * Deletes a specific SvgCanvas by its ID.
	 *
	 * @param id - The ID of the SvgCanvas to delete
	 * @returns Promise that resolves when the operation completes
	 */
	async deleteCanvasById(id: string): Promise<void> {
		try {
			const canvases = await this.getCanvasesInternal();
			const filteredCanvases = canvases.filter(
				(canvas: SvgCanvas) => canvas.id !== id,
			);

			// Only save if something was actually removed
			if (filteredCanvases.length !== canvases.length) {
				await this.saveCanvasesInternal(filteredCanvases);
			}
		} catch (error) {
			throw new Error(
				`Failed to delete SVG canvas from localStorage: ${(error as Error).message}`,
			);
		}
	}
}
