import type { Conversation } from "../../models/Conversation";
import type { ConversationRepository } from "./interface";

/**
 * LocalStorageConversationRepository provides a ConversationRepository implementation
 * that persists conversations to the browser's localStorage.
 */
export class LocalStorageConversationRepository
	implements ConversationRepository
{
	private readonly storageKey = "conversations";

	/**
	 * Private helper method to save an array of Conversation objects to localStorage.
	 *
	 * @param conversations - Array of Conversation objects to save
	 * @returns Promise that resolves when the operation is complete
	 */
	private async saveConversationsInternal(
		conversations: Conversation[],
	): Promise<void> {
		try {
			const serialized = JSON.stringify(conversations, this.dateReplacer);
			window.localStorage.setItem(this.storageKey, serialized);
		} catch (error) {
			throw new Error(
				`Failed to save conversations to localStorage: ${(error as Error).message}`,
			);
		}
	}

	/**
	 * Private helper method to retrieve all Conversation objects from localStorage.
	 *
	 * @returns Promise resolving to an array of Conversation objects
	 */
	private async getConversationsInternal(): Promise<Conversation[]> {
		try {
			const data = window.localStorage.getItem(this.storageKey);
			if (!data) {
				return [];
			}
			const parsed = JSON.parse(data, this.dateReviver) as Conversation[];
			return Array.isArray(parsed) ? parsed : [];
		} catch (error) {
			throw new Error(
				`Failed to load conversations from localStorage: ${(error as Error).message}`,
			);
		}
	}

	/**
	 * JSON replacer function to serialize Date objects properly.
	 *
	 * @param _key - The property key (unused)
	 * @param value - The property value
	 * @returns The value to serialize
	 */
	private dateReplacer(_key: string, value: unknown): unknown {
		if (value instanceof Date) {
			return value.toISOString();
		}
		return value;
	} /**
	 * JSON reviver function to deserialize Date objects properly.
	 *
	 * @param key - The property key
	 * @param value - The property value
	 * @returns The revived value
	 */
	private dateReviver(key: string, value: unknown): unknown {
		if (typeof value === "string" && key === "createdAt") {
			return new Date(value);
		}
		return value;
	}
	/**
	 * Retrieves conversations filtered by work ID.
	 *
	 * @param workId - The ID of the work to filter by
	 * @returns Promise resolving to an array of Conversation objects associated with the work
	 */
	async getConversationsByWorkId(workId: string): Promise<Conversation[]> {
		const allConversations = await this.getConversationsInternal();
		return allConversations.filter(
			(conversation) => conversation.workId === workId,
		);
	}

	/**
	 * Retrieves conversations filtered by work ID synchronously.
	 *
	 * @param workId - The ID of the work to filter by
	 * @returns An array of Conversation objects associated with the work
	 */
	getConversationsByWorkIdSync(workId: string): Conversation[] {
		try {
			const data = window.localStorage.getItem(this.storageKey);
			if (!data) {
				return [];
			}
			const parsed = JSON.parse(data, this.dateReviver) as Conversation[];
			const allConversations = Array.isArray(parsed) ? parsed : [];
			return allConversations.filter(
				(conversation) => conversation.workId === workId,
			);
		} catch (error) {
			console.error("Failed to load conversations synchronously:", error);
			return [];
		}
	}

	/**
	 * Saves a new conversation or updates an existing one.
	 * If a conversation with the same ID exists, it will be updated.
	 * Otherwise, a new conversation will be created.
	 *
	 * @param conversation - The Conversation object to save
	 * @returns Promise that resolves when the operation is complete
	 */
	async saveConversation(conversation: Conversation): Promise<void> {
		const allConversations = await this.getConversationsInternal();
		const existingIndex = allConversations.findIndex(
			(c) => c.id === conversation.id,
		);
		if (existingIndex >= 0) {
			allConversations[existingIndex] = conversation;
		} else {
			allConversations.push(conversation);
		}

		await this.saveConversationsInternal(allConversations);
	}

	/**
	 * Updates an existing conversation's messages.
	 * This is a convenience method for updating just the messages and updatedAt timestamp.
	 *
	 * @param id - The ID of the conversation to update
	 * @param messages - The new messages array
	 * @returns Promise that resolves when the operation is complete
	 */
	async updateConversationMessages(
		id: string,
		messages: unknown[],
	): Promise<void> {
		const allConversations = await this.getConversationsInternal();
		const existingIndex = allConversations.findIndex(
			(conversation) => conversation.id === id,
		);
		if (existingIndex >= 0) {
			allConversations[existingIndex] = {
				...allConversations[existingIndex],
				messages,
			};
			await this.saveConversationsInternal(allConversations);
		} else {
			throw new Error(`Conversation with ID ${id} not found`);
		}
	}

	/**
	 * Deletes a conversation by its ID.
	 *
	 * @param id - The ID of the conversation to delete
	 * @returns Promise that resolves when the operation is complete
	 */
	async deleteConversation(id: string): Promise<void> {
		const allConversations = await this.getConversationsInternal();
		const filteredConversations = allConversations.filter(
			(conversation) => conversation.id !== id,
		);
		await this.saveConversationsInternal(filteredConversations);
	}

	/**
	 * Deletes all conversations associated with a specific work ID.
	 *
	 * @param workId - The ID of the work whose conversations should be deleted
	 * @returns Promise that resolves when the operation is complete
	 */
	async deleteConversationsByWorkId(workId: string): Promise<void> {
		const allConversations = await this.getConversationsInternal();
		const filteredConversations = allConversations.filter(
			(conversation) => conversation.workId !== workId,
		);
		await this.saveConversationsInternal(filteredConversations);
	}
}
