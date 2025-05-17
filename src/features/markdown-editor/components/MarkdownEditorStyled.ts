import styled from "@emotion/styled";
import { MarkdownViewMode } from "../types";

/**
 * マークダウンエディタのメインコンテナスタイル
 */
export const EditorContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 300px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

/**
 * エディタとプレビューの各セクションのスタイル
 */
export const EditorSection = styled.div<{
	viewMode: MarkdownViewMode;
	isEditor: boolean;
}>`
  flex: 1;
  display: ${({ viewMode, isEditor }) => {
		if (viewMode === MarkdownViewMode.SPLIT) return "block";
		if (viewMode === MarkdownViewMode.EDITOR_ONLY && isEditor) return "block";
		if (viewMode === MarkdownViewMode.PREVIEW_ONLY && !isEditor) return "block";
		return "none";
	}};
  height: 100%;
  overflow: auto;
  padding: 16px;
  ${({ isEditor }) =>
		isEditor
			? `
    border-right: 1px solid #e0e0e0;
  `
			: ""}
`;

/**
 * マークダウン入力用のテキストエリアのスタイル
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

  &::placeholder {
    color: #aaa;
  }
`;

/**
 * プレビュー領域のスタイル
 */
export const PreviewArea = styled.div`
  width: 100%;
  height: 100%;
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: break-word;
  
  /* マークダウンレンダリング向けの基本スタイル */
  h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }

  h1 {
    font-size: 2em;
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.3em;
  }

  h2 {
    font-size: 1.5em;
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.3em;
  }

  code {
    font-family: "Consolas", monospace;
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(27, 31, 35, 0.05);
    border-radius: 3px;
  }

  pre {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 3px;
    margin-bottom: 16px;
  }

  blockquote {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
    margin: 0 0 16px 0;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 16px;
  }

  table th, table td {
    padding: 6px 13px;
    border: 1px solid #dfe2e5;
  }

  table tr {
    background-color: #fff;
    border-top: 1px solid #c6cbd1;
  }

  table tr:nth-child(2n) {
    background-color: #f6f8fa;
  }

  img {
    max-width: 100%;
  }

  .math-block {
    overflow-x: auto;
    margin: 16px 0;
  }

  hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: #e1e4e8;
    border: 0;
  }
`;

/**
 * ツールバーのスタイル
 */
export const Toolbar = styled.div`
  display: flex;
  padding: 8px;
  background-color: #f6f8fa;
  border-bottom: 1px solid #e0e0e0;
`;

/**
 * ツールバーボタンのスタイル
 */
export const ToolbarButton = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  margin-right: 8px;
  background-color: ${({ active }) => (active ? "#e0e0e0" : "transparent")};
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  
  &:hover {
    background-color: #e0e0e0;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
  }
`;
