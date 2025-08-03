import { DefaultDiagramBaseState } from "../core/DefaultDiagramBaseState";
import { DefaultSelectableState } from "../core/DefaultSelectableState";
import { DefaultTransformativeState } from "../core/DefaultTransformativeState";
import { DefaultConnectableState } from "../core/DefaultConnectableState";
import { DefaultStrokableState } from "../core/DefaultStrokableState";
import { DefaultFillableState } from "../core/DefaultFillableState";
import { DefaultTextableState } from "../core/DefaultTextableState";
import type { RectangleState } from "../../../types/state/shapes/RectangleState";

export const DefaultRectangleState = {
	...DefaultDiagramBaseState,
	...DefaultSelectableState,
	...DefaultTransformativeState,
	...DefaultConnectableState,
	...DefaultStrokableState,
	...DefaultFillableState,
	...DefaultTextableState,
	type: "Rectangle",
	radius: 0,
} as const satisfies RectangleState;