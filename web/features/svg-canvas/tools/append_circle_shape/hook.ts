import { useCallback } from "react";

import type { EventBus } from "../../../../shared/event-bus/EventBus";
import type { FunctionCallHandler } from "../../../../shared/llm-client/types";
import { useAppendDiagramsWithBus } from "../../hooks/useAppendDiagramsWithBus";
import { useAddCircleShapeWithHandlerTool } from "../add_circle_shape_with_handler";

export const useAppendCircleShapeTool = (
	eventBus: EventBus,
): ((targetId: string, offsetX?: number, offsetY?: number) => FunctionCallHandler) => {
	const appendDiagrams = useAppendDiagramsWithBus(eventBus);
	const circleShapeWithHandlerTool = useAddCircleShapeWithHandlerTool();

	return useCallback(
		(targetId: string, offsetX = 0, offsetY = 0) => {
			return circleShapeWithHandlerTool((diagram) => {
				// Apply offset to the diagram
				const offsetDiagram = {
					...diagram,
					x: diagram.x + offsetX,
					y: diagram.y + offsetY,
				};
				appendDiagrams(targetId, [offsetDiagram]);
			});
		},
		[appendDiagrams, circleShapeWithHandlerTool],
	);
};