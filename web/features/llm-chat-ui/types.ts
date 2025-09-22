/**
 * Represents a single message in the chat conversation.
 * Contains the content, role (user or assistant), and timestamp.
 */
export interface Message {
	/** The content of the message */
	content: string;
	/** The role of the message sender (user or assistant) */
	role: "user" | "assistant";
	/** Optional timestamp when the message was created */
	timestamp?: Date;
}
