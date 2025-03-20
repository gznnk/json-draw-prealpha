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
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	keepProportion,
	isSelected,
	items,
	showConnectPoints = true,
	onDragStart,
	onDrag,
	onDragEnd,
	onClick,
	onSelect,
	onTransform,
	onTransformEnd,
	onItemableChange,
	onConnect,
}) => {
	// グループ全体のドラッグ中かどうかのフラグ（このグループが選択中でかつドラッグ中の場合のみtrueにする）
	const [isDragging, setIsDragging] = useState(false);
	// 変形中かのフラグ
	const [isTransformimg, setIsTransforming] = useState(false);

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
		onDragStart,
		onDrag,
		onDragEnd,
		onClick,
		onSelect,
		onTransform,
		onTransformEnd,
		onItemableChange,
		onConnect,
		// 内部変数・内部関数
		isDragging,
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
	 * グループ内の図形のドラッグ開始イベントハンドラ
	 */
	const handleChildDiagramDragStart = useCallback((e: DiagramDragEvent) => {
		const { x, y, width, height, isSelected, items, onDragStart } =
			refBus.current;

		if (isSelected) {
			// グループ選択時であれば、グループ全体をドラッグ可能にする
			setIsDragging(true);
		}

		// ドラッグ開始イベントをそのまま伝番させる
		onDragStart?.(e);

		// ドラッグ開始時のグループの形状を記憶
		startItems.current = items;
		startBox.current = { x, y, width, height };
	}, []);

	/**
	 * グループ内の図形のドラッグ中イベントハンドラ
	 */
	const handleChildDiagramDrag = useCallback((e: DiagramDragEvent) => {
		const { id, onDrag, onItemableChange, isDragging } = refBus.current;

		if (!isDragging) {
			// グループのドラッグでなければ、ドラッグイベントをそのまま伝番
			onDrag?.(e);
			return;
		}

		// グループ内の図形を再帰的に移動させる

		const dx = e.endX - e.startX;
		const dy = e.endY - e.startY;

		const moveRecursive = (diagrams: Diagram[]) => {
			const events: ItemableChangeEvent[] = [];
			for (const item of diagrams) {
				events.push({
					...item,
					x: item.x + dx,
					y: item.y + dy,
					items: isItemableData(item)
						? moveRecursive(item.items ?? [])
						: undefined,
				});

				// TODO: 接続ポイントの移動
			}

			return events as Diagram[];
		};

		const event: ItemableChangeEvent = {
			id,
			x: startBox.current.x + dx,
			y: startBox.current.y + dy,
			items: moveRecursive(startItems.current),
		};

		onItemableChange?.(event);
	}, []);

	/**
	 * グループ内の図形のドラッグ完了イベントハンドラ
	 */
	const handleChildDiagramDragEnd = useCallback((e: DiagramDragEvent) => {
		const { items, onDragEnd, isDragging, transformGroupOutline } =
			refBus.current;

		if (!isDragging) {
			// グループのドラッグでなければ、子図形のドラッグに伴うアウトラインの更新を行う
			const changeItem = getChildDiagramById(items, e.id);
			if (changeItem) {
				transformGroupOutline({
					...changeItem,
					x: e.endX,
					y: e.endY,
				} as Diagram);
			}
		}

		// TODO: このイベント内でもグループ図形の移動を行う

		onDragEnd?.(e);
		setIsDragging(false);
	}, []);

	/**
	 * グループ内の図形の変形イベントハンドラ
	 */
	const handleChildDiagramTransfrom = useCallback(
		(e: DiagramTransformEvent) => {
			const { onTransform } = refBus.current;
			onTransform?.(e);
		},
		[],
	);

	/**
	 * グループ内の図形の変形完了イベントハンドラ
	 */
	const handleChildDiagramTransfromEnd = useCallback(
		(e: DiagramTransformEvent) => {
			const { items, onTransformEnd, transformGroupOutline } = refBus.current;

			// アウトラインの更新
			const changeItem = getChildDiagramById(items, e.id);
			if (changeItem) {
				transformGroupOutline({
					...changeItem,
					...e.endShape,
				} as Diagram);
			}

			onTransformEnd?.(e);
		},
		[],
	);

	/**
	 * グループ内の図形の変更イベントハンドラ
	 */
	const handleChildItemableChange = useCallback((e: ItemableChangeEvent) => {
		const { items, transformGroupOutline, onItemableChange } = refBus.current;

		// アウトラインの更新
		const changeItem = getChildDiagramById(items, e.id);
		if (changeItem) {
			transformGroupOutline({
				...changeItem,
				...e,
			} as Diagram);
		}

		onItemableChange?.(e);
	}, []);

	/**
	 * グループ内の図形の接続イベントハンドラ
	 */
	const handleChildDiagramConnect = useCallback((e: DiagramConnectEvent) => {
		const { onConnect } = refBus.current;
		onConnect?.(e);
	}, []);

	/**
	 * グループの変形開始イベントハンドラ
	 */
	const handleTransformStart = useCallback(() => {
		setIsTransforming(true);

		const { x, y, width, height, items } = refBus.current;

		startBox.current = { x, y, width, height };
		startItems.current = items;
	}, []);

	const handleTransform = useCallback((e: DiagramTransformEvent) => {
		const { id, onItemableChange } = refBus.current;

		// グループの拡縮を計算
		const groupScaleX = e.endShape.width / e.startShape.width;
		const groupScaleY = e.endShape.height / e.startShape.height;

		const transformRecursive = (diagrams: Diagram[]) => {
			const events: ItemableChangeEvent[] = [];
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

					events.push({
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
					});
				} else {
					events.push({
						...item,
						x: newCenter.x,
						y: newCenter.y,
					});
				}
			}

			return events as Diagram[];
		};

		const event: ItemableChangeEvent = {
			id,
			...e.endShape,
			items: transformRecursive(startItems.current),
		};

		onItemableChange?.(event);
	}, []);

	const handleTransformEnd = useCallback((_e: DiagramTransformEvent) => {
		setIsTransforming(false);
		// TODO: 伝番させる
	}, []);

	const doShowConnectPoints =
		showConnectPoints && !isDragging && !isTransformimg;

	// グループ内の図形の作成
	const children = items.map((item) => {
		const itemType = DiagramTypeComponentMap[item.type];
		const props = {
			...item,
			key: item.id,
			showConnectPoints: doShowConnectPoints,
			onClick: handleChildDiagramClick,
			onSelect: handleChildDiagramSelect,
			onDragStart: handleChildDiagramDragStart,
			onDrag: handleChildDiagramDrag,
			onDragEnd: handleChildDiagramDragEnd,
			onTransform: handleChildDiagramTransfrom,
			onTransformEnd: handleChildDiagramTransfromEnd,
			onItemableChange: handleChildItemableChange,
			onConnect: handleChildDiagramConnect,
		};

		return React.createElement(itemType, props);
	});

	return (
		<>
			{children}
			{!isDragging && (
				<Transformative
					diagramId={id}
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
					onTransformStart={handleTransformStart}
					onTransform={handleTransform}
					onTransformEnd={handleTransformEnd}
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
const calcGroupBoxOfNoRotation = (
	items: Diagram[],
	groupCenterX: number,
	groupCenterY: number,
	groupRotation: number,
	changeItem?: Diagram,
) => {
	// グループ内の図形を再帰的に取得し、グループの四辺の座標を計算する
	let top = Number.POSITIVE_INFINITY;
	let left = Number.POSITIVE_INFINITY;
	let bottom = Number.NEGATIVE_INFINITY;
	let right = Number.NEGATIVE_INFINITY;

	for (const item of items) {
		if (isItemableData(item)) {
			const groupBox = calcGroupBoxOfNoRotation(
				item.items,
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
