import type { LLMProvider } from "../types/LLMProvider";

/**
 * Conversation model.
 * Links work items with LLM client conversations.
 */
export type Conversation = {
	/**
	 * Unique identifier of the conversation
	 */
	id: string;

	/**
	 * ID of the associated work
	 */
	workId: string;
	/**
	 * Type of LLM provider
	 */
	provider: LLMProvider;

	/**
	 * List of messages in the conversation
	 * Stored in provider-specific format
	 */
	messages: unknown[];

	/**
	 * Timestamp when the conversation was created
	 */
	createdAt: Date;
};
