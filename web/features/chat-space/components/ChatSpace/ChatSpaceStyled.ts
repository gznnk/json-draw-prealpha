import styled from "@emotion/styled";

export const ChatSpaceContainer = styled.div<{
	width?: string;
	height?: string;
}>`
	display: flex;
	flex-direction: column;
	flex: 1;
	width: ${({ width }) => width || "100%"};
	height: ${({ height }) => height || "100%"};
	min-height: 0;
	padding: 0;
	gap: 16px;
	border-radius: 0;
	background: #f8fafc;
	box-shadow:
		inset 0 1px 0 rgb(255 255 255 / 0.6),
		0 20px 25px -5px rgb(15 23 42 / 0.08),
		0 10px 10px -5px rgb(15 23 42 / 0.06);
	box-sizing: border-box;
	overflow: hidden;
`;

export const ThreadSearchInput = styled.input`
	box-sizing: border-box;
	display: block;
	flex-shrink: 0;
	border-radius: 9999px;
	border: 1px solid #d1d5db;
	padding: 10px 16px;
	margin: 8px;
	margin-bottom: -6px;
	background: #ffffff;
	color: #111827;
	font-size: 14px;
	transition: all 0.2s ease;

	&::placeholder {
		color: #9ca3af;
	}

	&:focus {
		outline: none;
		border-color: #111827;
		box-shadow: 0 0 0 2px rgb(17 24 39 / 0.15);
	}
`;

export const ThreadList = styled.div`
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 0;
	padding: 0;
	margin: 0 0 16px 0;

	&::-webkit-scrollbar {
		width: 6px;
	}

	&::-webkit-scrollbar-thumb {
		background: rgb(148 163 184 / 0.5);
		border-radius: 9999px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}
`;

export const ThreadsEmptyState = styled.div`
	margin: auto;
	padding: 32px;
	border-radius: 16px;
	border: 1px dashed #d1d5db;
	color: #6b7280;
	text-align: center;
	font-size: 14px;
	background: #ffffff;
`;

export const ThreadListButton = styled.button<{ $active: boolean }>`
	width: 100%;
	border: none;
	border-bottom: 1px solid #e5e7eb;
	background: ${({ $active }) => ($active ? "#f3f4f6" : "transparent")};
	color: #111827;
	padding: 14px 8px;
	padding-right: 16px;
	display: flex;
	flex-direction: column;
	gap: 6px;
	text-align: left;
	cursor: pointer;
	transition:
		border-color 0.2s ease,
		background 0.2s ease,
		color 0.2s ease,
		transform 0.1s ease;

	&:hover {
		background: #f3f4f6;
	}

	&:focus-visible {
		outline: 3px solid rgb(17 24 39 / 0.35);
		outline-offset: 4px;
	}

	&:last-of-type {
		border-bottom: none;
	}

	&:first-of-type {
		border-top: 1px solid #e5e7eb;
	}
`;

export const ThreadListHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
`;

export const ThreadListTitle = styled.span`
	font-size: 14px;
	font-weight: 600;
	color: inherit;
	display: inline-flex;
	align-items: center;
	gap: 6px;
`;

export const ThreadListMeta = styled.span`
	font-size: 12px;
	color: #6b7280;
	white-space: nowrap;
`;

export const ThreadListPreview = styled.span`
	font-size: 13px;
	color: #4b5563;
	line-height: 1.5;
`;

export const ThreadListPreviewRow = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
`;

export const ThreadListPreviewAvatar = styled.div`
	width: 28px;
	height: 28px;
	border-radius: 9999px;
	background: #111827;
	color: #f9fafb;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	font-weight: 600;
`;

export const ThreadListPreviewContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

export const ThreadListPreviewAuthor = styled.span`
	font-size: 13px;
	font-weight: 600;
	color: #111827;
`;

export const ThreadListPreviewMessage = styled.span`
	font-size: 12px;
	color: #4b5563;
	line-height: 1.4;
`;

export const UnreadBadge = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 22px;
	height: 20px;
	padding: 0 8px;
	border-radius: 9999px;
	background-color: #111827;
	color: #f9fafb;
	font-size: 12px;
	font-weight: 700;
`;

export const ConversationPanel = styled.section`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 0;
	border-top: 1px solid #e5e7eb;
`;

export const ConversationHeader = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 8px;
`;

export const ConversationTitleRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	flex-wrap: wrap;
`;

export const ConversationTitle = styled.h3`
	margin: 0;
	font-size: 18px;
	font-weight: 700;
	color: #111827;
`;

export const ConversationMeta = styled.span`
	font-size: 12px;
	color: #6b7280;
`;

export const ConversationDescription = styled.p`
	margin: 0;
	font-size: 13px;
	color: #4b5563;
`;

export const ConversationMessages = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	min-height: 200px;
	max-height: 360px;
	overflow-y: auto;
	padding-right: 4px;

	&::-webkit-scrollbar {
		width: 6px;
	}

	&::-webkit-scrollbar-thumb {
		background: #d1d5db;
		border-radius: 9999px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}
`;

export const MessageRow = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 12px;
	padding: 8px;
	border-bottom: 1px solid #e5e7eb;
`;

export const MessageAvatar = styled.div`
	width: 36px;
	height: 36px;
	border-radius: 9999px;
	background: #111827;
	color: #f9fafb;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 14px;
	font-weight: 600;
`;

export const MessageBody = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

export const MessageHeader = styled.div`
	display: flex;
	align-items: baseline;
	gap: 8px;
`;

export const MessageAuthor = styled.span`
	font-size: 14px;
	font-weight: 600;
	color: #111827;
`;

export const MessageTimestamp = styled.span`
	font-size: 12px;
	color: #9ca3af;
`;

export const MessageContent = styled.div`
	font-size: 14px;
	line-height: 1.7;
	color: #1f2937;
`;

export const ComposerContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	background: #f9fafb;
	padding: 12px;
	border: 1px solid #e5e7eb;
`;

export const ComposerForm = styled.form`
	display: flex;
	align-items: flex-end;
	gap: 12px;
`;

export const ComposerTextarea = styled.textarea`
	flex: 1;
	min-height: 48px;
	max-height: 160px;
	resize: none;
	border-radius: 12px;
	border: 1px solid #d1d5db;
	padding: 12px 14px;
	font-size: 14px;
	line-height: 1.6;
	background: #ffffff;
	color: #111827;
	outline: none;
	transition:
		border-color 0.2s ease,
		box-shadow 0.2s ease;

	&::placeholder {
		color: #9ca3af;
	}

	&:focus {
		border-color: #111827;
		box-shadow: 0 0 0 2px rgb(17 24 39 / 0.15);
	}

	&:disabled {
		background: #f3f4f6;
		color: #9ca3af;
	}
`;

export const SendButton = styled.button`
	border: none;
	border-radius: 12px;
	padding: 10px 16px;
	font-size: 14px;
	font-weight: 600;
	background: #111827;
	color: #f9fafb;
	cursor: pointer;
	min-width: 96px;
	transition:
		transform 0.15s ease,
		box-shadow 0.15s ease,
		filter 0.15s ease;

	&:hover {
		transform: translateY(-1px);
		filter: brightness(1.05);
		box-shadow: 0 10px 20px -12px rgb(17 24 39 / 0.35);
	}

	&:active {
		transform: translateY(0);
		box-shadow: none;
	}

	&:disabled {
		background: #d1d5db;
		color: #6b7280;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}
`;

export const ComposerHint = styled.span`
	font-size: 12px;
	color: #9ca3af;
`;

export const EmptyState = styled.div`
	padding: 24px;
	border-radius: 16px;
	background: #f9fafb;
	border: 1px dashed #d1d5db;
	text-align: center;
	color: #6b7280;
	font-size: 14px;
`;

export const EmptyStateTitle = styled.h4`
	margin: 0 0 6px 0;
	font-size: 16px;
	font-weight: 600;
	color: #111827;
`;

export const EmptyStateDescription = styled.p`
	margin: 0;
	font-size: 13px;
	color: #4b5563;
`;
