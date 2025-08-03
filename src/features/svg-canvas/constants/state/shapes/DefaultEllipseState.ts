import { DefaultDiagramBaseState } from "../core/DefaultDiagramBaseState";
import { DefaultSelectableState } from "../core/DefaultSelectableState";
import { DefaultTransformativeState } from "../core/DefaultTransformativeState";
import { DefaultConnectableState } from "../core/DefaultConnectableState";
import { DefaultStrokableState } from "../core/DefaultStrokableState";
import { DefaultFillableState } from "../core/DefaultFillableState";
import { DefaultTextableState } from "../core/DefaultTextableState";
import type { EllipseState } from "../../../types/state/shapes/EllipseState";

export const DefaultEllipseState = {
	...DefaultDiagramBaseState,
	...DefaultSelectableState,
	...DefaultTransformativeState,
	...DefaultConnectableState,
	...DefaultStrokableState,
	...DefaultFillableState,
	...DefaultTextableState,
	type: "Ellipse",
} as const satisfies EllipseState;