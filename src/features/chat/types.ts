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

/**
 * Configuration for the OpenAI API request.
 * Includes model selection, temperature, and other parameters.
 */
export interface OpenAIConfig {
	/** The model to use for completion */
	model: string;
	/** Controls randomness: 0 = deterministic, 1 = maximum randomness */
	temperature?: number;
}

/**
 * Props for the ChatUI component.
 * Controls appearance, behavior, and API integration.
 */
export interface ChatUIProps {
	/** Custom height for the chat container (CSS value) */
	height?: string;
	/** Custom width for the chat container (CSS value) */
	width?: string;
	/** Optional API key for OpenAI */
	apiKey?: string;
	/** Configuration for OpenAI API requests */
	openAIConfig?: OpenAIConfig;
	/** Optional callback when messages change */
	onMessagesChange?: (messages: Message[]) => void;
	/** Optional initial messages to populate the chat */
	initialMessages?: Message[];
	/** Optional placeholder for the input field */
	inputPlaceholder?: string;
	/** Whether the AI is currently generating a response */
	isLoading?: boolean;
	/** Callback for when the send button is clicked */
	onSendMessage?: (message: string) => void;
}
