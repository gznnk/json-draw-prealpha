// Import React.
import React, { useCallback, useEffect, useRef, useState } from "react";

// Import related to this component.
import type { Message } from "../../types";
import { MessageItem } from "../MessageItem/MessageItem";
import {
	ChatContainer,
	InputContainer,
	MessageInput,
	MessagesContainer,
} from "./ChatUIStyled";
import type { ChatUIProps } from "./ChatUITypes";

// Import LLM client
import type { LLMClient } from "../../../llm-client";
import { LLMClientFactory } from "../../../llm-client";

// Import AI tools
import { workflowAgent } from "../../../svg-canvas/tools/workflow_agent";
import { newSheet } from "../../../../app/tools/new_sheet";
import { createSandbox } from "../../../../app/tools/sandbox";

/**
 * Main ChatUI component that provides a ChatGPT-like interface.
 * Features include:
 * - Message history display with markdown support
 * - Customizable dimensions with props
 * - Message input with multiline support
 * - LLM integration with streaming responses
 * - API key configuration form
 *
 * @param props - Component properties
 * @returns React component
 */
export const ChatUI = React.memo(
	({ height, width, apiKey, initialMessages = [] }: ChatUIProps) => {
		// State for managing messages and UI state
		const [messages, setMessages] = useState<Message[]>(initialMessages);
		const [input, setInput] = useState("");
		const [isLoading, setIsLoading] = useState(false);
		const [llmClient, setLLMClient] = useState<LLMClient | null>(null);

		// References for DOM elements
		const messagesEndRef = useRef<HTMLDivElement>(null);
		const inputRef = useRef<HTMLTextAreaElement>(null);

		/**
		 * Adjust textarea height based on content.
		 * Sets height to fit content or minimum height if empty.
		 */
		const adjustTextareaHeight = useCallback(() => {
			if (inputRef.current) {
				// Reset height to auto first to get accurate scrollHeight
				inputRef.current.style.height = "auto";
				// Set height to scrollHeight or minimum height (e.g. 36px)
				const minHeight = 36;
				const newHeight = Math.max(inputRef.current.scrollHeight, minHeight);
				inputRef.current.style.height = `${newHeight}px`;
			}
		}, []);

		// Adjust textarea height on initial render and when input changes
		useEffect(() => {
			adjustTextareaHeight();
		}, [adjustTextareaHeight]);

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

		// Initialize LLM client if API key provided
		useEffect(() => {
			if (apiKey) {
				// 標準のLLMClientFactoryを使用
				const client = LLMClientFactory.createClient(apiKey, {
					tools: [
						workflowAgent.definition,
						newSheet.definition,
						createSandbox.definition,
					],
					functionHandlers: {
						workflow_agent: workflowAgent.handler,
						new_sheet: newSheet.handler,
						create_sandbox: createSandbox.handler,
					},
					systemPrompt:
						"You are a general-purpose assistant that outputs responses in Markdown format. " +
						"When including LaTeX expressions, do not use code blocks. " +
						"Instead, use inline LaTeX syntax like $...$ for inline math and $$...$$ for block math." +
						"When creating workflows, always create a new sheet first before creating the workflow itself. IMPORTANT TOOL SELECTION: When asked to create HTML content, interactive applications (like calculators, games, demos), you MUST use the create_sandbox tool, NOT workflow_agent. The create_sandbox tool is specifically designed for HTML/JavaScript applications with a complete document structure. If the user request contains keywords like 'アプリ', 'ゲーム', 'デモ', 'HTML', 'インタラクティブ', '計算機', 'アプリケーション', or any interactive content that would benefit from HTML rendering, you MUST use the create_sandbox tool. Use workflow_agent ONLY for workflow diagrams, not for web applications.",
				});
				setLLMClient(client);
			} else {
				setLLMClient(null);
			}
		}, [apiKey]);

		// Scroll to the bottom of the chat when messages change
		// biome-ignore lint/correctness/useExhaustiveDependencies: To scroll to the bottom when messages change
		useEffect(() => {
			if (messagesEndRef.current) {
				messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
			}
		}, [messages]);

		/**
		 * Handles the submission of a new message.
		 * Adds the user message to the chat and triggers LLM request if available.
		 */
		const handleSendMessage = useCallback(async () => {
			if (!input.trim() || isLoading) return;

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

			// If LLM client is available, make the API call
			if (llmClient) {
				try {
					setIsLoading(true);

					// Create a placeholder for the assistant response
					const assistantMessage: Message = {
						role: "assistant",
						content: "",
						timestamp: new Date(),
					};

					setMessages((prev) => [...prev, assistantMessage]);

					// Stream the response and update the message content using LLM client
					await llmClient.chat({
						message: userMessage.content,
						onTextChunk: (textChunk: string) => {
							setMessages((prev) => {
								const updated = [...prev];
								const lastMessage = updated[updated.length - 1];
								updated[updated.length - 1] = {
									...lastMessage,
									content: lastMessage.content + textChunk,
								};
								return updated;
							});
						},
					});
				} catch (error) {
					console.error("Error calling LLM service:", error);
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
		}, [input, isLoading, llmClient]);

		/**
		 * Handles keyboard events in the textarea input.
		 * Controls message submission and line breaking behavior based on key combinations.
		 *
		 * @param e - Keyboard event from the textarea
		 */
		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent) => {
				// Insert line break on Shift+Enter
				if (e.key === "Enter") {
					// Let the default behavior add a new line
					if (e.shiftKey) return;

					e.preventDefault();
					handleSendMessage();
				}
			},
			[handleSendMessage],
		);

		return (
			<ChatContainer width={width} height={height}>
				<MessagesContainer>
					{messages.map((message, index) => (
						<MessageItem
							key={`${message.role}-${message.timestamp?.getTime() || index}`}
							message={message}
							showCaret={
								message.role === "assistant" &&
								index === messages.length - 1 &&
								isLoading
							}
						/>
					))}
					{/* Empty div for scrolling to bottom */}
					<div ref={messagesEndRef} />
				</MessagesContainer>
				<InputContainer>
					<MessageInput
						ref={inputRef}
						value={input}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						placeholder="Type a message..."
						rows={1}
						disabled={isLoading}
					/>
				</InputContainer>
			</ChatContainer>
		);
	},
);
