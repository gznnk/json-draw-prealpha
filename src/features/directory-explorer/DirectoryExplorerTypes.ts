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
	/** ディレクトリか？ */
	isDirectory: boolean;
	/** アイテムの種別 */
	type?: string;
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
	/** 選択されたノードのID */
	selectedNodeId?: string | null;
	/** ドラッグ&ドロップで階層構造が変更された時のコールバック */
	onItemsChange?: (items: DirectoryItem[]) => void;
	/** ノード選択時のコールバック */
	onSelect?: (nodeId: string) => void;
	/** 新しいフォルダを作成する関数 */
	onCreateFolder?: (parentId: string, folderName: string) => void;
	/** 新しいファイルを作成する関数 */
	onCreateFile?: (parentId: string, fileName: string) => void;
	/** ファイルまたはフォルダを削除する関数 */
	onDelete?: (itemId: string) => void;
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
	/** ドラッグオーバー時のコールバック */
	onDragOver?: (item: DirectoryItem) => void;
	/** ドラッグリーブ時のコールバック */
	onDragLeave?: (item: DirectoryItem) => void;
	/** 選択されたノードのID */
	selectedNodeId?: string | null;
	/** アイテム選択時のコールバック */
	onSelect?: (itemId: string) => void;
	/** コンテキストメニュー表示時のコールバック */
	onContextMenu?: (item: DirectoryItem, x: number, y: number) => void;
};

/**
 * コンテキストメニューのプロップス型定義
 */
export type ContextMenuProps = {
	/** コンテキストメニューを表示する位置X */
	x: number;
	/** コンテキストメニューを表示する位置Y */
	y: number;
	/** メニューが表示されているアイテム */
	item: DirectoryItem;
	/** 全てのアイテム */
	allItems: DirectoryItem[];
	/** メニューを閉じる関数 */
	onClose: () => void;
	/** 新しいフォルダを作成する関数 */
	onCreateFolder: (parentId: string, folderName: string) => void;
	/** 新しいファイルを作成する関数 */
	onCreateFile: (parentId: string, fileName: string) => void;
	/** ファイルまたはフォルダを削除する関数 */
	onDelete: (itemId: string) => void;
};

/**
 * コンテキストメニューの位置型定義
 */
export type ContextMenuPosition = {
	x: number;
	y: number;
	visible: boolean;
	item: DirectoryItem | null;
};
