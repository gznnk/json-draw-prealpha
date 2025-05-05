// 型チェック関数を集約したユーティリティ
import {
	DiagramExportFunctions,
	type DiagramType,
} from "../types/DiagramCatalog";
import type {
	Shape,
	SelectableData,
	ConnectableData,
	TransformativeData,
	TextableData,
	ItemableData,
	FillableData,
	StrokableData,
} from "../types/DiagramTypes";

export const isShape = (obj: unknown): obj is Shape => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"x" in obj &&
		"y" in obj &&
		"width" in obj &&
		"height" in obj &&
		"rotation" in obj &&
		"scaleX" in obj &&
		"scaleY" in obj &&
		typeof (obj as Shape).x === "number" &&
		typeof (obj as Shape).y === "number" &&
		typeof (obj as Shape).width === "number" &&
		typeof (obj as Shape).height === "number" &&
		typeof (obj as Shape).rotation === "number" &&
		typeof (obj as Shape).scaleX === "number" &&
		typeof (obj as Shape).scaleY === "number"
	);
};

export const isSelectableData = (obj: unknown): obj is SelectableData => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"isSelected" in obj &&
		"isMultiSelectSource" in obj &&
		typeof (obj as SelectableData).isSelected === "boolean" &&
		typeof (obj as SelectableData).isMultiSelectSource === "boolean"
	);
};

export const isItemableData = (obj: unknown): obj is ItemableData => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"items" in obj &&
		Array.isArray((obj as ItemableData).items)
	);
};

export const isConnectableData = (obj: unknown): obj is ConnectableData => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"connectPoints" in obj &&
		Array.isArray((obj as ConnectableData).connectPoints)
	);
};

export const isTransformativeData = (
	obj: unknown,
): obj is TransformativeData => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"x" in obj &&
		"y" in obj &&
		"width" in obj &&
		"height" in obj &&
		"rotation" in obj &&
		"scaleX" in obj &&
		"scaleY" in obj &&
		"keepProportion" in obj &&
		typeof (obj as TransformativeData).x === "number" &&
		typeof (obj as TransformativeData).y === "number" &&
		typeof (obj as TransformativeData).width === "number" &&
		typeof (obj as TransformativeData).height === "number" &&
		typeof (obj as TransformativeData).rotation === "number" &&
		typeof (obj as TransformativeData).scaleX === "number" &&
		typeof (obj as TransformativeData).scaleY === "number" &&
		typeof (obj as TransformativeData).keepProportion === "boolean"
	);
};

export const isTextableData = (obj: unknown): obj is TextableData => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"text" in obj &&
		"textType" in obj &&
		"textAlign" in obj &&
		"verticalAlign" in obj &&
		"fontColor" in obj &&
		"fontSize" in obj &&
		"fontFamily" in obj &&
		"fontWeight" in obj &&
		"isTextEditing" in obj &&
		typeof (obj as TextableData).text === "string" &&
		typeof (obj as TextableData).fontColor === "string" &&
		typeof (obj as TextableData).fontSize === "number" &&
		typeof (obj as TextableData).fontFamily === "string" &&
		typeof (obj as TextableData).fontWeight === "string" &&
		typeof (obj as TextableData).isTextEditing === "boolean"
	);
};

export const isStrokableData = (obj: unknown): obj is StrokableData => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"stroke" in obj &&
		"strokeWidth" in obj &&
		typeof (obj as StrokableData).stroke === "string" &&
		typeof (obj as StrokableData).strokeWidth === "string"
	);
};

export const isFillableData = (obj: unknown): obj is FillableData => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"fill" in obj &&
		typeof (obj as FillableData).fill === "string"
	);
};

export const isExportable = (obj: unknown): boolean => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"type" in obj &&
		DiagramExportFunctions[obj.type as DiagramType] !== undefined
	);
};
