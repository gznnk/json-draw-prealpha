// Reactのインポート
import React, { memo, useCallback, useEffect, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type {
	CreateDiagramProps,
	Diagram,
	GroupData,
} from "../../types/DiagramTypes";
import { DiagramTypeComponentMap } from "../../types/DiagramTypes";
import type {
	ConnectPointsMoveEvent,
	DiagramConnectEvent,
	DiagramDragEvent,
	DiagramSelectEvent,
	DiagramTransformEvent,
	ItemableChangeEvent,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import Transformative from "../core/Transformative";

// SvgCanvas関連関数をインポート
import {
	isItemableData,
	isSelectableData,
	isTransformativeData,
} from "../../functions/Diagram";
import { degreesToRadians, nanToZero, rotatePoint } from "../../functions/Math";

/**
 * グループのプロパティ
 */
export type GroupProps = CreateDiagramProps<
	GroupData,
	{
		selectable: true;
		transformative: true;
		itemable: true;
		connectable: true;
	}
>;

/**
 * グループコンポーネント
 */
const Group: React.FC<GroupProps> = ({
	id,
	x,
	y,
	visible = true,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	keepProportion,
	isSelected,
	items,
	showConnectPoints = true,
	onDrag,
	onClick,
	onSelect,
	onTransform,
	onItemableChange,
	onConnect,
	onConnectPointsMove,
}) => {
	// グループ全体のドラッグ中かどうかのフラグ（このグループが選択中でかつドラッグ中の場合のみtrueにする）
	const [isGroupDragging, setIsGroupDragging] = useState(false);
	// グループ全体の変形中かのフラグ
	const [isGroupTransforming, setIsGroupTransforming] = useState(false);

	// グループ連続選択フラグ。グループ連続選択とは、グループ内の図形（同じ図形でなくてよい）を連続して選択する操作のこと。
	// このグループが選択中でかつ再度グループ内の図形でポインター押下された場合のみtrueにする
	const isSequentialSelection = useRef(false);

	// ドラッグ・変形開始時の子図形のリスト
	const startItems = useRef<Diagram[]>(items);
	// ドラッグ・変形開始時のグループの形状
	const startBox = useRef({ x, y, width, height });

	/**
	 * 子図形の変更時にグループのアウトラインを更新する
	 *
	 * @param changeItem - 変更された子図形
	 */
	const transformGroupOutline = (changeItem?: Diagram) => {
		const radians = degreesToRadians(rotation);
		const box = calcGroupBoxOfNoRotation(items, x, y, rotation, changeItem);
		const leftTop = rotatePoint(box.left, box.top, x, y, radians);
		const rightBottom = rotatePoint(box.right, box.bottom, x, y, radians);

		onTransform?.({
			eventType: "End",
			id,
			startShape: {
				x,
				y,
				width,
				height,
				rotation,
				scaleX,
				scaleY,
			},
			endShape: {
				x: leftTop.x + (rightBottom.x - leftTop.x) / 2,
				y: leftTop.y + (rightBottom.y - leftTop.y) / 2,
				width: box.right - box.left,
				height: box.bottom - box.top,
				rotation,
				scaleX,
				scaleY,
			},
		});
	};

	// ハンドラ生成の頻発を回避するため、参照する値をuseRefで保持する
	const refBusVal = {
		// プロパティ
		id,
		x,
		y,
		width,
		height,
		isSelected,
		items,
		onDrag,
		onClick,
		onSelect,
		onTransform,
		onItemableChange,
		onConnect,
		onConnectPointsMove,
		// 内部変数・内部関数
		isGroupDragging,
		transformGroupOutline,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * グループ内の図形の選択イベントハンドラ
	 */
	const handleChildDiagramSelect = useCallback((e: DiagramSelectEvent) => {
		const { id, isSelected, items, onSelect } = refBus.current;

		const selectedChild = getSelectedChildDiagram(items);
		if (!selectedChild) {
			// グループ内の図形が選択されていない場合は、このグループの選択イベントを発火させる。
			// これにより、グループ内の図形が選択されていないグループのうち、最も上位のグループのイベントが
			// SvgCanvasまで伝番され、そのグループが選択状態になる。
			onSelect?.({
				id,
			});
		} else if (selectedChild.id !== e.id) {
			// グループ内の図形が選択されていて、かつグループ内の別の図形が選択された場合、その図形を選択状態にする
			onSelect?.(e);
		}

		if (isSelected) {
			// グループ連続選択時のクリック（ポインターアップ）時に、グループ内でクリックされた図形を選択状態にしたいので、
			// フラグを立てておき、クリックイベント側で参照する。
			isSequentialSelection.current = true;
		}
	}, []);

	/**
	 * グループ内の図形のクリックイベントハンドラ
	 */
	const handleChildDiagramClick = useCallback((e: DiagramSelectEvent) => {
		const { id, onSelect, onClick } = refBus.current;

		if (isSequentialSelection.current) {
			// グループ連続選択時のクリック（ポインターアップ）時であれば、そのグループ内の図形を選択状態にする。
			// これにより、グループがネストしている場合は、選択の階層が１つずつ下がっていき、最終的にクリックされた図形が選択される。
			onSelect?.(e);
			isSequentialSelection.current = false;
		} else {
			// グループ連続選択時でない場合は、このグループのクリックイベントを発火させる。
			// これにより、連続選択でないグループのうち、最も上位のグループのクリックイベントが
			// 連続選択されたグループまで伝番し、そのグループの連続選択時の処理（当該分岐のtrue側）が実行され、
			// その直下のグループが選択状態になる。
			onClick?.({
				id,
			});
		}
	}, []);

	// グループの選択状態制御
	useEffect(() => {
		// グループから選択が外れたら連続選択フラグも解除
		if (!isSelected) {
			isSequentialSelection.current = false;
		}
	}, [isSelected]);

	/**
	 * グループ内の図形のドラッグ中イベントハンドラ
	 */
	const handleChildDiagramDrag = useCallback((e: DiagramDragEvent) => {
		const {
			id,
			x,
			y,
			width,
			height,
			isSelected,
			items,
			onDrag,
			onItemableChange,
			isGroupDragging,
			transformGroupOutline,
		} = refBus.current;

		// ドラッグ開始時の処理
		if (e.eventType === "Start") {
			if (!isSelected) {
				// グループ選択時でなければ、ドラッグイベントをそのまま伝番し、
				// 選択されている図形のみ移動を行う
				onDrag?.(e);
			} else {
				// グループ選択時であれば、グループ全体をドラッグ可能にする
				setIsGroupDragging(true);

				// ドラッグ開始時のグループの形状を記憶
				startItems.current = items;
				startBox.current = { x, y, width, height };

				// グループ全体の変更開始を通知
				onItemableChange?.({
					eventType: "Start",
					id,
					items,
				});
			}
			return;
		}

		// 以降ドラッグ中・ドラッグ終了時の処理
		if (!isGroupDragging) {
			if (e.eventType === "End") {
				// グループ全体のドラッグでない場合、ドラッグ終了時に
				// 子図形のドラッグに伴うアウトラインの更新を行う
				const changeItem = getChildDiagramById(items, e.id);
				if (changeItem) {
					transformGroupOutline({
						...changeItem,
						x: e.endX,
						y: e.endY,
					} as Diagram);
				}
			}

			// グループ全体のドラッグでなければ、ドラッグイベントをそのまま伝番し、
			// 選択されている図形のみ移動を行う
			onDrag?.(e);
		} else {
			// グループ全体のドラッグの場合、グループ内の図形を再帰的に移動させる
			const dx = e.endX - e.startX;
			const dy = e.endY - e.startY;

			// グループ内の図形を再帰的に移動させる（接続ポイントも含む）
			const moveRecursive = (diagrams: Diagram[]) => {
				const newItems: Diagram[] = [];
				for (const item of diagrams) {
					const newItem = { ...item, x: item.x + dx, y: item.y + dy };
					if (isItemableData(newItem)) {
						newItem.items = moveRecursive(newItem.items ?? []);
					}
					newItems.push(newItem);
				}

				return newItems;
			};

			const event: ItemableChangeEvent = {
				eventType: e.eventType,
				id,
				x: startBox.current.x + dx,
				y: startBox.current.y + dy,
				items: moveRecursive(startItems.current),
			};

			// グループ内の全ての図形の移動をまとめて通知
			onItemableChange?.(event);
		}

		// ドラッグ終了時にドラッグ中フラグを解除
		if (e.eventType === "End") {
			setIsGroupDragging(false);
		}
	}, []);

	/**
	 * グループ内の図形の変形イベントハンドラ
	 */
	const handleChildDiagramTransfrom = useCallback(
		(e: DiagramTransformEvent) => {
			const { items, onTransform, isGroupDragging, transformGroupOutline } =
				refBus.current;

			if (e.eventType === "End" && !isGroupDragging) {
				// グループ内の図形の変形完了時にアウトラインの更新を行う
				// ただし、グループ全体のドラッグ中に来る変形通知は子供のグループのアウトライン更新通知で、
				// ここでアウトライン更新するとドラッグ側のアウトライン更新と競合してしまうため、
				// グループ全体のドラッグ中はアウトライン更新を行わない
				const changeItem = getChildDiagramById(items, e.id);
				if (changeItem) {
					transformGroupOutline({
						...changeItem,
						...e.endShape,
					} as Diagram);
				}
			}

			// アウトライン以外はグループへの影響はないので、変形イベントをそのまま伝番する
			onTransform?.(e);
		},
		[],
	);

	/**
	 * グループ内の図形の変更イベントハンドラ
	 */
	const handleChildItemableChange = useCallback((e: ItemableChangeEvent) => {
		const { items, transformGroupOutline, onItemableChange } = refBus.current;

		// グループ内の図形の変更完了時にアウトラインの更新を行う
		const changeItem = getChildDiagramById(items, e.id);
		if (changeItem) {
			transformGroupOutline({
				...changeItem,
				...e,
			} as Diagram);
		}

		// アウトライン以外はグループへの影響はないので、変更イベントをそのまま伝番する
		onItemableChange?.(e);
	}, []);

	/**
	 * グループ内の図形の接続イベントハンドラ
	 */
	const handleChildDiagramConnect = useCallback((e: DiagramConnectEvent) => {
		const { onConnect } = refBus.current;

		// 特にすることはないのでそのまま伝番する
		onConnect?.(e);
	}, []);

	/**
	 * グループ内の図形の接続ポイント移動イベントハンドラ
	 */
	const handleChildDiagramConnectPointsMove = useCallback(
		(e: ConnectPointsMoveEvent) => {
			const { isSelected, onConnectPointsMove } = refBus.current;
			if (isSelected) {
				// グループが選択されている場合は、ドラッグもしくは変形側のハンドリング内で
				// グループ内の図形全ての接続ポイントの移動処理を行うので、ここでは何もしない
				return;
			}

			// グループが選択されていない場合は、接続ポイントの移動イベントをそのまま伝番する
			onConnectPointsMove?.(e);
		},
		[],
	);

	/**
	 * グループの変形イベントハンドラ
	 */
	const handleTransform = useCallback((e: DiagramTransformEvent) => {
		const { id, x, y, width, height, items, onItemableChange } = refBus.current;

		// グループの変形開始時の処理
		if (e.eventType === "Start") {
			// 変形開始時のグループの形状を記憶
			startBox.current = { x, y, width, height };
			startItems.current = items;

			// まだ何も変形してないので、開始の通知のみ行う
			onItemableChange?.({
				eventType: "Start",
				id,
				items,
			});

			setIsGroupTransforming(true);
			return;
		}

		// 以降グループの変形中・変形終了時の処理

		// グループの拡縮を計算
		const groupScaleX = e.endShape.width / e.startShape.width;
		const groupScaleY = e.endShape.height / e.startShape.height;

		// グループ内の図形を再帰的に変形させる（接続ポイントも含む）
		const transformRecursive = (diagrams: Diagram[]) => {
			const newItems: Diagram[] = [];
			for (const item of diagrams) {
				const inversedItemCenter = rotatePoint(
					item.x,
					item.y,
					e.startShape.x,
					e.startShape.y,
					degreesToRadians(-e.startShape.rotation),
				);
				const dx =
					(inversedItemCenter.x - e.startShape.x) *
					e.startShape.scaleX *
					e.endShape.scaleX;
				const dy =
					(inversedItemCenter.y - e.startShape.y) *
					e.startShape.scaleY *
					e.endShape.scaleY;

				const newDx = dx * groupScaleX;
				const newDy = dy * groupScaleY;

				let newCenter = {
					x: e.endShape.x + newDx,
					y: e.endShape.y + newDy,
				};
				newCenter = rotatePoint(
					newCenter.x,
					newCenter.y,
					e.endShape.x,
					e.endShape.y,
					degreesToRadians(e.endShape.rotation),
				);

				if (isTransformativeData(item)) {
					const rotationDiff = e.endShape.rotation - e.startShape.rotation;
					const newRotation = item.rotation + rotationDiff;

					newItems.push({
						...item,
						x: newCenter.x,
						y: newCenter.y,
						width: item.width * groupScaleX,
						height: item.height * groupScaleY,
						rotation: newRotation,
						scaleX: e.endShape.scaleX,
						scaleY: e.endShape.scaleY,
						items: isItemableData(item)
							? transformRecursive(item.items ?? [])
							: undefined,
					} as Diagram);
				} else {
					newItems.push({
						...item,
						x: newCenter.x,
						y: newCenter.y,
					});
				}
			}

			return newItems;
		};

		const event: ItemableChangeEvent = {
			eventType: e.eventType,
			id,
			...e.endShape,
			items: transformRecursive(startItems.current),
		};

		// グループ内の全ての図形の変形をまとめて通知
		onItemableChange?.(event);

		if (e.eventType === "End") {
			setIsGroupTransforming(false);
		}
	}, []);

	const doShowConnectPoints =
		showConnectPoints && !isGroupDragging && !isGroupTransforming;

	// グループ内の図形の作成
	const children = items.map((item) => {
		const itemType = DiagramTypeComponentMap[item.type];
		const props = {
			...item,
			key: item.id,
			showConnectPoints: doShowConnectPoints,
			onClick: handleChildDiagramClick,
			onSelect: handleChildDiagramSelect,
			onDrag: handleChildDiagramDrag,
			onTransform: handleChildDiagramTransfrom,
			onItemableChange: handleChildItemableChange,
			onConnect: handleChildDiagramConnect,
			onConnectPointsMove: handleChildDiagramConnectPointsMove,
		};

		return React.createElement(itemType, props);
	});

	return (
		<>
			{children}
			{visible && !isGroupDragging && (
				<Transformative
					id={id}
					type="Group"
					x={x}
					y={y}
					width={width}
					height={height}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
					keepProportion={keepProportion}
					isSelected={isSelected}
					onTransform={handleTransform}
				/>
			)}
		</>
	);
};

export default memo(Group);

/**
 * 選択されたグループ内の図形を、配下のグループも含めて再帰的に取得する
 *
 * @param {Diagram[]} diagrams 図形リスト
 * @returns {string | undefined} 選択されたグループ内の図形
 */
const getSelectedChildDiagram = (diagrams: Diagram[]): Diagram | undefined => {
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
const getChildDiagramById = (
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
const calcItemBoxOfNoGroupRotation = (
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
