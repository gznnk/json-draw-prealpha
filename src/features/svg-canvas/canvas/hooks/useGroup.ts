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
import { getSelectedItems } from "../utils/getSelectedItems";
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
				// 驕ｸ謚槭＆繧後※縺・ｋ蝗ｳ蠖｢縺・縺､譛ｪ貅縺ｮ蝣ｴ蜷医・繧ｰ繝ｫ繝ｼ繝怜喧縺輔○縺ｪ縺・
				// 縺薙％縺ｫ蛻ｰ驕斐☆繧句ｴ蜷医・蜻ｼ縺ｳ蜃ｺ縺怜・縺ｮ蛻ｶ蠕｡縺ｫ荳榊ｙ縺ゅｊ
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

			// 繧ｰ繝ｫ繝ｼ繝怜喧縺輔ｌ縺溷峙蠖｢繧貞峙蠖｢驟榊・縺九ｉ蜑企勁
			let items = removeGroupedRecursive(prevState.items);
			// 譁ｰ縺励＞繧ｰ繝ｫ繝ｼ繝励ｒ霑ｽ蜉
			items = [...items, group];
			// 隍・焚驕ｸ謚槭・驕ｸ謚槫・險ｭ螳壹ｒ隗｣髯､
			items = clearMultiSelectSourceRecursive(items);

			// 譁ｰ縺励＞迥ｶ諷九ｒ菴懈・
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
