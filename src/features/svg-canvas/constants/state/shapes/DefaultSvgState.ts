import { DefaultDiagramBaseState } from "../core/DefaultDiagramBaseState";
import { DefaultSelectableState } from "../core/DefaultSelectableState";
import { DefaultTransformativeState } from "../core/DefaultTransformativeState";
import type { SvgState } from "../../../types/state/shapes/SvgState";

export const DefaultSvgState = {
	...DefaultDiagramBaseState,
	...DefaultSelectableState,
	...DefaultTransformativeState,
	type: "Svg",
	initialWidth: 100,
	initialHeight: 100,
	svgText: "",
} as const satisfies SvgState;