import { useCallback } from "react";

import type {
	DiagramStyleChangeEvent,
	DiagramStyle,
} from "../../../../../types/events/DiagramStyleChangeEvent";
import type { Diagram } from "../../../../../types/state/core/Diagram";
import { newEventId } from "../../../../../utils/core/newEventId";
import { isItemableState } from "../../../../../utils/validation/isItemableState";

export type UseStyleChangeProps = {
	onStyleChange?: (event: DiagramStyleChangeEvent) => void;
};

export type ApplyStyleChangeParams = {
	items: Diagram[];
	styleData: Partial<DiagramStyle>;
	recursively?: boolean;
	eventId?: string;
};

export type UseStyleChangeReturn = {
	applyStyleChange: (params: ApplyStyleChangeParams) => void;
};

/**
 * Hook for managing diagram style changes.
 * Provides functionality to apply style changes to diagrams recursively.
 */
export const useStyleChange = (
	props: UseStyleChangeProps,
): UseStyleChangeReturn => {
	const { onStyleChange } = props;

	const applyStyleChange = useCallback(
		(params: ApplyStyleChangeParams) => {
			const {
				items,
				styleData,
				recursively = true,
				eventId = newEventId(),
			} = params;

			for (const item of items) {
				onStyleChange?.({
					eventId,
					id: item.id,
					data: styleData,
				});

				if (recursively && isItemableState(item)) {
					applyStyleChange({
						items: item.items,
						styleData,
						recursively,
						eventId,
					});
				}
			}
		},
		[onStyleChange],
	);

	return {
		applyStyleChange,
	};
};
