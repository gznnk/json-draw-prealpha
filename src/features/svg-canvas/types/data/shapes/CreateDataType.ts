import type { DiagramBaseData } from "../core/DiagramBaseData";
import type { FillableData } from "../core/FillableData";
import type { ItemableData } from "../core/ItemableData";
import type { SelectableData } from "../core/SelectableData";
import type { StrokableData } from "../core/StrokableData";
import type { TextableData } from "../core/TextableData";
import type { TransformativeData } from "../core/TransformativeData";
import type { ConnectableData } from "./ConnectableData";

/**
 * Options for creating diagram data types.
 * Controls which feature interfaces should be included in the resulting type.
 */
export type DiagramDataOptions = {
	selectable?: boolean;
	transformative?: boolean;
	itemable?: boolean;
	connectable?: boolean;
	strokable?: boolean;
	fillable?: boolean;
	textable?: boolean;
};

/**
 * Generic type creator for diagram data types.
 * Conditionally includes feature interfaces based on provided options.
 */
export type CreateDataType<T extends DiagramDataOptions> = DiagramBaseData &
	(T["selectable"] extends true ? SelectableData : object) &
	(T["transformative"] extends true ? TransformativeData : object) &
	(T["itemable"] extends true ? ItemableData<DiagramBaseData> : object) &
	(T["connectable"] extends true ? ConnectableData : object) &
	(T["strokable"] extends true ? StrokableData : object) &
	(T["fillable"] extends true ? FillableData : object) &
	(T["textable"] extends true ? TextableData : object);
