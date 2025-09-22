import type { WorkRepository } from "./interface";
import type { Work } from "../../models/Work";

/**
 * LocalStorageWorkRepository provides a WorkRepository implementation
 * that persists works to the browser's localStorage.
 */
export class LocalStorageWorkRepository implements WorkRepository {
	private readonly storageKey = "works";

	/**
	 * Saves an array of Work objects to localStorage.
	 *
	 * @param works - Array of Work objects to save
	 * @returns Promise that resolves when the operation is complete
	 */
	async saveWorks(works: Work[]): Promise<void> {
		try {
			const serialized = JSON.stringify(works);
			window.localStorage.setItem(this.storageKey, serialized);
		} catch (error) {
			// Rethrow with context for easier debugging
			throw new Error(
				`Failed to save works to localStorage: ${(error as Error).message}`,
			);
		}
	}

	/**
	 * Retrieves an array of Work objects from localStorage.
	 *
	 * @returns Promise resolving to an array of Work objects
	 */
	async getWorks(): Promise<Work[]> {
		try {
			const data = window.localStorage.getItem(this.storageKey);
			if (!data) {
				return [];
			}
			const parsed = JSON.parse(data) as Work[];
			return Array.isArray(parsed) ? parsed : [];
		} catch (error) {
			// Rethrow with context for easier debugging
			throw new Error(
				`Failed to load works from localStorage: ${(error as Error).message}`,
			);
		}
	}
}
