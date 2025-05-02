// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../types/DiagramCatalog";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { isItemableData, isSelectableData } from "../../utils/TypeUtils";
import { getSelectedItems } from "../SvgCanvasFunctions";

/**
 * コピー用に図形の不要なプロパティをクリーンアップする
 *
 * @param item コピーする図形
 * @returns クリーンアップされた図形
 */
const cleanupItemForCopy = (item: Diagram): Diagram => {
	// 元のアイテムをコピー
	const cleanItem = { ...item };

	// 選択可能な要素の場合、isMultiSelectSourceをfalseに設定
	if (isSelectableData(cleanItem)) {
		cleanItem.isMultiSelectSource = false;
	}

	// 子要素を持つ場合は再帰的にクリーンアップ
	if (isItemableData(cleanItem)) {
		cleanItem.items = cleanItem.items.map((childItem) =>
			cleanupItemForCopy(childItem),
		);
	}

	return cleanItem;
};

/**
 * Custom hook to handle copy events on the canvas.
 */
export const useCopy = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const {
			canvasState: { items, multiSelectGroup },
		} = refBus.current.props;

		// マルチセレクトグループが存在する場合はその中のアイテムをコピー
		let selectedItems: Diagram[];
		if (multiSelectGroup) {
			// multiSelectGroupのitemsプロパティを使用
			selectedItems = multiSelectGroup.items;
		} else {
			// 通常の選択アイテムを取得
			selectedItems = getSelectedItems(items);
		}

		// If no items are selected, do nothing.
		if (selectedItems.length === 0) return;

		try {
			// コピー前に各アイテムをクリーンアップ
			const cleanedItems = selectedItems.map((item) =>
				cleanupItemForCopy(item),
			);

			// Convert the cleaned items to JSON string.
			const clipboardData = JSON.stringify(cleanedItems);

			// Copy the data to the clipboard.
			navigator.clipboard
				.writeText(clipboardData)
				.then(() => {
					console.log("Selected items copied to clipboard.");
				})
				.catch((err) => {
					console.error("Could not copy items to clipboard: ", err);
				});
		} catch (error) {
			console.error("Error while copying selected items to clipboard: ", error);
		}
	}, []);
};
