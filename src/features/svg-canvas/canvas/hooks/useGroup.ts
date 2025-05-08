// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { GroupData } from "../../components/shapes/Group";
import type { CanvasHooksProps, SvgCanvasState } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { newId } from "../../utils/diagram";
import { newEventId } from "../../utils";
import {
	addHistory,
	clearMultiSelectSourceRecursive,
	getSelectedItems,
	removeGroupedRecursive,
} from "../SvgCanvasFunctions";

/**
 * Custom hook to handle group events on the canvas.
 */
export const useGroup = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => {
			const selectedItems = getSelectedItems(prevState.items);
			if (selectedItems.length < 2) {
				// 選択されている図形が2つ未満の場合はグループ化させない
				// ここに到達する場合は呼び出し元の制御に不備あり
				console.error("Invalid selection count for group.");
				return prevState;
			}

			if (!prevState.multiSelectGroup) {
				// Type checking for multiSelectGroup.
				// If this is the case, it means that the canvas state is invalid.
				console.error("Invalid multiSelectGroup state.");
				return prevState;
			}

			// Create a new group data.
			const group: GroupData = {
				...prevState.multiSelectGroup,
				id: newId(),
				type: "Group",
				isSelected: true,
				isMultiSelectSource: false,
				items: selectedItems.map((item) => ({
					...item,
					isSelected: false,
					isMultiSelectSource: false,
				})),
			};

			// グループ化された図形を図形配列から削除
			let items = removeGroupedRecursive(prevState.items);
			// 新しいグループを追加
			items = [...items, group];
			// 複数選択の選択元設定を解除
			items = clearMultiSelectSourceRecursive(items);

			// 新しい状態を作成
			let newState = {
				...prevState,
				items,
				multiSelectGroup: undefined,
			} as SvgCanvasState;

			// Add a new history entry.
			newState.lastHistoryEventId = newEventId();
			newState = addHistory(prevState, newState);

			return newState;
		});
	}, []);
};
