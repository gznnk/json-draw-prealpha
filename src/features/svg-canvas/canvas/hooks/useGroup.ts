// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { GroupData } from "../../types/data/shapes/GroupData";
import type { CanvasHooksProps, SvgCanvasState } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { newId } from "../../utils/shapes/common/newId";
import { newEventId } from "../../utils/common/newEventId";
import { addHistory } from "../utils/addHistory";
import { clearMultiSelectSourceRecursive } from "../utils/clearMultiSelectSourceRecursive";
import { getSelectedItems } from "../../utils/common/getSelectedItems";
import { removeGroupedRecursive } from "../utils/removeGroupedRecursive";

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
				// 選択されてぁE��図形ぁEつ未満の場合�Eグループ化させなぁE
				// ここに到達する場合�E呼び出し�Eの制御に不備あり
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

			// グループ化された図形を図形配�Eから削除
			let items = removeGroupedRecursive(prevState.items);
			// 新しいグループを追加
			items = [...items, group];
			// 褁E��選択�E選択�E設定を解除
			items = clearMultiSelectSourceRecursive(items);

			// 新しい状態を作�E
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
