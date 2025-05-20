import { memo, useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type {
	DirectoryExplorerProps,
	DropResult,
	DirectoryItem,
	ContextMenuPosition,
} from "./DirectoryExplorerTypes";
import { DirectoryExplorerContainer } from "./DirectoryExplorerStyled";
import { DirectoryNode } from "./DirectoryNode";
import { ContextMenu } from "./ContextMenu";
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
	selectedNodeId,
	onItemsChange,
	onSelect,
	onCreateFolder,
	onCreateFile,
	onDelete,
}: DirectoryExplorerProps) => {
	// 展開されたノードのIDを管理
	const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
	// コンテキストメニューの状態
	const [contextMenu, setContextMenu] = useState<ContextMenuPosition>({
		x: 0,
		y: 0,
		visible: false,
		item: null,
	});

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

	// コンテキストメニューを表示
	const handleContextMenu = useCallback(
		(item: DirectoryItem, x: number, y: number) => {
			setContextMenu({
				x,
				y,
				visible: true,
				item,
			});
		},
		[],
	);

	// コンテキストメニューを閉じる
	const handleCloseContextMenu = useCallback(() => {
		setContextMenu((prev) => ({ ...prev, visible: false }));
	}, []);

	// フォルダ作成処理
	const handleCreateFolder = useCallback(
		(parentId: string, folderName: string) => {
			if (onCreateFolder) {
				onCreateFolder(parentId, folderName);
			}
		},
		[onCreateFolder],
	);

	// ファイル作成処理
	const handleCreateFile = useCallback(
		(parentId: string, fileName: string) => {
			if (onCreateFile) {
				onCreateFile(parentId, fileName);
			}
		},
		[onCreateFile],
	);

	// 削除処理
	const handleDelete = useCallback(
		(itemId: string) => {
			if (onDelete) {
				onDelete(itemId);
			}
		},
		[onDelete],
	);

	// ルートレベルのアイテムを取得し、ソート
	const rootItems = getRootItems(items).sort(sortDirectoryItems);
	// アイテム選択時の処理
	const handleSelect = useCallback(
		(itemId: string) => {
			if (onSelect) {
				onSelect(itemId);
			}
		},
		[onSelect],
	);
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
						selectedNodeId={selectedNodeId}
						onSelect={handleSelect}
						onContextMenu={handleContextMenu}
					/>
				))}
				{contextMenu.visible && contextMenu.item && (
					<ContextMenu
						x={contextMenu.x}
						y={contextMenu.y}
						item={contextMenu.item}
						allItems={items}
						onClose={handleCloseContextMenu}
						onCreateFolder={handleCreateFolder}
						onCreateFile={handleCreateFile}
						onDelete={handleDelete}
					/>
				)}
			</DirectoryExplorerContainer>
		</DndProvider>
	);
};

export const DirectoryExplorer = memo(DirectoryExplorerComponent);
