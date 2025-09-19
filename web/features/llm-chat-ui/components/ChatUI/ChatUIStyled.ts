import styled from "@emotion/styled";

/**
 * Container for the entire chat interface
 */
export const ChatContainer = styled.div<{ width?: string; height?: string }>`
	background-color: #0c0f1c;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	width: ${({ width }) => width || "600px"};
	height: ${({ height }) => height || "500px"};
`;

/**
 * Messages display area with scrolling
 */
export const MessagesContainer = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 8px;
	scroll-behavior: smooth;
`;

/**
 * Input form area
 */
export const InputContainer = styled.div`
	padding: 12px;
	display: flex;
	background-color: #0c0f1c;
`;

/**
 * Textarea for message input
 */
export const MessageInput = styled.textarea`
	flex-grow: 1;
	background-color: #0c0f1c;
	border: 2px solid #2a2f4c;
	border-radius: 6px;
	padding: 10px 14px;
	resize: none;
	font-family: inherit;
	font-size: 14px;
	min-height: 20px;
	max-height: 120px;
	outline: none;
	transition: border-color 0.2s;
	color: #b0b0b0;
	caret-color: #b0b0b0;

	&:focus {
		border-color: #3a4160;
	}
	&::placeholder {
		color: #666b82;
	}
`;

/**
 * Blinking caret indicator for streaming AI output
 */
export const CaretIndicator = styled.span`
	display: inline-block;
	width: 1ch;
	height: 1em;
	background: none;
	color: #b0b0b0;
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
