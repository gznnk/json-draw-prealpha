import React, { useCallback, useEffect, useRef, useState, memo } from "react";

import {
	ChatContainer,
	InputContainer,
	MessageInput,
	MessagesContainer,
} from "./ChatUIStyled";
import type { ChatUIProps } from "./ChatUITypes";
import { MessageItem } from "../MessageItem/MessageItem";

/**
 * Main ChatUI component that provides a chat interface.
 * Features include:
 * - Message history display with markdown support
 * - Customizable dimensions with props
 * - Message input with multiline support
 * - External message handling
 *
 * @param props - Component properties
 * @returns React component
 */
const ChatUIComponent: React.FC<ChatUIProps> = ({
	height,
	width,
	messages,
	onSendMessage,
	isLoading = false,
}) => {
	// State for the input field
	const [input, setInput] = useState("");

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

	// Scroll to the bottom of the chat when messages change
	// biome-ignore lint/correctness/useExhaustiveDependencies: To scroll to the bottom when messages change
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	/**
	 * Handles the submission of a new message.
	 * Calls the external onSendMessage handler with the input text.
	 */
	const handleSendMessage = useCallback(() => {
		if (!input.trim() || isLoading) return;

		// Call the external handler with the message content
		onSendMessage(input.trim());

		// Clear input field
		setInput("");

		// Focus back on the input after sending
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [input, isLoading, onSendMessage]);

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
};

export const ChatUI = memo(ChatUIComponent);
