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
`;

/**
 * ディレクトリノード全体を包むコンテナ
 */
export const NodeContainer = styled.div<{
	isOver?: boolean;
	isOverShallow?: boolean;
	canDrop?: boolean;
	isDragging?: boolean;
	isSelected?: boolean;
	isFolder?: boolean;
}>`
  display: flex;
  flex-direction: column;  opacity: ${(props) => (props.isDragging ? 0.5 : 1)};
  background-color: ${(props) => {
		if (props.isSelected) {
			return "var(--list-active-selection-background, #2b579a)";
		}

		// 直接ホバーされているフォルダの場合は濃い色のハイライト
		if (props.isOverShallow && props.canDrop && props.isFolder) {
			return "var(--drop-background, rgba(79, 156, 231, 0.3))";
		}

		// フォルダ内の子要素は薄い色のハイライト
		if (props.isOver && props.canDrop && !props.isOverShallow) {
			return "var(--drop-background-child, rgba(79, 156, 231, 0.1))";
		}

		return "transparent";
	}};
  color: ${(props) =>
		props.isSelected
			? "var(--list-active-selection-foreground, #ffffff)"
			: "inherit"};
`;

/**
 * ディレクトリノードの行コンテナ
 */
export const NodeRow = styled.div<{
	level: number;
	isDropTarget?: boolean;
}>`
  display: flex;
  align-items: center;
  padding: 2px 0;
  padding-left: ${(props) => props.level * LEVEL_INDENT_WIDTH}px;
  cursor: pointer;
  position: relative;
    &:hover:not(:has(.drag-over)) {
    background-color: var(--list-hover-background, rgba(255, 255, 255, 0.05));
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${(props) =>
			props.isDropTarget
				? "var(--drop-background-folder, rgba(79, 156, 231, 0.4))"
				: "transparent"};
    pointer-events: none;
  }
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
