import { DefaultRectangleState } from "../shapes/DefaultRectangleState";
import type { TextAreaNodeState } from "../../../types/state/nodes/TextAreaNodeState";

export const DefaultTextAreaNodeState = {
	...DefaultRectangleState,
	type: "TextAreaNode",
} as const satisfies TextAreaNodeState;