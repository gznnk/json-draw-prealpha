import type { ConnectPointData } from "../types/data/shapes/ConnectPointData";
import type { ConnectableData } from "../types/data/shapes/ConnectableData";
import type { Diagram } from "../catalog/DiagramTypes";
import type { DiagramBaseData } from "../types/base/DiagramBaseData";
import type { FillableData } from "../types/data/core/FillableData";
import type { StrokableData } from "../types/data/core/StrokableData";
import type { ItemableData } from "../types/data/core/ItemableData";
import type { SelectableData } from "../types/data/core/SelectableData";
import type { TransformativeData } from "../types/data/core/TransformativeData";
import type { TextableData } from "../types/data/core/TextableData";

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
