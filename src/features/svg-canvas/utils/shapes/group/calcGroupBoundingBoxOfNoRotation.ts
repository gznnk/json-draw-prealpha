import type { Diagram } from "../../../types/data/catalog/Diagram";
import { isItemableData } from "../../validation/isItemableData";
import { calcItemBoundingBoxOfNoGroupRotation } from "./calcItemBoundingBoxOfNoGroupRotation";

/**
 * グループの回転を戻した時の、グループのbounding boxを計算する
 *
 * @param changeItem - グループ内の変更された図形
 * @param items - グループ内の図形リスト
 * @param groupCenterX - グループの中心X座標
 * @param groupCenterY - グループの中心Y座標
 * @param groupRotation - グループの回転角度
 * @returns グループのbounding box
 */
export const calcGroupBoundingBoxOfNoRotation = (
	items: Diagram[],
	groupCenterX = 0,
	groupCenterY = 0,
	groupRotation = 0,
	changeItem?: Diagram,
) => {
	// グループ内の図形を再帰的に取得し、グループの四辺の座標を計算する
	let top = Number.POSITIVE_INFINITY;
	let left = Number.POSITIVE_INFINITY;
	let bottom = Number.NEGATIVE_INFINITY;
	let right = Number.NEGATIVE_INFINITY;
	for (const item of items) {
		// ConnectPointは形状の計算に含めない
		const itemItems = isItemableData<Diagram>(item)
			? (item.items ?? []).filter((i) => i.type !== "ConnectPoint")
			: [];
		if (itemItems.length > 0) {
			const groupBoundingBox = calcGroupBoundingBoxOfNoRotation(
				itemItems,
				groupCenterX,
				groupCenterY,
				groupRotation,
				changeItem,
			);
			top = Math.min(top, groupBoundingBox.top);
			bottom = Math.max(bottom, groupBoundingBox.bottom);
			left = Math.min(left, groupBoundingBox.left);
			right = Math.max(right, groupBoundingBox.right);
		} else {
			const boundingBox = calcItemBoundingBoxOfNoGroupRotation(
				item.id === changeItem?.id ? changeItem : item,
				groupCenterX,
				groupCenterY,
				groupRotation,
			);
			top = Math.min(top, boundingBox.top);
			bottom = Math.max(bottom, boundingBox.bottom);
			left = Math.min(left, boundingBox.left);
			right = Math.max(right, boundingBox.right);
		}
	}

	return {
		top,
		bottom,
		left,
		right,
	};
};
