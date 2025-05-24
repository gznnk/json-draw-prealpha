import { memo, useState, useCallback } from "react";
import { DirectoryExplorer, type DirectoryItem } from "../directory-explorer";

// サンプルのディレクトリ構造データ
const sampleData: DirectoryItem[] = [
	// ルート階層（順序がランダム）
	{ id: "1", name: "Cフォルダ", path: "C-folder", isDirectory: true },
	{
		id: "2",
		name: "Bファイル",
		path: "B-file",
		isDirectory: false,
		isEditing: true,
	},
	{ id: "3", name: "Aフォルダ", path: "A-folder", isDirectory: true },
	{ id: "4", name: "Dファイル", path: "D-file", isDirectory: false },
	// Aフォルダの中身
	{ id: "5", name: "Zファイル", path: "A-folder/Z-file", isDirectory: false },
	{
		id: "6",
		name: "Xサブフォルダ",
		path: "A-folder/X-subfolder",
		isDirectory: true,
		isEditing: true,
	},
	{ id: "7", name: "Yファイル", path: "A-folder/Y-file", isDirectory: false },

	// Xサブフォルダの中身
	{
		id: "8",
		name: "3番目",
		path: "A-folder/X-subfolder/3-file",
		isDirectory: false,
	},
	{
		id: "9",
		name: "1番目",
		path: "A-folder/X-subfolder/1-file",
		isDirectory: false,
	},
	{
		id: "10",
		name: "2番目",
		path: "A-folder/X-subfolder/2-file",
		isDirectory: false,
	},

	// Cフォルダの中身
	{
		id: "11",
		name: "Cの中のファイル",
		path: "C-folder/C-file",
		isDirectory: false,
	},
	{
		id: "12",
		name: "Cの中のフォルダ",
		path: "C-folder/C-subfolder",
		isDirectory: true,
	},
];

/**
 * DirectoryExplorerコンポーネントのデモ表示用コンポーネント
 */
const DirectoryExplorerDemoComponent = () => {
	const [items, setItems] = useState<DirectoryItem[]>(sampleData);

	const handleItemsChange = useCallback((newItems: DirectoryItem[]) => {
		console.log(newItems);
		setItems(newItems);
	}, []);

	return <DirectoryExplorer items={items} onItemsChange={handleItemsChange} />;
};

export const DirectoryExplorerDemo = memo(DirectoryExplorerDemoComponent);
