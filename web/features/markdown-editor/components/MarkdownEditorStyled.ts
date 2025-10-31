import styled from "@emotion/styled";

/**
 * マークダウンエディタのメインコンテナスタイル
 * ChatUIStyled.tsと合わせたダークテーマスタイル
 */
export const EditorContainer = styled.div`
	display: flex;
	width: 100%;
	height: 100%;
	min-height: 300px;
	box-sizing: border-box;
	border: 1px solid #2a2f4c;
	border-radius: 4px;
	overflow: hidden;
	background-color: #0c0f1c;
`;

/**
 * マークダウン入力用のテキストエリアのスタイル
 * ChatUIStyled.tsと合わせたダークテーマスタイル
 */
export const MarkdownTextarea = styled.textarea`
	flex: 1;
	width: 100%;
	height: 100%;
	padding: 1em 1em;
	box-sizing: border-box;
	resize: none;
	border: none;
	outline: none;
	font-family: "Consolas", monospace;
	font-size: 14px;
	line-height: 1.6;
	background-color: #0c0f1c;
	color: #b0b0b0;
	caret-color: #b0b0b0;

	&::placeholder {
		color: #666b82;
	}
`;

/**
 * プレビュー領域のスタイル
 * ChatUIStyled.tsの配色に合わせたダークテーマスタイル
 */
export const PreviewArea = styled.div`
	flex: 1;
	width: 100%;
	height: 100%;
	overflow: auto;
	padding: 0 1em;
	box-sizing: border-box;
	font-size: 14px;
	line-height: 1.6;
	overflow-wrap: break-word;
	background-color: #0c0f1c;
	color: #b0b0b0;
	&:not(:first-of-type) {
		border-left: 1px solid #2a2f4c;
	}

	/* マークダウンレンダリング向けの基本スタイル */
	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		margin-top: 24px;
		margin-bottom: 16px;
		font-weight: 600;
		line-height: 1.25;
		color: #d8d8d8;
	}

	h1 {
		font-size: 2em;
		border-bottom: 1px solid #2a2f4c;
		padding-bottom: 0.3em;
	}

	h2 {
		font-size: 1.5em;
		border-bottom: 1px solid #2a2f4c;
		padding-bottom: 0.3em;
	}
	code {
		font-family: "Consolas", monospace;
		padding: 0.2em 0.4em;
		margin: 0;
		font-size: 0.9em;
		background-color: #1a1e2e;
		color: #b0b0b0;
		border-radius: 3px;
	}

	pre {
		padding: 16px;
		overflow: auto;
		line-height: 1.45;
		background-color: #1a1e2e;
		border-radius: 3px;
		margin-bottom: 16px;
		border: 1px solid #2a2f4c;
	}

	blockquote {
		padding: 0 1em;
		color: #8b8fa3;
		border-left: 0.25em solid #2a2f4c;
		margin: 0 0 16px 0;
	}
	table {
		border-collapse: collapse;
		width: 100%;
		margin-bottom: 16px;
	}

	table th,
	table td {
		padding: 6px 13px;
		border: 1px solid #2a2f4c;
	}

	table th {
		background-color: #1a1e2e;
		color: #d8d8d8;
	}

	table tr {
		background-color: #0c0f1c;
		border-top: 1px solid #2a2f4c;
	}

	table tr:nth-of-type(2n) {
		background-color: #151825;
	}

	img {
		max-width: 100%;
	}

	a {
		color: #5e8af7;
		text-decoration: none;

		&:hover {
			text-decoration: underline;
		}
	}

	.math-block {
		overflow-x: auto;
		margin: 16px 0;
	}

	hr {
		height: 0.25em;
		padding: 0;
		margin: 24px 0;
		background-color: #2a2f4c;
		border: 0;
	}
`;

/**
 * ツールバーのスタイル
 * ChatUIStyled.tsと合わせたダークテーマスタイル
 */
export const Toolbar = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 8px;
	background-color: #0c0f1c;
`;

/**
 * ツールバー左側のスタイル（タイトル入力欄用）
 */
export const ToolbarLeft = styled.div`
	display: flex;
	flex: 1;
	padding-right: 8px;
`;

/**
 * ツールバー右側のスタイル（ボタン用）
 */
export const ToolbarRight = styled.div`
	display: flex;
`;

/**
 * タイトル入力欄のスタイル
 */
export const TitleInput = styled.input`
	flex: 1;
	padding: 6px 12px;
	border: 1px solid #3a4160;
	border-radius: 4px;
	background-color: #1a1f33;
	color: #c0c4d2;
	font-size: 14px;
	outline: none;

	&::placeholder {
		color: #666b82;
	}

	&:focus {
		border-color: #3a79b8;
		box-shadow: 0 0 0 2px rgba(58, 121, 184, 0.2);
	}
`;

/**
 * ツールバーボタンのスタイル
 * ChatUIStyled.tsと合わせたダークテーマスタイル
 */
export const ToolbarButton = styled.button<{ active?: boolean }>`
	padding: 6px 12px;
	margin-right: 8px;
	background-color: ${({ active }) => (active ? "#2A2F4C" : "transparent")};
	border: 1px solid #3a4160;
	border-radius: 4px;
	cursor: pointer;
	font-size: 13px;
	color: #b0b0b0;

	&:hover {
		background-color: #1a1e2e;
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(66, 83, 225, 0.5);
	}
`;

/**
 * エディタ全体のラッパー要素のスタイル
 */
export const EditorWrapper = styled.div<{ minHeight?: string | number }>`
	display: flex;
	box-sizing: border-box;
	flex-direction: column;
	height: 100%;
	min-height: ${({ minHeight }) =>
		typeof minHeight === "number" ? `${minHeight}px` : minHeight || "auto"};
`;
