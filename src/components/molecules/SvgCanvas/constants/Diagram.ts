import type {
	Diagram,
	DiagramBaseData,
	SelectableData,
	TransformativeData,
	ItemableData,
	StrokableData,
	FillableData,
	TextableData,
	RectangleData,
	EllipseData,
	PathData,
} from "../types/DiagramTypes";

/**
 * Default diagram base data.
 */
export const DEFAULT_DIAGRAM_BASE_DATA = {
	id: "",
	type: "Rectangle",
	x: 0,
	y: 0,
	syncWithSameId: false,
} as const satisfies DiagramBaseData;

/**
 * Default selectable data.
 */
export const DEFAULT_SELECTABLE_DATA = {
	isSelected: false,
	isMultiSelectSource: false,
} as const satisfies SelectableData;

/**
 * Default transformative data.
 */
export const DEFAULT_TRANSFORMATIVE_DATA = {
	x: 50,
	y: 50,
	width: 100,
	height: 100,
	rotation: 0,
	scaleX: 1,
	scaleY: 1,
	keepProportion: false,
} as const satisfies TransformativeData;

/**
 * Default itemable data.
 */
export const DEFAULT_ITEMABLE_DATA = {
	items: [] as Diagram[],
} as const satisfies ItemableData;

/**
 * Default strokable data.
 */
export const DEFAULT_STROKABLE_DATA = {
	stroke: "transparent",
	strokeWidth: "0",
} as const satisfies StrokableData;

/**
 * Default fillable data.
 */
export const DEFAULT_FILLABLE_DATA = {
	fill: "transparent",
} as const satisfies FillableData;

/**
 * Default textable data.
 */
export const DEFAULT_TEXTABLE_DATA = {
	text: "",
	textType: "textarea",
	fontColor: "#000000",
	fontSize: 16,
	fontFamily: "Arial",
	textAlign: "center",
	verticalAlign: "center",
	isTextEditing: false,
} as const satisfies TextableData;

/**
 * Default rectangle data.
 */
export const DEFAULT_RECTANGLE_DATA = {
	...DEFAULT_DIAGRAM_BASE_DATA,
	...DEFAULT_SELECTABLE_DATA,
	...DEFAULT_TRANSFORMATIVE_DATA,
	...DEFAULT_ITEMABLE_DATA,
	...DEFAULT_STROKABLE_DATA,
	...DEFAULT_FILLABLE_DATA,
	...DEFAULT_TEXTABLE_DATA,
	type: "Rectangle",
} as const satisfies RectangleData;

/**
 * Default ellipse data.
 */
export const DEFAULT_ELLIPSE_DATA = {
	...DEFAULT_DIAGRAM_BASE_DATA,
	...DEFAULT_SELECTABLE_DATA,
	...DEFAULT_TRANSFORMATIVE_DATA,
	...DEFAULT_ITEMABLE_DATA,
	...DEFAULT_STROKABLE_DATA,
	...DEFAULT_FILLABLE_DATA,
	...DEFAULT_TEXTABLE_DATA,
	type: "Ellipse",
} as const satisfies EllipseData;

/**
 * Default path data.
 */
export const DEFAULT_PATH_DATA = {
	...DEFAULT_DIAGRAM_BASE_DATA,
	...DEFAULT_SELECTABLE_DATA,
	...DEFAULT_TRANSFORMATIVE_DATA,
	...DEFAULT_ITEMABLE_DATA,
	...DEFAULT_STROKABLE_DATA,
	type: "Path",
} as const satisfies PathData;
