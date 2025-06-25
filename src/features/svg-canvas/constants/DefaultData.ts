import type { ConnectPointData } from "../types/data/shapes/ConnectPointData";
import type { ConnectableData } from "../types/data/shapes/ConnectableData";
import type { Diagram } from "../types/data/catalog/Diagram";
import type { DiagramBaseData } from "../types/base/DiagramBaseData";
import type { FillableData } from "../types/data/core/FillableData";
import type { StrokableData } from "../types/data/core/StrokableData";
import type { ItemableData } from "../types/data/core/ItemableData";
import type { SelectableData } from "../types/data/core/SelectableData";
import type { TransformativeData } from "../types/data/core/TransformativeData";
import type { TextableData } from "../types/data/core/TextableData";
import type { RectangleData } from "../types/data/shapes/RectangleData";
import type { EllipseData } from "../types/data/shapes/EllipseData";
import type { ImageData } from "../types/data/shapes/ImageData";
import type { SvgData } from "../types/data/shapes/SvgData";
import type { PathData } from "../types/data/shapes/PathData";

/**
 * Default diagram base data.
 */
export const DEFAULT_DIAGRAM_BASE_DATA = {
	id: "",
	type: "Rectangle",
	x: 0,
	y: 0,
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
} as const satisfies ItemableData<Diagram>;

/**
 * Default connectable data.
 */
export const DEFAULT_CONNECTABLE_DATA = {
	connectPoints: [] as ConnectPointData[],
} as const satisfies ConnectableData;

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
	fontFamily: "Segoe UI",
	fontWeight: "normal",
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
	...DEFAULT_CONNECTABLE_DATA,
	...DEFAULT_STROKABLE_DATA,
	...DEFAULT_FILLABLE_DATA,
	...DEFAULT_TEXTABLE_DATA,
	type: "Rectangle",
	radius: 0,
} as const satisfies RectangleData;

/**
 * Default ellipse data.
 */
export const DEFAULT_ELLIPSE_DATA = {
	...DEFAULT_DIAGRAM_BASE_DATA,
	...DEFAULT_SELECTABLE_DATA,
	...DEFAULT_TRANSFORMATIVE_DATA,
	...DEFAULT_CONNECTABLE_DATA,
	...DEFAULT_STROKABLE_DATA,
	...DEFAULT_FILLABLE_DATA,
	...DEFAULT_TEXTABLE_DATA,
	type: "Ellipse",
} as const satisfies EllipseData;

/**
 * Default image data.
 */
export const DEFAULT_IMAGE_DATA = {
	...DEFAULT_DIAGRAM_BASE_DATA,
	...DEFAULT_SELECTABLE_DATA,
	...DEFAULT_TRANSFORMATIVE_DATA,
	type: "Image",
	base64Data: "",
} as const satisfies ImageData;

/**
 * Default svg data.
 */
export const DEFAULT_SVG_DATA = {
	...DEFAULT_DIAGRAM_BASE_DATA,
	...DEFAULT_SELECTABLE_DATA,
	...DEFAULT_TRANSFORMATIVE_DATA,
	type: "Svg",
	initialWidth: 100,
	initialHeight: 100,
	svgText: "",
} as const satisfies SvgData;

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
