import styled from "@emotion/styled";

/**
 * マークダウンエディタのメインコンテナスタイル
 * ChatUIStyled.tsと合わせたダークテーマスタイル
 */
export const EditorContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex: 1; /* 親要素の高さを継承するために追加 */
  min-height: 300px;
  border: 1px solid #2A2F4C;
  border-radius: 4px;
  overflow: hidden;
  background-color: #0C0F1C;
`;

/**
 * エディタとプレビューの各セクションのスタイル
 * ChatUIStyled.tsと合わせたダークテーマスタイル
 */
export const EditorSection = styled.div<{ isEditor: boolean }>`
  flex: 1;
  height: 100%;
  overflow: auto;
  background-color: #0C0F1C;
  ${({ isEditor }) =>
		isEditor
			? `
    border-right: 1px solid #2A2F4C;
  `
			: ""}
`;

/**
 * マークダウン入力用のテキストエリアのスタイル
 * ChatUIStyled.tsと合わせたダークテーマスタイル
 */
export const MarkdownTextarea = styled.textarea`
  width: 100%;
  height: 100%;
  min-height: inherit;
  resize: none;
  border: none;
  outline: none;
  font-family: "Consolas", monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 0;
  background-color: #0C0F1C;
  color: #B0B0B0;
  caret-color: #B0B0B0;

  &::placeholder {
    color: #666B82;
  }
`;

/**
 * プレビュー領域のスタイル
 * ChatUIStyled.tsの配色に合わせたダークテーマスタイル
 */
export const PreviewArea = styled.div`
  width: 100%;
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: break-word;
  overflow: auto;
  background-color: #0C0F1C;
  color: #B0B0B0;
  /* マークダウンレンダリング向けの基本スタイル */
  h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
    color: #D8D8D8;
  }

  h1 {
    font-size: 2em;
    border-bottom: 1px solid #2A2F4C;
    padding-bottom: 0.3em;
  }

  h2 {
    font-size: 1.5em;
    border-bottom: 1px solid #2A2F4C;
    padding-bottom: 0.3em;
  }
  code {
    font-family: "Consolas", monospace;
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 0.9em;
    background-color: #1A1E2E;
    color: #B0B0B0;
    border-radius: 3px;
  }

  pre {
    padding: 16px;
    overflow: auto;
    line-height: 1.45;
    background-color: #1A1E2E;
    border-radius: 3px;
    margin-bottom: 16px;
    border: 1px solid #2A2F4C;
  }

  blockquote {
    padding: 0 1em;
    color: #8B8FA3;
    border-left: 0.25em solid #2A2F4C;
    margin: 0 0 16px 0;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 16px;
  }

  table th, table td {
    padding: 6px 13px;
    border: 1px solid #2A2F4C;
  }

  table th {
    background-color: #1A1E2E;
    color: #D8D8D8;
  }

  table tr {
    background-color: #0C0F1C;
    border-top: 1px solid #2A2F4C;
  }

  table tr:nth-of-type(2n) {
    background-color: #151825;
  }

  img {
    max-width: 100%;
  }

  a {
    color: #5E8AF7;
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
    background-color: #2A2F4C;
    border: 0;
  }
`;

/**
 * ツールバーのスタイル
 * ChatUIStyled.tsと合わせたダークテーマスタイル
 */
export const Toolbar = styled.div`
  display: flex;
  padding: 8px;
  background-color: #0C0F1C;
`;

/**
 * ツールバーボタンのスタイル
 * ChatUIStyled.tsと合わせたダークテーマスタイル
 */
export const ToolbarButton = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  margin-right: 8px;
  background-color: ${({ active }) => (active ? "#2A2F4C" : "transparent")};
  border: 1px solid #3A4160;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #B0B0B0;
  
  &:hover {
    background-color: #1A1E2E;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(66, 83, 225, 0.5);
  }
`;
