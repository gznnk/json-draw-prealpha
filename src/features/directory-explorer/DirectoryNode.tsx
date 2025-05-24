import { memo, useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import type {
	DirectoryNodeProps,
	DropResult,
	DirectoryItem,
} from "./DirectoryExplorerTypes";
import { DIRECTORY_ITEM_TYPE } from "./DirectoryExplorerConstants";
import {
	NodeContainer,
	NodeRow,
	ExpandIconContainer,
	ItemIconContainer,
	EditingIconContainer,
} from "./DirectoryExplorerStyled";
import { getDirectChildren, getParentPath } from "./DirectoryExplorerFunctions";

/**
 * ディレクトリツリーの個々のノードを表示するコンポーネント
 * 展開/非展開の状態管理と子要素の表示を担当
 */
const DirectoryNodeComponent = ({
	item,
	allItems,
	expandedNodes,
	toggleExpand,
	level,
	onDrop,
	onDragOver,
	onDragLeave,
	selectedNodeId,
	onSelect,
	onContextMenu,
	className,
}: DirectoryNodeProps) => {
	const [dragOverNodeList, setDragOverNodeList] = useState<string[]>([]);
	const ref = useRef<HTMLDivElement>(null);
	const isExpanded = expandedNodes.has(item.id);
	const children = getDirectChildren(item, allItems);
	const isSelected = selectedNodeId === item.id;

	// アイテムのドラッグ設定
	const [{ isDragging }, drag] = useDrag({
		type: DIRECTORY_ITEM_TYPE,
		item: () => ({ id: item.id }),
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging(),
		}),
	});

	// ドロップ対象の状態を追跡
	const [{ isOverShallow, canDrop }, drop] = useDrop({
		accept: DIRECTORY_ITEM_TYPE,
		canDrop: (draggedItem: { id: string }) => {
			// 自分自身へのドロップは許可しない
			if (draggedItem.id === item.id) return false;

			// 子孫へのドロップも許可しない（循環参照防止）
			const draggedItemObj = allItems.find((i) => i.id === draggedItem.id);
			if (!draggedItemObj) return false;

			// 同じフォルダ内へのドロップは許可しない
			if (
				!item.isDirectory &&
				getParentPath(draggedItemObj.path) === getParentPath(item.path)
			) {
				return false;
			}
			if (
				item.isDirectory &&
				getParentPath(draggedItemObj.path) === item.path
			) {
				return false;
			}

			// ドラッグしているアイテムが現在のアイテムの親か確認
			return !item.path.startsWith(`${draggedItemObj.path}/`);
		},
		drop: (draggedItem: { id: string }, monitor) => {
			// モニターがドロップを受け取ったアイテムが自分自身かどうかを確認
			// これにより、バブリングによる親コンポーネントでの処理を防止する
			if (!monitor.isOver({ shallow: true })) {
				return;
			}

			let targetId = item.id;

			// ファイルにドロップされた場合は、そのファイルの親フォルダにドロップする
			if (!item.isDirectory) {
				// 親フォルダのパスを取得
				const parentPath = item.path.substring(0, item.path.lastIndexOf("/"));

				// 親フォルダのIDを探す
				const parentFolder = allItems.find(
					(folder) => folder.isDirectory && folder.path === parentPath,
				);

				// 親フォルダが見つかった場合は、そのIDを使用
				if (parentFolder) {
					targetId = parentFolder.id;
				} else {
					// 親フォルダが見つからない場合は処理を中断
					return;
				}
			} else if (item.isDirectory) {
				// フォルダが展開されていない場合は直接展開する
				if (!isExpanded) {
					toggleExpand(item.id);
				}
			}

			// ドロップ処理実行
			const result: DropResult = {
				draggedItemId: draggedItem.id,
				targetFolderId: targetId,
			};
			onDrop(result);

			// イベントが親に伝播しないようにする
			return { dropEffect: "move" };
		},
		collect: (monitor) => ({
			isOverShallow: !!monitor.isOver({ shallow: true }),
			canDrop: !!monitor.canDrop(),
		}),
	});

	// ドラッグ＆ドロップの参照を結合
	drag(drop(ref));
	// アイテムのクリックハンドラー
	const handleClick = () => {
		// フォルダの場合は、子要素の有無にかかわらず展開/折りたたみを切り替える
		if (item.isDirectory) {
			toggleExpand(item.id);
		}

		// 選択イベントの発火
		if (onSelect) {
			onSelect(item.id);
		}
	};

	useEffect(() => {
		if (!item.isDirectory) {
			if (onDragOver && isOverShallow) {
				onDragOver(item);
			}
			if (onDragLeave && !isOverShallow) {
				onDragLeave(item);
			}
		}
	}, [item, isOverShallow, onDragOver, onDragLeave]);

	// ドラッグオーバー時の処理
	const handleFileDragOver = (file: DirectoryItem) => {
		setDragOverNodeList((prev) => {
			if (prev.includes(file.id)) {
				return prev;
			}
			return [...prev, file.id];
		});
	};

	// ドラッグリーブ時の処理
	const handleFileDragLeave = (file: DirectoryItem) => {
		setDragOverNodeList((prev) => {
			if (prev.includes(file.id)) {
				return prev.filter((id) => id !== file.id);
			}
			return prev;
		});
	};
	return (
		<NodeContainer
			ref={ref}
			isDragging={isDragging}
			isOver={
				canDrop &&
				((item.isDirectory && isOverShallow) || dragOverNodeList.length > 0)
			}
			isFolder={item.isDirectory}
			className={className}
		>
			{" "}
			<NodeRow
				level={level}
				onClick={handleClick}
				isSelected={isSelected}
				onContextMenu={(e) => {
					e.preventDefault();
					if (onContextMenu) {
						onContextMenu(item, e.clientX, e.clientY);
					}
				}}
			>
				{/* 展開/非展開アイコン */}
				<ExpandIconContainer>
					{item.isDirectory ? (
						isExpanded ? (
							"▾"
						) : (
							"▸"
						)
					) : (
						<span style={{ width: "16px" }} />
					)}
				</ExpandIconContainer>
				{/* アイテムアイコン（フォルダかファイル） */}
				<ItemIconContainer>{item.isDirectory ? "📁" : "📄"}</ItemIconContainer>
				{/* アイテム名 */}
				<span>{item.name}</span>
				{/* 編集中アイコン */}
				{item.isEditing && (
					<EditingIconContainer>
						<div></div>
					</EditingIconContainer>
				)}
			</NodeRow>
			{/* 子ノードの表示（展開時のみ） */}
			{isExpanded &&
				children.map((child) => (
					<DirectoryNode
						key={child.id}
						item={child}
						allItems={allItems}
						expandedNodes={expandedNodes}
						toggleExpand={toggleExpand}
						level={level + 1}
						onDrop={onDrop}
						onDragOver={handleFileDragOver}
						onDragLeave={handleFileDragLeave}
						selectedNodeId={selectedNodeId}
						onSelect={onSelect}
						onContextMenu={onContextMenu}
						className="directory-node"
					/>
				))}
		</NodeContainer>
	);
};

export const DirectoryNode = memo(DirectoryNodeComponent);
