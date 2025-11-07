export type ChatSpaceThread = {
	id: string;
	title: string;
	description?: string;
	unreadCount?: number;
	lastActivityAt?: Date | string;
	lastMessagePreview?: string;
};

export type ChatSpaceMessage = {
	id: string;
	threadId: string;
	role: "user" | "assistant" | string;
	authorName?: string;
	content: string;
	timestamp?: Date | string;
};

export type ChatSpaceProps = {
	threads: ChatSpaceThread[];
	messages: ChatSpaceMessage[];
	initialThreadId?: string;
	width?: string;
	height?: string;
	placeholder?: string;
	threadSearchPlaceholder?: string;
	onThreadSelect?: (threadId: string) => void;
	onSendMessage?: (threadId: string, content: string) => void;
	isSending?: boolean;
};
