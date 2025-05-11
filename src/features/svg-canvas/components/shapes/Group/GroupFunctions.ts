// SvgCanvas関連型定義をインポート
import type { Bounds } from "../../../types/base";
import type { Diagram } from "../../../types/DiagramCatalog";
import type { GroupData } from "./GroupTypes";

// SvgCanvas関連関数をインポート
import { degreesToRadians, nanToZero, rotatePoint } from "../../../utils";
import {
	isItemableData,
	isSelectableData,
	isTransformativeData,
} from "../../../utils";

/**
 * 選択されたグループ内の図形を、配下のグループも含めて再帰的に取得する
 *
 * @param {Diagram[]} diagrams 図形リスト
 * @returns {string | undefined} 選択されたグループ内の図形
 */
export const getSelectedChildDiagram = (
	diagrams: Diagram[],
): Diagram | undefined => {
	for (const diagram of diagrams) {
		if (isSelectableData(diagram) && diagram.isSelected) {
			return diagram;
		}
		if (isItemableData(diagram)) {
			const ret = getSelectedChildDiagram(diagram.items || []);
			if (ret) {
				return ret;
			}
		}
	}
};

/**
 * 指定したIDの図形を、配下のグループも含めて再帰的に取得する
 *
 * @param diagrams - 図形リスト
 * @param id - ID
 * @returns 指定したIDの図形
 */
export const getChildDiagramById = (
	diagrams: Diagram[],
	id: string,
): Diagram | undefined => {
	for (const diagram of diagrams) {
		if (diagram.id === id) {
			return diagram;
		}
		if (isItemableData(diagram)) {
			const ret = getChildDiagramById(diagram.items || [], id);
			if (ret) {
				return ret;
			}
		}
	}
};

/**
 * グループの回転を戻した時の、図形の四辺の座標を計算する
 *
 * @param item - 図形
 * @param groupCenterX - グループの中心X座標
 * @param groupCenterY - グループの中心Y座標
 * @param groupRotation - グループの回転角度
 * @returns 図形の四辺の座標
 */
export const calcItemBoxOfNoGroupRotation = (
	item: Diagram,
	groupCenterX: number,
	groupCenterY: number,
	groupRotation: number,
) => {
	const groupRadians = degreesToRadians(-groupRotation);

	const inversedCenter = rotatePoint(
		item.x,
		item.y,
		groupCenterX,
		groupCenterY,
		groupRadians,
	);

	if (isTransformativeData(item)) {
		const halfWidth = nanToZero(item.width / 2);
		const halfHeight = nanToZero(item.height / 2);
		const itemRadians = degreesToRadians(item.rotation - groupRotation);

		const leftTop = rotatePoint(
			inversedCenter.x - halfWidth,
			inversedCenter.y - halfHeight,
			inversedCenter.x,
			inversedCenter.y,
			itemRadians,
		);

		const rightTop = rotatePoint(
			inversedCenter.x + halfWidth,
			inversedCenter.y - halfHeight,
			inversedCenter.x,
			inversedCenter.y,
			itemRadians,
		);

		const leftBottom = rotatePoint(
			inversedCenter.x - halfWidth,
			inversedCenter.y + halfHeight,
			inversedCenter.x,
			inversedCenter.y,
			itemRadians,
		);

		const rightBottom = rotatePoint(
			inversedCenter.x + halfWidth,
			inversedCenter.y + halfHeight,
			inversedCenter.x,
			inversedCenter.y,
			itemRadians,
		);

		return {
			top: Math.min(leftTop.y, rightBottom.y, leftBottom.y, rightTop.y),
			left: Math.min(leftTop.x, rightBottom.x, leftBottom.x, rightTop.x),
			bottom: Math.max(leftTop.y, rightBottom.y, leftBottom.y, rightTop.y),
			right: Math.max(leftTop.x, rightBottom.x, leftBottom.x, rightTop.x),
		};
	}

	return {
		top: inversedCenter.y,
		left: inversedCenter.x,
		bottom: inversedCenter.y,
		right: inversedCenter.x,
	};
};

/**
 * グループの回転を戻した時の、グループの四辺の座標を計算する
 *
 * @param changeItem - グループ内の変更された図形
 * @param items - グループ内の図形リスト
 * @param groupCenterX - グループの中心X座標
 * @param groupCenterY - グループの中心Y座標
 * @param groupRotation - グループの回転角度
 * @returns グループの四辺の座標
 */
export const calcGroupBoxOfNoRotation = (
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
		const itemItems = isItemableData(item)
			? (item.items ?? []).filter((i) => i.type !== "ConnectPoint")
			: [];
		if (itemItems.length > 0) {
			const groupBox = calcGroupBoxOfNoRotation(
				itemItems,
				groupCenterX,
				groupCenterY,
				groupRotation,
				changeItem,
			);
			top = Math.min(top, groupBox.top);
			bottom = Math.max(bottom, groupBox.bottom);
			left = Math.min(left, groupBox.left);
			right = Math.max(right, groupBox.right);
		} else {
			const box = calcItemBoxOfNoGroupRotation(
				item.id === changeItem?.id ? changeItem : item,
				groupCenterX,
				groupCenterY,
				groupRotation,
			);
			top = Math.min(top, box.top);
			bottom = Math.max(bottom, box.bottom);
			left = Math.min(left, box.left);
			right = Math.max(right, box.right);
		}
	}

	return {
		top,
		bottom,
		left,
		right,
	};
};

export const calcBoundsOfGroup = (group: GroupData): Bounds => {
	const { items, x, y, rotation } = group;
	const radians = degreesToRadians(rotation);
	const box = calcGroupBoxOfNoRotation(items, x, y, rotation);
	const leftTop = rotatePoint(box.left, box.top, x, y, radians);
	const rightBottom = rotatePoint(box.right, box.bottom, x, y, radians);

	return {
		x: leftTop.x + nanToZero(rightBottom.x - leftTop.x) / 2,
		y: leftTop.y + nanToZero(rightBottom.y - leftTop.y) / 2,
		width: box.right - box.left,
		height: box.bottom - box.top,
	};
};
