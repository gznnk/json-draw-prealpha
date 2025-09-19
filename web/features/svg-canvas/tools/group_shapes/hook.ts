import { useCallback } from "react";

import type { EventBus } from "../../../../shared/event-bus/EventBus";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client";
import { EVENT_NAME_GROUP_SHAPES } from "../../constants/core/EventNames";
import type { GroupShapesEvent } from "../../types/events/GroupShapesEvent";
import { newEventId } from "../../utils/core/newEventId";
import { newId } from "../../utils/shapes/common/newId";

/**
 * React hook to dispatch GroupShapesEvent using the shared event bus.
 * Returns a memoized function.
 */
export const useGroupShapesTool = (eventBus: EventBus): FunctionCallHandler => {
	return useCallback(
		(functionCall: FunctionCallInfo) => {
			const args = functionCall.arguments as {
				shapeIds: string[];
				name?: string;
				description?: string;
			};

			if (
				Array.isArray(args.shapeIds) &&
				args.shapeIds.length >= 2 &&
				args.shapeIds.every((id) => typeof id === "string")
			) {
				const groupId = newId();
				const event = {
					eventId: newEventId(),
					shapeIds: args.shapeIds,
					groupId,
					name: args.name,
					description: args.description,
				} as GroupShapesEvent;

				const customEvent = new CustomEvent(EVENT_NAME_GROUP_SHAPES, {
					detail: event,
				});
				eventBus.dispatchEvent(customEvent);

				// Return the grouping data
				return {
					shapeIds: args.shapeIds,
					groupId,
					success: true,
				};
			}

			return {
				error:
					"Invalid arguments. shapeIds must be an array of at least 2 string IDs.",
			};
		},
		[eventBus],
	);
};
