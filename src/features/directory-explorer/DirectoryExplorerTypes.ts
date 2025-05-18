/**
 * アイテムの種別を表す型
 */
export type DirectoryItemType = "file" | "folder";

/**
 * 階層構造を構成する要素の型定義
 */
export type DirectoryItem = {
	/** アイテムの一意識別子 */
	id: string;
	/** アイテムの表示名 */
	name: string;
	/** アイテムのパス（/区切りで階層を表現） */
	path: string;
	/** アイテムの種別（"file" または "folder"） */
	type: DirectoryItemType;
};

/**
 * ドラッグアンドドロップ操作の結果を表す型
 * フォルダへのドロップのみサポート（常にフォルダ内部に配置）
 */
export type DropResult = {
	/** ドラッグされたアイテムのID */
	draggedItemId: string;
	/** ドロップ先のフォルダのID */
	targetFolderId: string;
};

/**
 * DirectoryExplorer コンポーネントのプロップス型定義
 */
export type DirectoryExplorerProps = {
	/** 表示する階層構造データ */
	items: DirectoryItem[];
	/** ドラッグ&ドロップで階層構造が変更された時のコールバック */
	onItemsChange?: (items: DirectoryItem[]) => void;
	/** アイテムクリック時のコールバック */
	onItemClick?: (item: DirectoryItem) => void;
};

/**
 * DirectoryNode コンポーネントのプロップス型定義
 */
export type DirectoryNodeProps = {
	/** 表示するノードのアイテム */
	item: DirectoryItem;
	/** すべてのアイテムのリスト */
	allItems: DirectoryItem[];
	/** 展開されたノードのIDセット */
	expandedNodes: Set<string>;
	/** ノード展開状態を切り替える関数 */
	toggleExpand: (id: string) => void;
	/** 階層の深さ（インデント用） */
	level: number;
	/** ドラッグ&ドロップで階層構造が変更された時のコールバック */
	onDrop: (result: DropResult) => void;
	/** アイテムクリック時のコールバック */
	onItemClick?: (item: DirectoryItem) => void;
	/** ドラッグオーバー時のコールバック */
	onDragOver?: (item: DirectoryItem) => void;
	/** ドラッグリーブ時のコールバック */
	onDragLeave?: (item: DirectoryItem) => void;
};
