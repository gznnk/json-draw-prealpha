import type {
	Diagram,
	TransformativeData,
	GroupData,
} from "./types/DiagramTypes";

// biome-ignore lint/suspicious/noExplicitAny: 型チェック関数のため
export const isGroupData = (obj: any): obj is GroupData => {
	return obj && typeof obj.type === "string" && Array.isArray(obj.items);
};

// TODO: 名前
// biome-ignore lint/suspicious/noExplicitAny: 型チェック関数のため
export const isTransformativeData = (obj: any): obj is TransformativeData => {
	return (
		obj &&
		typeof obj.type === "string" &&
		typeof obj.width === "number" &&
		typeof obj.height === "number" &&
		typeof obj.rotation === "number" &&
		typeof obj.scaleX === "number" &&
		typeof obj.scaleY === "number"
	);
};

export const applyRecursive = (
	items: Diagram[],
	func: (item: Diagram) => Diagram,
) => {
	return items.map((item) => {
		const newItem = func(item);
		if (isGroupData(item) && isGroupData(newItem)) {
			newItem.items = applyRecursive(item.items ?? [], func);
		}
		return newItem;
	});
};
