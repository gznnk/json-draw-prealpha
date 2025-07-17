import { useCallback } from "react";
import { useAddDiagramWithBus } from "../../hooks/useAddDiagramWithBus";
import { createImageGenNodeData } from "../../utils/nodes/imageGenNode/createImageGenNodeData";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client/types";
import type { EventBus } from "../../../../shared/event-bus/EventBus";

export const useAddImageGenNodeTool = (
	eventBus: EventBus,
): FunctionCallHandler => {
	const addDiagram = useAddDiagramWithBus(eventBus);
	return useCallback(
		(functionCall: FunctionCallInfo) => {
			const args = functionCall.arguments as { x: number; y: number };
			if (typeof args.x === "number" && typeof args.y === "number") {
				const data = createImageGenNodeData({ x: args.x, y: args.y });
				addDiagram(data);
				return {
					id: data.id,
					type: "ImageGenNode",
					width: data.width,
					height: data.height,
				};
			}
			return null;
		},
		[addDiagram],
	);
};
