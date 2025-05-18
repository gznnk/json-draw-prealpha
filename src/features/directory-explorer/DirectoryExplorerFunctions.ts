import type { DirectoryItem, DropResult } from "./DirectoryExplorerTypes";

/**
 * パスから親パスを取得する
 *
 * @param path - アイテムのパス
 * @returns 親パスまたはルートの場合は空文字列
 */
export const getParentPath = (path: string): string => {
	const lastSlashIndex = path.lastIndexOf("/");
	if (lastSlashIndex === -1) return "";
	return path.substring(0, lastSlashIndex);
};

/**
 * アイテムの直接の子アイテムを取得する
 *
 * @param item - 親アイテム
 * @param allItems - すべてのアイテムの配列
 * @returns 子アイテムの配列
 */
export const getDirectChildren = (
	item: DirectoryItem,
	allItems: DirectoryItem[],
): DirectoryItem[] => {
	// ファイルは子を持たない
	if (item.type === "file") return [];
	const itemPath = item.path;
	return allItems
		.filter((otherItem) => getParentPath(otherItem.path) === itemPath)
		.sort(sortDirectoryItems);
};

/**
 * ルートアイテムを取得する
 *
 * @param items - すべてのアイテムの配列
 * @returns ルートアイテムの配列
 */
export const getRootItems = (items: DirectoryItem[]): DirectoryItem[] => {
	return items.filter((item) => !getParentPath(item.path));
};

/**
 * ドラッグ＆ドロップの結果に基づいて階層構造を更新する
 * フォルダへのドロップのみサポート（常にフォルダ内部に配置）
 *
 * @param items - 現在のアイテム配列
 * @param result - ドロップ結果
 * @returns 更新されたアイテム配列
 */
export const updateItemsAfterDrop = (
	items: DirectoryItem[],
	result: DropResult,
): DirectoryItem[] => {
	const { draggedItemId, targetFolderId } = result;

	// ドラッグ元とドロップ先のアイテムを見つける
	const draggedItem = items.find((item) => item.id === draggedItemId);
	const targetFolder = items.find((item) => item.id === targetFolderId);

	if (!draggedItem || !targetFolder || targetFolder.type !== "folder")
		return items;

	// ドラッグ元のアイテムとその子アイテムをすべて取得
	const draggedItemWithDescendants = getItemWithDescendants(draggedItem, items);
	const draggedItemIds = new Set(
		draggedItemWithDescendants.map((item) => item.id),
	);

	// ドラッグ元のアイテムをリストから除外
	const itemsWithoutDragged = items.filter(
		(item) => !draggedItemIds.has(item.id),
	);

	// 新しいパスの計算（常にフォルダ内部に配置）
	const newDraggedItems = calculateNewPaths(
		draggedItemWithDescendants,
		draggedItem,
		targetFolder,
	);

	// 更新後のアイテムリストを返す
	return [...itemsWithoutDragged, ...newDraggedItems];
};

/**
 * アイテムとその子孫アイテムをすべて取得する
 *
 * @param item - 基点となるアイテム
 * @param allItems - すべてのアイテムの配列
 * @returns アイテムとその子孫アイテムの配列
 */
export const getItemWithDescendants = (
	item: DirectoryItem,
	allItems: DirectoryItem[],
): DirectoryItem[] => {
	const result: DirectoryItem[] = [item];
	const itemPath = item.path;
	// 対象アイテムのパスで始まる他のすべてのアイテムを取得する
	for (const other of allItems) {
		if (other.id !== item.id && other.path.startsWith(`${itemPath}/`)) {
			result.push(other);
		}
	}

	return result;
};

/**
 * ドラッグ＆ドロップ後のアイテムの新しいパスを計算する
 * フォルダ内部への配置のみサポート
 *
 * @param items - 更新対象のアイテム配列
 * @param draggedItem - ドラッグ元のアイテム
 * @param targetFolder - ドロップ先のフォルダ
 * @returns 更新されたアイテム配列
 */
export const calculateNewPaths = (
	items: DirectoryItem[],
	draggedItem: DirectoryItem,
	targetFolder: DirectoryItem,
): DirectoryItem[] => {
	const oldBasePath = draggedItem.path;
	let newBasePath: string;

	// フォルダ内部へドロップ - ターゲットフォルダのパスが空文字列の場合はルートフォルダ
	const targetPath = targetFolder.path || "";
	newBasePath = targetPath
		? `${targetPath}/${draggedItem.name}`
		: draggedItem.name;

	// 同名のアイテムが存在する場合、名前を変更（例：name(1)）
	const existingItemsInFolder = items.filter(
		(item) =>
			getParentPath(item.path) === targetPath && item.id !== draggedItem.id,
	);

	let counter = 1;
	const baseName = draggedItem.name;
	let newName = baseName;

	while (existingItemsInFolder.some((item) => item.name === newName)) {
		newName = `${baseName}(${counter})`;
		counter++;
	}

	// 名前が変更された場合は新しいパスを更新
	if (newName !== baseName) {
		newBasePath = targetPath ? `${targetPath}/${newName}` : newName;
	}
	// 各アイテムのパスを更新
	return items.map((item) => {
		if (item.id === draggedItem.id) {
			// ドラッグしたアイテム自身のパスと名前を更新
			const newName = newBasePath.split("/").pop() || item.name;
			return { ...item, path: newBasePath, name: newName };
		}

		// 子孫アイテムのパスも更新
		if (item.path.startsWith(`${oldBasePath}/`)) {
			const relativePath = item.path.substring(oldBasePath.length);
			return { ...item, path: `${newBasePath}${relativePath}` };
		}

		return item;
	});
};

/**
 * ディレクトリアイテムを並べ替える比較関数
 * フォルダが先、ファイルが後、同じ種類内ではアルファベット順
 *
 * @param a - 比較対象のアイテム1
 * @param b - 比較対象のアイテム2
 * @returns 並べ替え用の数値
 */
export const sortDirectoryItems = (
	a: DirectoryItem,
	b: DirectoryItem,
): number => {
	// フォルダを先に表示
	if (a.type !== b.type) {
		return a.type === "folder" ? -1 : 1;
	}

	// 同じ種類内では名前でソート
	return a.name.localeCompare(b.name);
};
