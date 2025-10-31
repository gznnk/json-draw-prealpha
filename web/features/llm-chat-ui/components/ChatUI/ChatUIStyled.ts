import styled from "@emotion/styled";

/**
 * Container for the entire chat interface
 * Tailwind-inspired design with light background
 */
export const ChatContainer = styled.div<{ width?: string; height?: string }>`
	background-color: #ffffff;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	width: ${({ width }) => width || "600px"};
	height: ${({ height }) => height || "500px"};
	border-radius: 8px;
	box-shadow:
		0 1px 3px 0 rgb(0 0 0 / 0.1),
		0 1px 2px -1px rgb(0 0 0 / 0.1);
`;

/**
 * Messages display area with scrolling
 * Tailwind-inspired spacing and styling
 */
export const MessagesContainer = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
	scroll-behavior: smooth;
	background-color: #f9fafb;

	/* Custom scrollbar styling */
	&::-webkit-scrollbar {
		width: 6px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: #d1d5db;
		border-radius: 3px;
	}

	&::-webkit-scrollbar-thumb:hover {
		background: #9ca3af;
	}
`;

/**
 * Input form area
 * Tailwind-inspired with border and padding
 */
export const InputContainer = styled.div`
	padding: 16px;
	display: flex;
	background-color: #ffffff;
	border-top: 1px solid #e5e7eb;
`;

/**
 * Textarea for message input
 * Tailwind-inspired with focus ring
 */
export const MessageInput = styled.textarea`
	flex-grow: 1;
	background-color: #ffffff;
	border: 1px solid #d1d5db;
	border-radius: 8px;
	padding: 12px 16px;
	resize: none;
	font-family: inherit;
	font-size: 14px;
	line-height: 1.5;
	min-height: 20px;
	max-height: 120px;
	outline: none;
	transition: all 0.2s ease;
	color: #111827;
	caret-color: #3b82f6;

	&:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
	}

	&::placeholder {
		color: #9ca3af;
	}

	&:disabled {
		background-color: #f3f4f6;
		color: #6b7280;
		cursor: not-allowed;
	}
`;

/**
 * Blinking caret indicator for streaming AI output
 * Tailwind-inspired with blue accent color
 */
export const CaretIndicator = styled.span`
	display: inline-block;
	width: 1ch;
	height: 1em;
	background: none;
	color: #3b82f6;
	font-weight: bold;
	animation: blink-caret 1s steps(1) infinite;
	vertical-align: baseline;
	margin-left: 2px;

	@keyframes blink-caret {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0;
		}
	}
`;
