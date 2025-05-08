import type { Message } from "../../types.ts";

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
	/** Optional initial messages to populate the chat */
	initialMessages?: Message[];
}
