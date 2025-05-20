/**
 * ドラッグ&ドロップ用のアイテムタイプ
 */
export const DIRECTORY_ITEM_TYPE = "DIRECTORY_ITEM";

/**
 * アイテム間の垂直方向のパディング（px）
 */
export const ITEM_VERTICAL_PADDING = 2;

/**
 * 階層レベルごとのインデント幅（px）
 */
export const LEVEL_INDENT_WIDTH = 20;

/**
 * コンテキストメニューの操作種別
 */
export enum ContextMenuActionType {
	CREATE_FOLDER = "CREATE_FOLDER",
	CREATE_FILE = "CREATE_FILE",
	DELETE = "DELETE",
}
