import { memo, useState, useCallback } from "react";
import { DirectoryExplorer, type DirectoryItem } from "../directory-explorer";

// サンプルのディレクトリ構造データ
const sampleData: DirectoryItem[] = [
	// ルート階層（順序がランダム）
	{ id: "1", name: "Cフォルダ", path: "C-folder", type: "folder" },
	{ id: "2", name: "Bファイル", path: "B-file", type: "file" },
	{ id: "3", name: "Aフォルダ", path: "A-folder", type: "folder" },
	{ id: "4", name: "Dファイル", path: "D-file", type: "file" },

	// Aフォルダの中身
	{ id: "5", name: "Zファイル", path: "A-folder/Z-file", type: "file" },
	{
		id: "6",
		name: "Xサブフォルダ",
		path: "A-folder/X-subfolder",
		type: "folder",
	},
	{ id: "7", name: "Yファイル", path: "A-folder/Y-file", type: "file" },

	// Xサブフォルダの中身
	{ id: "8", name: "3番目", path: "A-folder/X-subfolder/3-file", type: "file" },
	{ id: "9", name: "1番目", path: "A-folder/X-subfolder/1-file", type: "file" },
	{
		id: "10",
		name: "2番目",
		path: "A-folder/X-subfolder/2-file",
		type: "file",
	},

	// Cフォルダの中身
	{ id: "11", name: "Cの中のファイル", path: "C-folder/C-file", type: "file" },
	{
		id: "12",
		name: "Cの中のフォルダ",
		path: "C-folder/C-subfolder",
		type: "folder",
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
