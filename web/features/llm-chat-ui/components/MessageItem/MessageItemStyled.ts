import styled from "@emotion/styled";

/**
 * Styled container for user messages
 * Tailwind-inspired with blue accent and shadow
 */
export const UserMessageContainer = styled.div`
	font-size: 14px;
	line-height: 1.6;
	color: #ffffff;
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	padding: 12px 16px;
	border-radius: 12px;
	margin: 0;
	align-self: flex-end;
	max-width: 80%;
	box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
	word-wrap: break-word;
`;

/**
 * Styled container for assistant messages
 * Tailwind-inspired with light background and border
 */
export const AssistantMessageContainer = styled.div`
	font-size: 14px;
	line-height: 1.6;
	color: #1f2937;
	background-color: #ffffff;
	padding: 12px 16px;
	border-radius: 12px;
	margin: 0;
	align-self: flex-start;
	max-width: 85%;
	box-sizing: border-box;
	border: 1px solid #e5e7eb;
	box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
`;

/**
 * Styled content area for markdown-rendered text
 * Tailwind-inspired with modern colors and spacing
 */
export const MessageContent = styled.div`
	& a {
		color: #3b82f6;
		text-decoration: underline;
		text-decoration-color: #93c5fd;
		pointer-events: auto;
		transition: color 0.2s ease;
	}

	& a:hover {
		color: #2563eb;
		text-decoration-color: #3b82f6;
	}

	pre {
		background-color: #f3f4f6;
		padding: 0;
		border-radius: 6px;
		overflow-x: auto;
		margin: 12px 0;
		border: 1px solid #e5e7eb;

		& > code {
			background-color: #f3f4f6;
			border: none;
			margin: 0;
			padding: 16px;
			display: block;
		}
	}

	code {
		font-family:
			ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
			"Liberation Mono", monospace;
		background-color: #f3f4f6;
		color: #dc2626;
		padding: 2px 6px;
		border-radius: 4px;
		margin: 0 2px;
		font-size: 0.9em;
		border: 1px solid #e5e7eb;
	}

	p {
		margin: 8px 0;
	}

	p:first-of-type {
		margin-top: 0;
	}

	p:last-of-type {
		margin-bottom: 0;
	}

	ul,
	ol {
		margin: 8px 0;
		padding-left: 24px;
	}

	li {
		margin: 4px 0;
	}

	blockquote {
		border-left: 3px solid #d1d5db;
		padding-left: 16px;
		margin: 12px 0;
		color: #6b7280;
		font-style: italic;
	}

	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		margin: 16px 0 8px 0;
		font-weight: 600;
		color: #111827;
	}

	h1:first-of-type,
	h2:first-of-type,
	h3:first-of-type {
		margin-top: 0;
	}

	img {
		max-width: 100%;
		border-radius: 8px;
		margin: 12px 0;
	}

	table {
		border-collapse: collapse;
		width: 100%;
		margin: 12px 0;
	}

	th,
	td {
		border: 1px solid #e5e7eb;
		padding: 8px 12px;
		text-align: left;
	}

	th {
		background-color: #f9fafb;
		font-weight: 600;
	}

	hr {
		border: none;
		border-top: 1px solid #e5e7eb;
		margin: 16px 0;
	}

	.math-block {
		overflow-x: auto;
		margin: 12px 0;
		padding: 16px;
		background-color: #f9fafb;
		border-radius: 6px;
		border: 1px solid #e5e7eb;
		box-sizing: border-box;
	}
`;
