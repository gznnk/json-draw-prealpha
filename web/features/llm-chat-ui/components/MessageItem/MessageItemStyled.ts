import styled from "@emotion/styled";

/**
 * Styled container for user messages
 */
export const UserMessageContainer = styled.div`
	font-size: 0.9em;
	color: #c0c4d2;
	background-color: #2a2f4c;
	padding: 12px 18px;
	border-radius: 8px;
	margin: 8px 0;
	align-self: flex-end;
	max-width: 80%;
`;

/**
 * Styled container for assistant messages
 */
export const AssistantMessageContainer = styled.div`
	font-size: 0.9em;
	color: #b0b0b0;
	margin: 8px 0;
	align-self: flex-start;
	width: 100%;
	box-sizing: border-box;
`;

/**
 * Styled content area for markdown-rendered text
 */
export const MessageContent = styled.div`
	& a {
		color: #3a79b8;
		pointer-events: auto;
		transition: color 0.2s ease;
	}
	& a:hover {
		color: #4ea1ff;
	}

	pre {
		background-color: #1a1f33;
		padding: 0;
		border-radius: 4px;
		overflow-x: auto;

		& > code {
			background-color: #1a1f33;
			border: 1px solid rgba(0, 0, 0, 0.15);
			margin: 0;
		}
	}

	code {
		font-family: "Courier New", monospace;
		background-color: #2a2f4c;
		padding: 1px 4px 1px 4px;
		border-radius: 3px;
		margin: 0 0.2em;
	}

	p {
		margin: 0.5em 0;
	}

	p:first-of-type {
		margin-top: 0;
	}

	p:last-of-type {
		margin-bottom: 0;
	}

	img {
		max-width: 100%;
	}

	.math-block {
		overflow-x: auto;
		margin: 1em 0;
		padding: 0 1em;
		box-sizing: border-box;
	}
`;
