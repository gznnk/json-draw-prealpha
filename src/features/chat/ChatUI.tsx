import React, { useState, useRef, useEffect, useCallback } from "react";
import { OpenAIService } from "./services/OpenAIService";
import { MessageItem } from "./components/MessageItem";
import type { Message, ChatUIProps } from "./types";
import {
	ChatContainer,
	ChatHeader,
	AssistantAvatar,
	HeaderTitle,
	MessagesContainer,
	InputContainer,
	MessageInput,
	SendButton,
	LoadingIndicator,
	ApiKeyFormContainer,
	FormTitle,
	ApiKeyInput,
	SubmitButton,
	FormDescription,
} from "./styles/ChatUIStyles";

/**
 * Main ChatUI component that provides a ChatGPT-like interface.
 * Features include:
 * - Message history display with markdown support
 * - Customizable dimensions with props
 * - Message input with multiline support
 * - OpenAI API integration with streaming responses
 * - API key configuration form
 *
 * @param props - Component properties
 * @returns React component
 */
export const ChatUI = React.memo(
	({
		height,
		width,
		apiKey,
		openAIConfig,
		initialMessages = [],
		inputPlaceholder = "Type a message...",
		onMessagesChange,
		isLoading: externalIsLoading,
		onSendMessage,
		onApiKeyChange,
	}: ChatUIProps) => {
		// State for managing messages and UI state
		const [messages, setMessages] = useState<Message[]>(initialMessages);
		const [input, setInput] = useState("");
		const [isLoading, setIsLoading] = useState(false);
		const [openAIService, setOpenAIService] = useState<OpenAIService | null>(
			null,
		);
		const [apiKeyInput, setApiKeyInput] = useState("");

		// References for DOM elements
		const messagesEndRef = useRef<HTMLDivElement>(null);
		const inputRef = useRef<HTMLTextAreaElement>(null);

		// Initialize OpenAI service if API key provided
		useEffect(() => {
			if (apiKey && openAIConfig) {
				setOpenAIService(new OpenAIService(apiKey, openAIConfig));
			} else {
				setOpenAIService(null);
			}
		}, [apiKey, openAIConfig]);

		// Scroll to bottom when messages change
		useEffect(() => {
			if (messagesEndRef.current) {
				messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		// Notify parent component of message changes
		useEffect(() => {
			if (onMessagesChange) {
				onMessagesChange(messages);
			}
		}, [messages, onMessagesChange]);

		/**
		 * Handles the submission of a new message.
		 * Adds the user message to the chat and triggers OpenAI request if available.
		 */
		const handleSendMessage = useCallback(async () => {
			if (!input.trim() || isLoading || externalIsLoading) return;

			const userMessage: Message = {
				role: "user",
				content: input.trim(),
				timestamp: new Date(),
			};

			// Add user message to the chat
			setMessages((prev) => [...prev, userMessage]);
			setInput("");

			// Focus back on the input after sending
			if (inputRef.current) {
				inputRef.current.focus();
			}

			// If external handler is provided, let the parent component handle the API call
			if (onSendMessage) {
				onSendMessage(userMessage.content);
				return;
			}

			// If OpenAI service is available, make the API call
			if (openAIService) {
				try {
					setIsLoading(true);

					// Create a placeholder for the assistant response
					const assistantMessage: Message = {
						role: "assistant",
						content: "",
						timestamp: new Date(),
					};

					setMessages((prev) => [...prev, assistantMessage]);

					// Stream the response and update the message content
					await openAIService.streamChatCompletion(
						[...messages, userMessage],
						(chunk) => {
							setMessages((prev) => {
								const updated = [...prev];
								const lastMessage = updated[updated.length - 1];
								updated[updated.length - 1] = {
									...lastMessage,
									content: lastMessage.content + chunk,
								};
								return updated;
							});

							if (messagesEndRef.current) {
								messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
							}
						},
					);
				} catch (error) {
					console.error("Error calling OpenAI:", error);
					// Add an error message
					setMessages((prev) => [
						...prev,
						{
							role: "assistant",
							content:
								"Sorry, I encountered an error while generating a response. Please try again.",
							timestamp: new Date(),
						},
					]);
				} finally {
					setIsLoading(false);
				}
			}
		}, [
			input,
			isLoading,
			externalIsLoading,
			messages,
			onSendMessage,
			openAIService,
		]);

		/**
		 * Handles the submission of API key
		 */
		const handleApiKeySubmit = useCallback(() => {
			if (apiKeyInput.trim() && onApiKeyChange) {
				onApiKeyChange(apiKeyInput.trim());
			}
		}, [apiKeyInput, onApiKeyChange]);

		/**
		 * Handles keyboard events in the textarea.
		 * Submits on Ctrl+Enter or Cmd+Enter.
		 */
		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent) => {
				if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
					e.preventDefault();
					handleSendMessage();
				}
			},
			[handleSendMessage],
		);

		/**
		 * Handle API key input keydown for Enter key
		 */
		const handleApiKeyInputKeyDown = useCallback(
			(e: React.KeyboardEvent) => {
				if (e.key === "Enter") {
					e.preventDefault();
					handleApiKeySubmit();
				}
			},
			[handleApiKeySubmit],
		);

		/**
		 * Adjust textarea height based on content
		 */
		const adjustTextareaHeight = useCallback(() => {
			if (inputRef.current) {
				inputRef.current.style.height = "auto";
				inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
			}
		}, []);

		/**
		 * Handle input changes and resize textarea
		 */
		const handleInputChange = useCallback(
			(e: React.ChangeEvent<HTMLTextAreaElement>) => {
				setInput(e.target.value);
				adjustTextareaHeight();
			},
			[adjustTextareaHeight],
		);

		// Render API key form if API key is not provided
		if (!apiKey) {
			return (
				<ChatContainer width={width} height={height}>
					<ChatHeader>
						<AssistantAvatar>AI</AssistantAvatar>
						<HeaderTitle>AI Assistant</HeaderTitle>
					</ChatHeader>

					<ApiKeyFormContainer>
						<FormTitle>OpenAI API設定</FormTitle>
						<FormDescription>
							チャット機能を使用するには、OpenAI
							APIキーを入力してください。APIキーはブラウザのローカルストレージに保存され、サーバーには送信されません。
						</FormDescription>
						<ApiKeyInput
							type="password"
							placeholder="OpenAI APIキーを入力"
							value={apiKeyInput}
							onChange={(e) => setApiKeyInput(e.target.value)}
							onKeyDown={handleApiKeyInputKeyDown}
						/>
						<SubmitButton onClick={handleApiKeySubmit}>
							保存して続行
						</SubmitButton>
					</ApiKeyFormContainer>
				</ChatContainer>
			);
		}

		return (
			<ChatContainer width={width} height={height}>
				<ChatHeader>
					<AssistantAvatar>AI</AssistantAvatar>
					<HeaderTitle>AI Assistant</HeaderTitle>
				</ChatHeader>

				<MessagesContainer>
					{messages.map((message, index) => (
						<MessageItem
							key={`${message.role}-${message.timestamp?.getTime() || index}`}
							message={message}
						/>
					))}

					{(isLoading || externalIsLoading) && (
						<LoadingIndicator>AI is thinking</LoadingIndicator>
					)}

					{/* Empty div for scrolling to bottom */}
					<div ref={messagesEndRef} />
				</MessagesContainer>

				<InputContainer>
					<MessageInput
						ref={inputRef}
						value={input}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						placeholder={inputPlaceholder}
						rows={1}
						disabled={isLoading || externalIsLoading}
					/>
					<SendButton
						onClick={handleSendMessage}
						isDisabled={!input.trim() || isLoading || !!externalIsLoading}
						disabled={!input.trim() || isLoading || !!externalIsLoading}
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Send Icon</title>
							<path
								d="M22 2L11 13"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M22 2L15 22L11 13L2 9L22 2Z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</SendButton>
				</InputContainer>
			</ChatContainer>
		);
	},
);
