import type { DiagramBaseData } from "../base";
import type {
	FillableData,
	ItemableData,
	SelectableData,
	StrokableData,
	TextableData,
	TransformativeData,
} from "../core";
import type { ConnectableData } from "./ConnectableData";

/**
 * 図形の型作成オプション
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
 * 図形のデータ型を作成する型
 */
export type CreateDiagramType<T extends DiagramDataOptions> = DiagramBaseData &
	(T["selectable"] extends true ? SelectableData : object) &
	(T["transformative"] extends true ? TransformativeData : object) &
	(T["itemable"] extends true ? ItemableData : object) &
	(T["connectable"] extends true ? ConnectableData : object) &
	(T["strokable"] extends true ? StrokableData : object) &
	(T["fillable"] extends true ? FillableData : object) &
	(T["textable"] extends true ? TextableData : object);
