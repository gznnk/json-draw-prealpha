import { memo, useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type {
	DirectoryExplorerProps,
	DropResult,
} from "./DirectoryExplorerTypes";
import { DirectoryExplorerContainer } from "./DirectoryExplorerStyled";
import { DirectoryNode } from "./DirectoryNode";
import {
	getRootItems,
	updateItemsAfterDrop,
	sortDirectoryItems,
} from "./DirectoryExplorerFunctions";

/**
 * VSCodeのエクスプローラーのような階層構造を表示するコンポーネント
 * DnDによる階層変更機能と、展開/非展開機能を提供する
 */
const DirectoryExplorerComponent = ({
	items,
	onItemsChange,
	onItemClick,
}: DirectoryExplorerProps) => {
	// 展開されたノードのIDを管理
	const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

	// ノードの展開/非展開を切り替える
	const toggleExpand = useCallback((id: string) => {
		setExpandedNodes((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

	// ドロップ時の処理
	const handleDrop = useCallback(
		(result: DropResult) => {
			if (onItemsChange) {
				// ドロップ結果を処理
				const updatedItems = updateItemsAfterDrop(items, result);
				onItemsChange(updatedItems);
			}
		},
		[items, onItemsChange],
	);

	// ルートレベルのアイテムを取得し、ソート
	const rootItems = getRootItems(items).sort(sortDirectoryItems);

	return (
		<DndProvider backend={HTML5Backend}>
			<DirectoryExplorerContainer>
				{rootItems.map((item) => (
					<DirectoryNode
						key={item.id}
						item={item}
						allItems={items}
						expandedNodes={expandedNodes}
						toggleExpand={toggleExpand}
						level={0}
						onDrop={handleDrop}
						onItemClick={onItemClick}
					/>
				))}
			</DirectoryExplorerContainer>
		</DndProvider>
	);
};

export const DirectoryExplorer = memo(DirectoryExplorerComponent);
