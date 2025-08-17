import { DefaultSelectableState } from "../core/DefaultSelectableState";
import { DefaultTransformativeState } from "../core/DefaultTransformativeState";
import { DefaultTextableState } from "../core/DefaultTextableState";
import { DefaultConnectableState } from "./DefaultConnectableState";
import { EllipseDefaultData } from "../../data/shapes/EllipseDefaultData";
import type { EllipseState } from "../../../types/state/shapes/EllipseState";

export const DefaultEllipseState = {
	...EllipseDefaultData,
	...DefaultSelectableState,
	...DefaultTransformativeState,
	...DefaultTextableState,
	...DefaultConnectableState,
} as const satisfies EllipseState;
