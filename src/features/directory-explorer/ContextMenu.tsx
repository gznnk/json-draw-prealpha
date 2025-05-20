import { memo, useEffect, useRef, useState } from "react";
import type { ContextMenuProps, DirectoryItem } from "./DirectoryExplorerTypes";
import { ContextMenuActionType } from "./DirectoryExplorerConstants";
import {
	ContextMenuContainer,
	ContextMenuItem,
	ContextMenuSeparator,
} from "./DirectoryExplorerStyled";

/**
 * コンテキストメニューコンポーネント
 * ファイル操作のためのメニューを表示する
 */
const ContextMenuComponent = ({
	x,
	y,
	item,
	allItems,
	onClose,
	onCreateFolder,
	onCreateFile,
	onDelete,
}: ContextMenuProps) => {
	const [action, setAction] = useState<string | null>(null);
	const [inputValue, setInputValue] = useState("");
	const menuRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// コンポーネントがマウントされたときにクリックイベントリスナーを追加
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		// ESCキーでメニューを閉じる
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [onClose]);

	// 入力フィールドが表示されたら自動フォーカス
	useEffect(() => {
		if (action && inputRef.current) {
			inputRef.current.focus();
		}
	}, [action]);

	// 親フォルダのIDを取得（ファイルの場合は親フォルダ、フォルダの場合は自身）
	const getParentId = () => {
		return item.isDirectory ? item.id : findParentFolderId(item, allItems);
	};
	// ファイルの親フォルダIDを探す
	const findParentFolderId = (
		file: DirectoryItem,
		items: DirectoryItem[],
	): string => {
		const parentPath = file.path.substring(0, file.path.lastIndexOf("/"));
		const parentFolder = items.find(
			(i) => i.isDirectory && i.path === parentPath,
		);
		return parentFolder ? parentFolder.id : "";
	};

	// フォルダ作成アクション
	const handleCreateFolder = () => {
		setAction(ContextMenuActionType.CREATE_FOLDER);
		setInputValue("");
	};

	// ファイル作成アクション
	const handleCreateFile = () => {
		setAction(ContextMenuActionType.CREATE_FILE);
		setInputValue("");
	};

	// 削除アクション
	const handleDelete = () => {
		const confirmMessage = item.isDirectory
			? `フォルダ「${item.name}」とその中身を削除しますか？`
			: `ファイル「${item.name}」を削除しますか？`;

		if (window.confirm(confirmMessage)) {
			onDelete(item.id);
		}
		onClose();
	};

	// フォーム送信ハンドラ
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputValue.trim()) return;

		const parentId = getParentId();

		if (action === ContextMenuActionType.CREATE_FOLDER) {
			onCreateFolder(parentId, inputValue.trim());
		} else if (action === ContextMenuActionType.CREATE_FILE) {
			onCreateFile(parentId, inputValue.trim());
		}

		onClose();
	};

	// キャンセル処理
	const handleCancel = () => {
		setAction(null);
	};

	// メニュー項目が選択状態のとき
	if (action) {
		const actionText =
			action === ContextMenuActionType.CREATE_FOLDER
				? "フォルダ名を入力"
				: "ファイル名を入力";

		return (
			<ContextMenuContainer
				ref={menuRef}
				style={{ left: x, top: y, padding: "10px" }}
			>
				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: "10px" }}>{actionText}:</div>
					<input
						ref={inputRef}
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						style={{
							width: "100%",
							padding: "5px",
							backgroundColor: "#0C0F1C",
							color: "#C0C4D2",
							border: "1px solid #2A2F4C",
							borderRadius: "3px",
							marginBottom: "10px",
						}}
					/>
					<div
						style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
					>
						<button
							type="button"
							onClick={handleCancel}
							style={{
								background: "transparent",
								color: "#C0C4D2",
								border: "1px solid #2A2F4C",
								padding: "3px 10px",
								borderRadius: "3px",
								cursor: "pointer",
							}}
						>
							キャンセル
						</button>
						<button
							type="submit"
							style={{
								background: "#3A79B8",
								color: "#FFFFFF",
								border: "none",
								padding: "3px 10px",
								borderRadius: "3px",
								cursor: "pointer",
							}}
						>
							作成
						</button>
					</div>
				</form>
			</ContextMenuContainer>
		);
	}

	return (
		<ContextMenuContainer ref={menuRef} style={{ left: x, top: y }}>
			{item.isDirectory && (
				<>
					<ContextMenuItem onClick={handleCreateFolder}>
						新しいフォルダ
					</ContextMenuItem>
					<ContextMenuItem onClick={handleCreateFile}>
						新しいファイル
					</ContextMenuItem>
					<ContextMenuSeparator />
				</>
			)}
			<ContextMenuItem onClick={handleDelete}>
				{item.isDirectory ? "フォルダを削除" : "ファイルを削除"}
			</ContextMenuItem>
		</ContextMenuContainer>
	);
};

export const ContextMenu = memo(ContextMenuComponent);
