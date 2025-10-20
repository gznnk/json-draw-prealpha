import { useMemo } from "react";

import type { EventBus } from "../../../../shared/event-bus/EventBus";
import type { FunctionCallHandler } from "../../../../shared/llm-client/types";
import { useAddDiagramWithBus } from "../../hooks/useAddDiagramWithBus";
import { useAddCircleShapeWithHandlerTool } from "../add_circle_shape_with_handler";

export const useAddCircleShapeTool = (
	eventBus: EventBus,
): FunctionCallHandler => {
	const addDiagram = useAddDiagramWithBus(eventBus);
	const circleShapeWithHandlerTool = useAddCircleShapeWithHandlerTool();

	return useMemo(
		() => circleShapeWithHandlerTool(addDiagram),
		[addDiagram, circleShapeWithHandlerTool],
	);
};
