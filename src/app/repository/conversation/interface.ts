import type { Conversation } from "../../models/Conversation";

/**
 * ConversationRepository defines the interface for persisting and retrieving conversations.
 * This interface abstracts the storage implementation, allowing for different persistence strategies.
 */
export interface ConversationRepository {
	/**
	 * Retrieves conversations filtered by work ID.
	 *
	 * @param workId - The ID of the work to filter by
	 * @returns Promise resolving to an array of Conversation objects associated with the work
	 */
	getConversationsByWorkId(workId: string): Promise<Conversation[]>;

	/**
	 * Saves a new conversation or updates an existing one.
	 * If a conversation with the same ID exists, it will be updated.
	 * Otherwise, a new conversation will be created.
	 *
	 * @param conversation - The Conversation object to save
	 * @returns Promise that resolves when the operation is complete
	 */
	saveConversation(conversation: Conversation): Promise<void>;

	/**
	 * Updates an existing conversation's messages.
	 * This is a convenience method for updating just the messages and updatedAt timestamp.
	 *
	 * @param id - The ID of the conversation to update
	 * @param messages - The new messages array
	 * @returns Promise that resolves when the operation is complete
	 */
	updateConversationMessages(id: string, messages: unknown[]): Promise<void>;

	/**
	 * Deletes a conversation by its ID.
	 *
	 * @param id - The ID of the conversation to delete
	 * @returns Promise that resolves when the operation is complete
	 */
	deleteConversation(id: string): Promise<void>;

	/**
	 * Deletes all conversations associated with a specific work ID.
	 *
	 * @param workId - The ID of the work whose conversations should be deleted
	 * @returns Promise that resolves when the operation is complete
	 */
	deleteConversationsByWorkId(workId: string): Promise<void>;
}
