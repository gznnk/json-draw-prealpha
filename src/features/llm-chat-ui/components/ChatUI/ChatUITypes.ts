import type { Message } from "../../types.ts";

/**
 * Props for the ChatUI component.
 * Controls appearance, behavior, and message handling.
 */
export interface ChatUIProps {
	/** Custom height for the chat container (CSS value) */
	height?: string;
	/** Custom width for the chat container (CSS value) */
	width?: string;
	/** Messages to display in the chat */
	messages: Message[];
	/** Callback fired when a message is sent by the user */
	onSendMessage: (message: string) => void;
	/** Whether the system is currently processing a request */
	isLoading?: boolean;
}
