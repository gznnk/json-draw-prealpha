// Import types.
import type { Diagram } from "../types/state/catalog/Diagram";
import type { DiagramBaseState } from "../types/state/core/DiagramBaseState";
import type { FillableState } from "../types/state/core/FillableState";
import type { ItemableState } from "../types/state/core/ItemableState";
import type { SelectableState } from "../types/state/core/SelectableState";
import type { StrokableState } from "../types/state/core/StrokableState";
import type { TextableState } from "../types/state/core/TextableState";
import type { TransformativeState } from "../types/state/core/TransformativeState";
import type { ConnectLineState } from "../types/state/shapes/ConnectLineState";
import type { ConnectPointState } from "../types/state/shapes/ConnectPointState";
import type { ConnectableState } from "../types/state/shapes/ConnectableState";
import type { EllipseState } from "../types/state/shapes/EllipseState";
import type { ImageState } from "../types/state/shapes/ImageState";
import type { PathState } from "../types/state/shapes/PathState";
import type { RectangleState } from "../types/state/shapes/RectangleState";
import type { SvgState } from "../types/state/shapes/SvgState";

/**
 * Default diagram base state.
 */
export const DEFAULT_DIAGRAM_BASE_STATE = {
	id: "",
	type: "Rectangle",
	x: 0,
	y: 0,
} as const satisfies DiagramBaseState;

/**
 * Default selectable state.
 */
export const DEFAULT_SELECTABLE_STATE = {
	isSelected: false,
	isAncestorSelected: false,
	showOutline: false,
} as const satisfies SelectableState;

/**
 * Default transformative state.
 */
export const DEFAULT_TRANSFORMATIVE_STATE = {
	x: 50,
	y: 50,
	width: 100,
	height: 100,
	rotation: 0,
	scaleX: 1,
	scaleY: 1,
	keepProportion: false,
	showTransformControls: false,
	isTransforming: false,
} as const satisfies TransformativeState;

/**
 * Default itemable state.
 */
export const DEFAULT_ITEMABLE_STATE = {
	items: [] as Diagram[],
} as const satisfies ItemableState<Diagram>;

/**
 * Default connectable state.
 */
export const DEFAULT_CONNECTABLE_STATE = {
	showConnectPoints: false,
	connectPoints: [] as ConnectPointState[],
} as const satisfies ConnectableState;

/**
 * Default strokable state.
 */
export const DEFAULT_STROKABLE_STATE = {
	stroke: "transparent",
	strokeWidth: "0",
} as const satisfies StrokableState;

/**
 * Default fillable state.
 */
export const DEFAULT_FILLABLE_STATE = {
	fill: "transparent",
} as const satisfies FillableState;

/**
 * Default textable state.
 */
export const DEFAULT_TEXTABLE_STATE = {
	text: "",
	textType: "textarea",
	fontColor: "#000000",
	fontSize: 16,
	fontFamily: "Segoe UI",
	fontWeight: "normal",
	textAlign: "center",
	verticalAlign: "center",
	isTextEditing: false,
} as const satisfies TextableState;

/**
 * Default rectangle state.
 */
export const DEFAULT_RECTANGLE_STATE = {
	...DEFAULT_DIAGRAM_BASE_STATE,
	...DEFAULT_SELECTABLE_STATE,
	...DEFAULT_TRANSFORMATIVE_STATE,
	...DEFAULT_CONNECTABLE_STATE,
	...DEFAULT_STROKABLE_STATE,
	...DEFAULT_FILLABLE_STATE,
	...DEFAULT_TEXTABLE_STATE,
	type: "Rectangle",
	radius: 0,
} as const satisfies RectangleState;

/**
 * Default ellipse state.
 */
export const DEFAULT_ELLIPSE_STATE = {
	...DEFAULT_DIAGRAM_BASE_STATE,
	...DEFAULT_SELECTABLE_STATE,
	...DEFAULT_TRANSFORMATIVE_STATE,
	...DEFAULT_CONNECTABLE_STATE,
	...DEFAULT_STROKABLE_STATE,
	...DEFAULT_FILLABLE_STATE,
	...DEFAULT_TEXTABLE_STATE,
	type: "Ellipse",
} as const satisfies EllipseState;

/**
 * Default image state.
 */
export const DEFAULT_IMAGE_STATE = {
	...DEFAULT_DIAGRAM_BASE_STATE,
	...DEFAULT_SELECTABLE_STATE,
	...DEFAULT_TRANSFORMATIVE_STATE,
	type: "Image",
	base64Data: "",
} as const satisfies ImageState;

/**
 * Default svg state.
 */
export const DEFAULT_SVG_STATE = {
	...DEFAULT_DIAGRAM_BASE_STATE,
	...DEFAULT_SELECTABLE_STATE,
	...DEFAULT_TRANSFORMATIVE_STATE,
	type: "Svg",
	initialWidth: 100,
	initialHeight: 100,
	svgText: "",
} as const satisfies SvgState;

/**
 * Default path state.
 */
export const DEFAULT_PATH_STATE = {
	...DEFAULT_DIAGRAM_BASE_STATE,
	...DEFAULT_SELECTABLE_STATE,
	...DEFAULT_TRANSFORMATIVE_STATE,
	...DEFAULT_ITEMABLE_STATE,
	...DEFAULT_STROKABLE_STATE,
	type: "Path",
} as const satisfies PathState;

/**
 * Default connect line state.
 */
export const DEFAULT_CONNECT_LINE_STATE = {
	...DEFAULT_DIAGRAM_BASE_STATE,
	...DEFAULT_SELECTABLE_STATE,
	...DEFAULT_TRANSFORMATIVE_STATE,
	...DEFAULT_ITEMABLE_STATE,
	...DEFAULT_STROKABLE_STATE,
	type: "ConnectLine",
	stroke: "#002766",
	strokeWidth: "2px",
	startOwnerId: "",
	endOwnerId: "",
	autoRouting: true,
	endArrowHead: "Circle",
} as const satisfies ConnectLineState;
