import { useCallback } from "react";
import { useAddDiagramWithBus } from "../../hooks/useAddDiagramWithBus";
import { createTextAreaNodeData } from "../../utils/nodes/textAreaNode/createTextAreaNodeData";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client/types";
import type { EventBus } from "../../../../shared/event-bus/EventBus";

/**
 * React hook to provide a handler for adding a Text node to the canvas using the event bus.
 * Returns a memoized FunctionCallHandler.
 *
 * @param eventBus - The EventBus instance to dispatch the event through
 * @returns FunctionCallHandler for adding a Text node
 */
export const useAddTextNodeTool = (eventBus: EventBus): FunctionCallHandler => {
	const addDiagram = useAddDiagramWithBus(eventBus);
	return useCallback(
		(functionCall: FunctionCallInfo) => {
			const args = functionCall.arguments as { x: number; y: number };
			if (typeof args.x === "number" && typeof args.y === "number") {
				const data = createTextAreaNodeData({ x: args.x, y: args.y });
				addDiagram(data);
				return {
					id: data.id,
					type: "TextNode",
					width: data.width,
					height: data.height,
				};
			}
			return null;
		},
		[addDiagram],
	);
};
