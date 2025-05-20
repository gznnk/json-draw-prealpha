import styled from "@emotion/styled";
import { LEVEL_INDENT_WIDTH } from "./DirectoryExplorerConstants";

/**
 * エクスプローラーのルートコンテナ
 */
export const DirectoryExplorerContainer = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-size: 14px;
  width: 100%;
  height: 100%;
  overflow: auto;
  user-select: none;
  padding: 4px 0;
  box-sizing: border-box;
  background-color: #0C0F1C;
  color: #B0B0B0;
`;

/**
 * ディレクトリノード全体を包むコンテナ
 */
export const NodeContainer = styled.div<{
	isOver?: boolean;
	isDragging?: boolean;
	isFolder?: boolean;
}>`
  display: flex;
  flex-direction: column;
  opacity: ${(props) => (props.isDragging ? 0.5 : 1)};
  background-color: ${(props) => {
		// フォルダ内の子要素は薄い色のハイライト
		if (props.isOver) {
			return "rgba(79, 156, 231, 0.2)";
		}

		return "transparent";
	}};
`;

/**
 * ディレクトリノードの行コンテナ
 */
export const NodeRow = styled.div<{
	level: number;
	isSelected?: boolean;
}>`
  display: flex;
  align-items: center;
  padding: 2px 0;
  padding-left: ${(props) => props.level * LEVEL_INDENT_WIDTH}px;
  cursor: pointer;
  position: relative;
  background-color: ${(props) => (props.isSelected ? "#2b579a" : "transparent")};
  color: ${(props) =>
		props.isSelected
			? "var(--list-active-selection-foreground, #ffffff)"
			: "inherit"};
`;

/**
 * 展開アイコンのコンテナ
 */
export const ExpandIconContainer = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  font-size: 12px;
`;

/**
 * アイテムアイコンのコンテナ
 */
export const ItemIconContainer = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 4px;
`;

/**
 * コンテキストメニューのコンテナ
 */
export const ContextMenuContainer = styled.div`
  position: fixed;
  z-index: 1000;
  background-color: #1A1F33;
  border: 1px solid #2A2F4C;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  min-width: 150px;
  overflow: hidden;
`;

/**
 * コンテキストメニューの項目
 */
export const ContextMenuItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  color: #C0C4D2;
  
  &:hover {
    background-color: #2A2F4C;
  }
`;

/**
 * コンテキストメニューのセパレーター
 */
export const ContextMenuSeparator = styled.div`
  height: 1px;
  background-color: #2A2F4C;
  margin: 4px 0;
`;
