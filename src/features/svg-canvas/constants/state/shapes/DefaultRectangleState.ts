import { DefaultSelectableState } from "../core/DefaultSelectableState";
import { DefaultTransformativeState } from "../core/DefaultTransformativeState";
import { DefaultTextableState } from "../core/DefaultTextableState";
import { DefaultConnectableState } from "./DefaultConnectableState";
import { RectangleDefaultData } from "../../data/shapes/RectangleDefaultData";
import type { RectangleState } from "../../../types/state/shapes/RectangleState";

export const DefaultRectangleState = {
	...RectangleDefaultData,
	...DefaultSelectableState,
	...DefaultTransformativeState,
	...DefaultTextableState,
	...DefaultConnectableState,
} as const satisfies RectangleState;
