import { DefaultDiagramBaseState } from "../core/DefaultDiagramBaseState";
import { DefaultSelectableState } from "../core/DefaultSelectableState";
import { DefaultTransformativeState } from "../core/DefaultTransformativeState";
import { DefaultItemableState } from "../core/DefaultItemableState";
import { DefaultStrokableState } from "../core/DefaultStrokableState";
import type { ConnectLineState } from "../../../types/state/shapes/ConnectLineState";

export const DefaultConnectLineState = {
	...DefaultDiagramBaseState,
	...DefaultSelectableState,
	...DefaultTransformativeState,
	...DefaultItemableState,
	...DefaultStrokableState,
	type: "ConnectLine",
	stroke: "#002766",
	strokeWidth: "2px",
	startOwnerId: "",
	endOwnerId: "",
	autoRouting: true,
	endArrowHead: "Circle",
} as const satisfies ConnectLineState;