import { DefaultEllipseState } from "../shapes/DefaultEllipseState";
import type { ImageGenNodeState } from "../../../types/state/nodes/ImageGenNodeState";

export const DefaultImageGenNodeState = {
	...DefaultEllipseState,
	type: "ImageGenNode",
} as const satisfies ImageGenNodeState;