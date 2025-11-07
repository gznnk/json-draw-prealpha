import type { JSX } from "react";
import {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import {
	ChatSpaceContainer,
	ComposerContainer,
	ComposerForm,
	ComposerHint,
	ComposerTextarea,
	ConversationDescription,
	ConversationHeader,
	ConversationMeta,
	ConversationMessages,
	ConversationPanel,
	ConversationTitle,
	ConversationTitleRow,
	EmptyState,
	EmptyStateDescription,
	EmptyStateTitle,
	MessageAuthor,
	MessageAvatar,
	MessageBody,
	MessageContent,
	MessageHeader,
	MessageRow,
	MessageTimestamp,
	SendButton,
	ThreadList,
	ThreadListButton,
	ThreadListHeader,
	ThreadListMeta,
	ThreadListPreviewAuthor,
	ThreadListPreviewAvatar,
	ThreadListPreviewContent,
	ThreadListPreviewMessage,
	ThreadListPreviewRow,
	ThreadListTitle,
	ThreadSearchInput,
	ThreadsEmptyState,
	UnreadBadge,
} from "./ChatSpaceStyled";
import type {
	ChatSpaceMessage,
	ChatSpaceProps,
	ChatSpaceThread,
} from "./ChatSpaceTypes";

const emptyString = "";

const toDate = (value?: Date | string): Date | null => {
	if (!value) {
		return null;
	}

	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : value;
	}

	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getTimestampValue = (value?: Date | string): number => {
	const date = toDate(value);
	return date ? date.getTime() : 0;
};

const createMessagePreview = (content: string): string => {
	const normalized = content.replace(/\s+/g, " ").trim();
	if (normalized.length <= 72) {
		return normalized;
	}
	return `${normalized.slice(0, 69)}...`;
};

const ChatSpaceComponent = ({
	threads,
	messages,
	initialThreadId,
	width,
	height,
	placeholder = "Type a message",
	threadSearchPlaceholder = "Search threads",
	onThreadSelect,
	onSendMessage,
	isSending = false,
}: ChatSpaceProps): JSX.Element => {
	const [activeThreadId, setActiveThreadId] = useState<string>(() => {
		if (
			initialThreadId &&
			threads.some((thread) => thread.id === initialThreadId)
		) {
			return initialThreadId;
		}

		return threads[0]?.id ?? emptyString;
	});
	const [searchTerm, setSearchTerm] = useState(emptyString);
	const [composerValue, setComposerValue] = useState(emptyString);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const previousInitialThreadId = useRef(initialThreadId);

	const timeFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat(undefined, {
				hour: "2-digit",
				minute: "2-digit",
			}),
		[],
	);

	useEffect(() => {
		if (
			initialThreadId &&
			initialThreadId !== previousInitialThreadId.current &&
			threads.some((thread) => thread.id === initialThreadId)
		) {
			setActiveThreadId(initialThreadId);
		}

		previousInitialThreadId.current = initialThreadId;
	}, [initialThreadId, threads]);

	useEffect(() => {
		const hasActiveThread = threads.some(
			(thread) => thread.id === activeThreadId,
		);

		if (threads.length === 0) {
			if (activeThreadId !== emptyString) {
				setActiveThreadId(emptyString);
			}
			return;
		}

		if (!hasActiveThread) {
			const fallbackId = threads[0]?.id ?? emptyString;
			if (fallbackId !== activeThreadId) {
				setActiveThreadId(fallbackId);
			}
		}
	}, [threads, activeThreadId]);

	const adjustTextareaHeight = useCallback(() => {
		if (!textareaRef.current) {
			return;
		}

		const element = textareaRef.current;
		const minHeight = 48;
		element.style.height = "auto";
		const scrollHeight = element.scrollHeight;
		element.style.height = `${Math.max(scrollHeight, minHeight)}px`;
	}, []);

	useEffect(() => {
		adjustTextareaHeight();
	}, [composerValue, adjustTextareaHeight]);

	const messageSummaryByThread = useMemo(() => {
		const summary = new Map<
			string,
			{ lastMessage: ChatSpaceMessage | undefined }
		>();

		for (const message of messages) {
			const existing = summary.get(message.threadId);

			if (!existing) {
				summary.set(message.threadId, { lastMessage: message });
				continue;
			}

			const existingTimestamp = getTimestampValue(existing.lastMessage?.timestamp);
			const nextTimestamp = getTimestampValue(message.timestamp);

			if (nextTimestamp >= existingTimestamp) {
				summary.set(message.threadId, { lastMessage: message });
			}
		}

		return summary;
	}, [messages]);

	const filteredThreads = useMemo(() => {
		const query = searchTerm.trim().toLowerCase();
		if (!query) {
			return threads;
		}

		return threads.filter((thread) => {
			const titleMatch = thread.title.toLowerCase().includes(query);
			const descriptionMatch = thread.description
				?.toLowerCase()
				.includes(query);
			const previewMatch = thread.lastMessagePreview
				?.toLowerCase()
				.includes(query);
			const lastMessageContent = messageSummaryByThread
				.get(thread.id)
				?.lastMessage?.content?.toLowerCase();

			const lastMessageMatch = lastMessageContent
				? lastMessageContent.includes(query)
				: false;

			return titleMatch || descriptionMatch || previewMatch || lastMessageMatch;
		});
	}, [threads, searchTerm, messageSummaryByThread]);

	const activeThread = useMemo(
		() => threads.find((thread) => thread.id === activeThreadId) ?? null,
		[threads, activeThreadId],
	);

	const activeMessages = useMemo(
		() =>
			messages.filter((message) => message.threadId === activeThreadId),
		[messages, activeThreadId],
	);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [activeThreadId, activeMessages]);

	const handleSelectThread = useCallback(
		(threadId: string) => {
			if (threadId === activeThreadId) {
				return;
			}

			setActiveThreadId(threadId);
			setComposerValue(emptyString);
			onThreadSelect?.(threadId);
		},
		[activeThreadId, onThreadSelect],
	);

	const handleSearchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setSearchTerm(event.target.value);
		},
		[],
	);

	const handleComposerChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement>) => {
			setComposerValue(event.target.value);
		},
		[],
	);

	const handleSendMessage = useCallback(() => {
		const trimmed = composerValue.trim();
		if (!trimmed || !activeThreadId || isSending) {
			return;
		}

		onSendMessage?.(activeThreadId, trimmed);
		setComposerValue(emptyString);
	}, [composerValue, activeThreadId, onSendMessage, isSending]);

	const handleComposerKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (event.key !== "Enter") {
				return;
			}

			if (event.shiftKey) {
				return;
			}

			event.preventDefault();
			handleSendMessage();
		},
		[handleSendMessage],
	);

	const handleSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			handleSendMessage();
		},
		[handleSendMessage],
	);

	const formatTimestamp = useCallback(
		(value?: Date | string) => {
			const date = toDate(value);
			if (!date) {
				return emptyString;
			}

			return timeFormatter.format(date);
		},
		[timeFormatter],
	);

	const getThreadMeta = useCallback(
		(thread: ChatSpaceThread) => {
			const lastMessage = messageSummaryByThread.get(thread.id)?.lastMessage;
			const timestamp =
				getTimestampValue(thread.lastActivityAt) > 0
					? thread.lastActivityAt
					: lastMessage?.timestamp;

			return formatTimestamp(timestamp);
		},
		[messageSummaryByThread, formatTimestamp],
	);

	const getThreadPreview = useCallback(
		(thread: ChatSpaceThread) => {
			if (thread.lastMessagePreview) {
				return thread.lastMessagePreview;
			}

			const lastMessage = messageSummaryByThread.get(thread.id)?.lastMessage;
			if (!lastMessage) {
				return thread.description ?? emptyString;
			}

			return createMessagePreview(lastMessage.content);
		},
		[messageSummaryByThread],
	);

	const showComposer = Boolean(activeThreadId);
	const canSendMessage = showComposer && Boolean(composerValue.trim()) && !isSending;

	return (
		<ChatSpaceContainer width={width} height={height}>
			<ThreadSearchInput
				value={searchTerm}
				onChange={handleSearchChange}
				placeholder={threadSearchPlaceholder}
			/>
			{filteredThreads.length === 0 ? (
				<ThreadsEmptyState>No threads match your search.</ThreadsEmptyState>
			) : (
				<ThreadList>
					{filteredThreads.map((thread) => {
						const threadMeta = getThreadMeta(thread);
						const threadPreview = getThreadPreview(thread);
						const isActive = thread.id === activeThreadId;
						const lastMessage = messageSummaryByThread.get(thread.id)?.lastMessage;
						const previewAuthor = lastMessage
							? lastMessage.authorName?.trim() ||
								(lastMessage.role === "user" ? "You" : "Assistant")
							: null;
						const previewMessage = threadPreview || "New thread";
						const avatarLabel =
							(previewAuthor || thread.title || "T").trim().charAt(0).toUpperCase() ||
							"T";

						return (
							<ThreadListButton
								type="button"
								key={thread.id}
								$active={isActive}
								onClick={() => handleSelectThread(thread.id)}
							>
								<ThreadListHeader>
									<ThreadListTitle>
										{thread.title}
										{thread.unreadCount ? (
											<UnreadBadge>{thread.unreadCount}</UnreadBadge>
										) : null}
									</ThreadListTitle>
									<ThreadListMeta>
										{threadMeta || "No activity yet"}
									</ThreadListMeta>
								</ThreadListHeader>
								<ThreadListPreviewRow>
									<ThreadListPreviewAvatar aria-hidden="true">
										{avatarLabel}
									</ThreadListPreviewAvatar>
									<ThreadListPreviewContent>
										{previewAuthor ? (
											<ThreadListPreviewAuthor>{previewAuthor}</ThreadListPreviewAuthor>
										) : null}
										<ThreadListPreviewMessage>{previewMessage}</ThreadListPreviewMessage>
									</ThreadListPreviewContent>
								</ThreadListPreviewRow>
							</ThreadListButton>
						);
					})}
				</ThreadList>
			)}
			{activeThread ? (
				<ConversationPanel>
					<ConversationHeader>
						<ConversationTitleRow>
							<ConversationTitle>{activeThread.title}</ConversationTitle>
							<ConversationMeta>
								{getThreadMeta(activeThread) || "No activity yet"}
							</ConversationMeta>
						</ConversationTitleRow>
						{activeThread.description ? (
							<ConversationDescription>
								{activeThread.description}
							</ConversationDescription>
						) : null}
					</ConversationHeader>
					{activeMessages.length === 0 ? (
						<EmptyState>
							<EmptyStateTitle>Start the conversation</EmptyStateTitle>
							<EmptyStateDescription>
								Messages for this thread will appear here.
							</EmptyStateDescription>
						</EmptyState>
					) : (
						<ConversationMessages>
							{activeMessages.map((message) => {
								const isOwnMessage = message.role === "user";
								const displayName =
									message.authorName?.trim() ||
									(isOwnMessage ? "You" : "Assistant");
								const avatarLabel =
									displayName.trim().charAt(0).toUpperCase() ||
									(isOwnMessage ? "U" : "A");
								return (
									<MessageRow key={message.id}>
										<MessageAvatar aria-hidden="true">
											{avatarLabel}
										</MessageAvatar>
										<MessageBody>
											<MessageHeader>
												<MessageAuthor>{displayName}</MessageAuthor>
												<MessageTimestamp>
													{formatTimestamp(message.timestamp)}
												</MessageTimestamp>
											</MessageHeader>
											<MessageContent>{message.content}</MessageContent>
										</MessageBody>
									</MessageRow>
								);
							})}
							<div ref={messagesEndRef} />
						</ConversationMessages>
					)}
					{showComposer ? (
						<ComposerContainer>
							<ComposerForm onSubmit={handleSubmit}>
								<ComposerTextarea
									ref={textareaRef}
									value={composerValue}
									onChange={handleComposerChange}
									onKeyDown={handleComposerKeyDown}
									placeholder={placeholder}
									rows={1}
									disabled={isSending}
								/>
								<SendButton type="submit" disabled={!canSendMessage}>
									Send
								</SendButton>
							</ComposerForm>
							<ComposerHint>
								Press Enter to send. Shift+Enter adds a new line.
							</ComposerHint>
						</ComposerContainer>
					) : null}
				</ConversationPanel>
			) : (
				<EmptyState>
					<EmptyStateTitle>Select a thread</EmptyStateTitle>
					<EmptyStateDescription>
						Choose a thread above to see the latest discussion.
					</EmptyStateDescription>
				</EmptyState>
			)}
		</ChatSpaceContainer>
	);
};

export const ChatSpace = memo(ChatSpaceComponent);

