import { DefaultRectangleState } from "../shapes/DefaultRectangleState";
import type { ImageGenNodeState } from "../../../types/state/nodes/ImageGenNodeState";

export const DefaultImageGenNodeState = {
	...DefaultRectangleState,
	type: "ImageGenNode",
} as const satisfies ImageGenNodeState;