// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { DiagramTextChangeEvent } from "../types/events/DiagramTextChangeEvent";

// Import utils.
import { newEventId } from "../utils/common/newEventId";

export type UseTextProps = {
	id: string;
	isSelected: boolean;
	isTextEditEnabled?: boolean;
	onTextChange?: (e: DiagramTextChangeEvent) => void;
};

export type UseTextReturn = {
	onDoubleClick: () => void;
};

/**
 * Custom hook to handle text editing interactions for diagram items.
 * Provides a double-click handler that starts text editing when enabled.
 */
export const useText = (props: UseTextProps): UseTextReturn => {
	const {
		id,
		isSelected,
		isTextEditEnabled = true,
		onTextChange = () => {},
	} = props;

	// Create references bypass to avoid function creation in every render
	const refBusVal = {
		id,
		isSelected,
		isTextEditEnabled,
		onTextChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	const onDoubleClick = useCallback(() => {
		// Bypass references to avoid function creation in every render
		const { id, isSelected, isTextEditEnabled, onTextChange } = refBus.current;

		// Only start text editing if text editing is enabled and the item is selected
		if (!isTextEditEnabled || !isSelected) {
			return;
		}

		const textChangeEvent: DiagramTextChangeEvent = {
			eventType: "Start",
			id,
			text: "",
			eventId: newEventId(),
		};
		onTextChange(textChangeEvent);
	}, []);

	return {
		onDoubleClick,
	};
};
