import type { Markdown } from "../../model/Markdown";
import type { MarkdownRepository } from "./interface";

/**
 * LocalStorageMarkdownRepository provides a MarkdownRepository implementation
 * that persists markdown documents to the browser's localStorage.
 */
export class LocalStorageMarkdownRepository implements MarkdownRepository {
	private readonly storageKey = "markdowns";

	/**
	 * Saves an array of Markdown objects to localStorage.
	 *
	 * @param markdowns - Array of Markdown objects to save
	 * @returns Promise that resolves when the operation is complete
	 */
	async saveMarkdowns(markdowns: Markdown[]): Promise<void> {
		try {
			const serialized = JSON.stringify(markdowns);
			window.localStorage.setItem(this.storageKey, serialized);
		} catch (error) {
			// Rethrow with context for easier debugging
			throw new Error(
				`Failed to save markdowns to localStorage: ${(error as Error).message}`,
			);
		}
	}

	/**
	 * Retrieves an array of Markdown objects from localStorage.
	 *
	 * @returns Promise resolving to an array of Markdown objects
	 */
	async getMarkdowns(): Promise<Markdown[]> {
		try {
			const data = window.localStorage.getItem(this.storageKey);
			if (!data) {
				return [];
			}
			const parsed = JSON.parse(data) as Markdown[];
			return Array.isArray(parsed) ? parsed : [];
		} catch (error) {
			// Rethrow with context for easier debugging
			throw new Error(
				`Failed to load markdowns from localStorage: ${(error as Error).message}`,
			);
		}
	}

	/**
	 * Updates a single Markdown object in localStorage.
	 * If the Markdown with the same ID exists, it will be updated.
	 * If it doesn't exist, it will be added as a new item.
	 *
	 * @param markdown - Markdown object to update
	 * @returns Promise that resolves when the operation is complete
	 */
	async updateMarkdown(markdown: Markdown): Promise<void> {
		try {
			const markdowns = await this.getMarkdowns();
			const index = markdowns.findIndex((item) => item.id === markdown.id);

			if (index !== -1) {
				// Update existing markdown
				markdowns[index] = markdown;
			} else {
				// Add new markdown
				markdowns.push(markdown);
			}

			await this.saveMarkdowns(markdowns);
		} catch (error) {
			// Rethrow with context for easier debugging
			throw new Error(
				`Failed to update markdown in localStorage: ${(error as Error).message}`,
			);
		}
	}

	/**
	 * Retrieves a Markdown object by its ID from localStorage.
	 *
	 * @param id - ID of the Markdown object to retrieve
	 * @returns Promise resolving to the Markdown object if found, undefined otherwise
	 */
	async getMarkdownById(id: string): Promise<Markdown | undefined> {
		try {
			const markdowns = await this.getMarkdowns();
			return markdowns.find((markdown) => markdown.id === id);
		} catch (error) {
			// Rethrow with context for easier debugging
			throw new Error(
				`Failed to get markdown by ID from localStorage: ${(error as Error).message}`,
			);
		}
	}

	/**
	 * Deletes a Markdown object by its ID from localStorage.
	 *
	 * @param id - ID of the Markdown object to delete
	 * @returns Promise that resolves when the operation is complete
	 */
	async deleteMarkdownById(id: string): Promise<void> {
		try {
			const markdowns = await this.getMarkdowns();
			const filteredMarkdowns = markdowns.filter(
				(markdown) => markdown.id !== id,
			);

			// Only save if something was actually removed
			if (filteredMarkdowns.length < markdowns.length) {
				await this.saveMarkdowns(filteredMarkdowns);
			}
		} catch (error) {
			// Rethrow with context for easier debugging
			throw new Error(
				`Failed to delete markdown by ID from localStorage: ${(error as Error).message}`,
			);
		}
	}
}
