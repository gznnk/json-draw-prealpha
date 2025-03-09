// Reactのインポート
import React, { memo, useCallback, useEffect, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../types/CoordinateTypes";
import type { Diagram, GroupData } from "../../types/DiagramTypes";
import { DiagramTypeComponentMap } from "../../types/DiagramTypes";
import type {
	DiagramDragEvent,
	DiagramSelectEvent,
	DiagramTransformEvent,
	GroupDataChangeEvent,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import type { RectangleBaseProps } from "../core/RectangleBase";
import Transformative from "../core/Transformative";

// SvgCanvas関連関数をインポート
import { isGroupData, isRectangleBaseData } from "../../SvgCanvasFunctions";
import { degreesToRadians, nanToZero, rotatePoint } from "../../functions/Math";
// import { drawPoint, drawRect } from "../../functions/Svg";

// ユーティリティをインポート
// import { getLogger } from "../../../../../utils/Logger";

// ロガーを取得
// const logger = getLogger("Group");

/**
 * 選択されたグループ内の図形を、配下のグループも含めて再帰的に取得する
 *
 * @param {Diagram[]} diagrams 図形リスト
 * @returns {string | undefined} 選択されたグループ内の図形
 */
const getSelectedChildDiagram = (diagrams: Diagram[]): Diagram | undefined => {
	for (const diagram of diagrams) {
		if (diagram.isSelected) {
			return diagram;
		}
		if (isGroupData(diagram)) {
			const ret = getSelectedChildDiagram(diagram.items || []);
			if (ret) {
				return ret;
			}
		}
	}
};

const getChildDiagramById = (
	diagrams: Diagram[],
	id: string,
): Diagram | undefined => {
	for (const diagram of diagrams) {
		if (diagram.id === id) {
			return diagram;
		}
		if (isGroupData(diagram)) {
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
 * @param groupCenterPoint - グループの中心座標
 * @param groupRotation - グループの回転角度
 * @returns 図形の四辺の座標
 */
const calcItemBoxOfNoGroupRotation = (
	item: Diagram,
	groupCenterPoint: Point,
	groupRotation: number,
) => {
	const groupRadians = degreesToRadians(-groupRotation);

	if (isRectangleBaseData(item)) {
		const halfWidth = nanToZero(item.width / 2);
		const halfHeight = nanToZero(item.height / 2);
		const itemRadians = degreesToRadians(item.rotation - groupRotation);

		const inversedCenter = rotatePoint(
			item.point,
			groupCenterPoint,
			groupRadians,
		);

		const leftTop = rotatePoint(
			{ x: inversedCenter.x - halfWidth, y: inversedCenter.y - halfHeight },
			inversedCenter,
			itemRadians,
		);

		const rightTop = rotatePoint(
			{ x: inversedCenter.x + halfWidth, y: inversedCenter.y - halfHeight },
			inversedCenter,
			itemRadians,
		);

		const leftBottom = rotatePoint(
			{ x: inversedCenter.x - halfWidth, y: inversedCenter.y + halfHeight },
			inversedCenter,
			itemRadians,
		);

		const rightBottom = rotatePoint(
			{ x: inversedCenter.x + halfWidth, y: inversedCenter.y + halfHeight },
			inversedCenter,
			itemRadians,
		);

		return {
			top: Math.min(leftTop.y, rightBottom.y, leftBottom.y, rightTop.y),
			left: Math.min(leftTop.x, rightBottom.x, leftBottom.x, rightTop.x),
			bottom: Math.max(leftTop.y, rightBottom.y, leftBottom.y, rightTop.y),
			right: Math.max(leftTop.x, rightBottom.x, leftBottom.x, rightTop.x),
		};
	}

	// TODO
	return {
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
	};
};

/**
 * グループの回転を戻した時の、グループの四辺の座標を計算する
 *
 * @param changeItem - グループ内の変更された図形
 * @param items - グループ内の図形リスト
 * @param groupCenterPoint - グループの中心座標
 * @param groupRotation - グループの回転角度
 * @returns グループの四辺の座標
 */
const calcGroupBoxOfNoRotation = (
	items: Diagram[],
	groupCenterPoint: Point,
	groupRotation: number,
	changeItem?: Diagram,
) => {
	// グループ内の図形を再帰的に取得し、グループの四辺の座標を計算する
	let top = Number.POSITIVE_INFINITY;
	let left = Number.POSITIVE_INFINITY;
	let bottom = Number.NEGATIVE_INFINITY;
	let right = Number.NEGATIVE_INFINITY;

	for (const item of items) {
		if (isGroupData(item)) {
			const groupBox = calcGroupBoxOfNoRotation(
				item.items ?? [],
				groupCenterPoint,
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
				groupCenterPoint,
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

// TODO: JSDoc最新化
/**
 * グループのPropsの型定義
 *
 * @type {Object} GroupProps
 * @property {string} [id] ID
 * @property {Point} [point] 左上の頂点の座標
 * @property {number} [width] 幅
 * @property {number} [height] 高さ
 * @property {boolean} [keepProportion] アスペクト比を保持するかどうか
 * @property {boolean} [isSelected] 選択されているかどうか
 * @property {(e: DiagramClickEvent) => void} [onDiagramClick] グループ内の図形のクリック時のイベントハンドラ
 * @property {(e: DiagramResizeEvent) => void} [onDiagramResizeStart] グループ・グループ内の図形のリサイズ開始時のイベントハンドラ
 * @property {(e: DiagramResizeEvent) => void} [onDiagramResizing] グループ・グループ内の図形のリサイズ中のイベントハンドラ
 * @property {(e: DiagramResizeEvent) => void} [onDiagramResizeEnd] グループ・グループ内の図形のリサイズ終了時のイベントハンドラ
 * @property {(e: DiagramDragEvent) => void} [onDiagramDragStart] グループ内の図形のドラッグ開始時のイベントハンドラ（グループのドラッグはグループ内の図形のドラッグに連動して行わせるため、グループ自体のドラッグは存在しない）
 * @property {(e: DiagramDragEvent) => void} [onDiagramDrag] グループ内の図形のドラッグ中のイベントハンドラ（グループのドラッグはグループ内の図形のドラッグに連動して行わせるため、グループ自体のドラッグは存在しない）
 * @property {(e: DiagramDragEvent) => void} [onDiagramDragEnd] グループ内の図形のドラッグ終了時のイベントハンドラ（グループのドラッグはグループ内の図形のドラッグに連動して行わせるため、グループ自体のドラッグは存在しない）
 * @property {(e: DiagramDragDropEvent) => void} [onDiagramDrop] グループ内の図形のドラッグ＆ドロップ時のイベントハンドラ
 * @property {(e: DiagramDragEvent) => void} [onDiagramDragEndByGroup] グループ全体の移動に伴うグループ内の図形のドラッグ終了時のイベントハンドラ
 * @property {(e: DiagramSelectEvent) => void} [onDiagramSelect] 選択時のイベントハンドラ
 * @property {(e: DiagramConnectEvent) => void} [onDiagramConnect] 図形の接続時のイベントハンドラ
 * @property {Diagram[]} [items] グループ内の図形リスト
 * @property {React.Ref<DiagramRef>} [ref] 親グループのドラッグ・リサイズ時に、親グループ側から実行してもらう関数への参照
 */
export type GroupProps = RectangleBaseProps &
	GroupData & {
		onGroupDataChange?: (e: GroupDataChangeEvent) => void;
	};

/**
 * グループコンポーネント
 */
const Group: React.FC<GroupProps> = ({
	id,
	point,
	width,
	height,
	rotation = 0,
	scaleX = 1,
	scaleY = 1,
	keepProportion = false,
	isSelected = false,
	onTransform,
	onDiagramClick,
	onDiagramDragStart,
	onDiagramDrag,
	onDiagramDragEnd,
	onDiagramSelect,
	onGroupDataChange,
	items = [],
}) => {
	// logger.debug("Group items", items);

	// グループ全体のドラッグ中かどうかのフラグ（このグループが選択中でかつドラッグ中の場合のみtrueにする）
	const [isDragging, setIsDragging] = useState(false);
	// グループ連続選択フラグ。グループ連続選択とは、グループ内の図形（同じ図形でなくてよい）を連続して選択する操作のこと。
	// このグループが選択中でかつ再度グループ内の図形でポインター押下された場合のみtrueにする
	const [isSequentialSelection, setIsSequentialSelection] = useState(false);

	const startItems = useRef<Diagram[]>(items);
	const startBox = useRef({ x: point.x, y: point.y, width, height });

	// --- 以下、図形選択関連処理 ---

	/**
	 * グループ内の図形の選択イベントハンドラ
	 *
	 * @param {DiagramSelectEvent} e 図形選択イベント
	 * @returns {void}
	 */
	const handleChildDiagramSelect = useCallback(
		(e: DiagramSelectEvent) => {
			const selectedChild = getSelectedChildDiagram(items);
			if (!selectedChild) {
				// グループ内の図形が選択されていない場合は、このグループの選択イベントを発火させる。
				// これにより、グループ内の図形が選択されていないグループのうち、最も上位のグループのイベントが
				// SvgCanvasまで伝番され、そのグループが選択状態になる。
				onDiagramSelect?.({
					id,
				});
			} else if (selectedChild.id !== e.id) {
				// グループ内の図形が選択されていて、かつグループ内の別の図形が選択された場合、その図形を選択状態にする
				onDiagramSelect?.(e);
			}

			if (isSelected) {
				// グループ連続選択時のクリック（ポインターアップ）時に、グループ内でクリックされた図形を選択状態にしたいので、
				// フラグを立てておき、クリックイベント側で参照する。
				setIsSequentialSelection(true);
			}
		},
		[onDiagramSelect, id, isSelected, items],
	);

	/**
	 * グループ内の図形のクリックイベントハンドラ
	 *
	 * @param {DiagramSelectEvent} e 図形選択イベント
	 * @returns {void}
	 */
	const handleChildDiagramClick = useCallback(
		(e: DiagramSelectEvent) => {
			if (isSequentialSelection) {
				// グループ連続選択時のクリック（ポインターアップ）時であれば、そのグループ内の図形を選択状態にする。
				// これにより、グループがネストしている場合は、選択の階層が１つずつ下がっていき、最終的にクリックされた図形が選択される。
				onDiagramSelect?.(e);
				setIsSequentialSelection(false);
			} else {
				// グループ連続選択時でない場合は、このグループのクリックイベントを発火させる。
				// これにより、連続選択でないグループのうち、最も上位のグループのクリックイベントが
				// 連続選択されたグループまで伝番し、そのグループの連続選択時の処理（当該分岐のtrue側）が実行され、
				// その直下のグループが選択状態になる。
				onDiagramClick?.({
					id,
				});
			}
		},
		[onDiagramSelect, onDiagramClick, isSequentialSelection, id],
	);

	useEffect(() => {
		// グループから選択が外れたら連続選択フラグも解除
		if (!isSelected) {
			setIsSequentialSelection(false);
		}
	}, [isSelected]);

	const transformGroupOutline = useCallback(
		(changeItem?: Diagram) => {
			const box = calcGroupBoxOfNoRotation(items, point, rotation, changeItem);
			const leftTop = rotatePoint(
				{ x: box.left, y: box.top },
				point,
				degreesToRadians(rotation),
			);
			const rightBottom = rotatePoint(
				{ x: box.right, y: box.bottom },
				point,
				degreesToRadians(rotation),
			);
			onTransform?.({
				id,
				startShape: {
					point,
					width,
					height,
					rotation,
					scaleX,
					scaleY,
				},
				endShape: {
					point: {
						x: leftTop.x + (rightBottom.x - leftTop.x) / 2,
						y: leftTop.y + (rightBottom.y - leftTop.y) / 2,
					},
					width: box.right - box.left,
					height: box.bottom - box.top,
					rotation,
					scaleX,
					scaleY,
				},
			});
		},
		[onTransform, id, point, width, height, rotation, scaleX, scaleY, items],
	);

	/**
	 * グループ内の図形のドラッグ開始イベントハンドラ
	 *
	 * @param {DiagramDragEvent} _e 図形ドラッグ開始イベント
	 */
	const handleChildDiagramDragStart = useCallback(
		(e: DiagramDragEvent) => {
			if (isSelected) {
				// グループ選択時であれば、グループ全体をドラッグ可能にする
				setIsDragging(true);
			}

			// ドラッグ開始イベントをそのまま伝番させる
			onDiagramDragStart?.(e);

			// ドラッグ開始時のグループの形状を記憶
			startItems.current = items;
			startBox.current = { x: point.x, y: point.y, width, height };
		},
		[onDiagramDragStart, point, width, height, isSelected, items],
	);

	/**
	 * グループ内の図形のドラッグ中イベントハンドラ
	 *
	 * @param {DiagramDragEvent} e 図形ドラッグ中イベント
	 */
	const handleChildDiagramDrag = useCallback(
		(e: DiagramDragEvent) => {
			if (!isDragging) {
				// グループのドラッグでなければ、ドラッグイベントをそのまま伝番
				onDiagramDrag?.(e);
				return;
			}

			// グループ内の図形を再帰的に移動させる

			const dx = e.endPoint.x - e.startPoint.x;
			const dy = e.endPoint.y - e.startPoint.y;

			const moveRecursive = (diagrams: Diagram[]) => {
				const events: GroupDataChangeEvent[] = [];
				for (const item of diagrams) {
					events.push({
						...item,
						point: {
							x: item.point.x + dx,
							y: item.point.y + dy,
						},
						items: isGroupData(item)
							? moveRecursive(item.items ?? [])
							: undefined,
					});
				}

				return events as Diagram[];
			};

			const event: GroupDataChangeEvent = {
				id,
				point: {
					x: startBox.current.x + dx,
					y: startBox.current.y + dy,
				},
				items: moveRecursive(startItems.current),
			};

			onGroupDataChange?.(event);
		},
		[onDiagramDrag, onGroupDataChange, id, isDragging],
	);

	const handleChildDiagramDragEnd = useCallback(
		(e: DiagramDragEvent) => {
			onDiagramDragEnd?.(e);
			setIsDragging(false);

			// アウトラインの更新
			const changeItem = getChildDiagramById(items, e.id);
			if (changeItem) {
				transformGroupOutline({
					...changeItem,
					point: e.endPoint,
				});
			}
		},
		[onDiagramDragEnd, transformGroupOutline, items],
	);

	const handleChildDiagramTransfrom = useCallback(
		(e: DiagramTransformEvent) => {
			onTransform?.(e);
		},
		[onTransform],
	);

	const handleChildDiagramTransfromEnd = useCallback(
		(e: DiagramTransformEvent) => {
			// アウトラインの更新
			const changeItem = getChildDiagramById(items, e.id);
			if (changeItem) {
				transformGroupOutline({
					...changeItem,
					...e,
				});
			}
		},
		[transformGroupOutline, items],
	);

	const handleTransformStart = useCallback(() => {
		startBox.current = { x: point.x, y: point.y, width, height };
		startItems.current = items;
	}, [point, width, height, items]);

	const handleTransform = useCallback(
		(e: DiagramTransformEvent) => {
			// グループの拡縮を計算
			const groupScaleX = e.endShape.width / e.startShape.width;
			const groupScaleY = e.endShape.height / e.startShape.height;

			const transformRecursive = (diagrams: Diagram[]) => {
				const events: GroupDataChangeEvent[] = [];
				for (const item of diagrams) {
					const inversedItemCenter = rotatePoint(
						item.point,
						e.startShape.point,
						degreesToRadians(-e.startShape.rotation),
					);
					const dx = inversedItemCenter.x - e.startShape.point.x;
					const dy = inversedItemCenter.y - e.startShape.point.y;

					const newDx = dx * groupScaleX;
					const newDy = dy * groupScaleY;

					let newCenter = {
						x: e.endShape.point.x + newDx,
						y: e.endShape.point.y + newDy,
					};
					newCenter = rotatePoint(
						newCenter,
						e.endShape.point,
						degreesToRadians(e.endShape.rotation),
					);

					if (isRectangleBaseData(item)) {
						const rotationDiff = e.endShape.rotation - e.startShape.rotation;
						const newRotation = item.rotation + rotationDiff;

						events.push({
							...item,
							point: newCenter,
							width: item.width * groupScaleX,
							height: item.height * groupScaleY,
							rotation: newRotation,
							scaleX: e.endShape.scaleX,
							scaleY: e.endShape.scaleY,
							items: isGroupData(item)
								? transformRecursive(item.items ?? [])
								: undefined,
						});
					}
				}

				return events as Diagram[];
			};

			const event: GroupDataChangeEvent = {
				id,
				...e.endShape,
				items: transformRecursive(startItems.current),
			};

			onGroupDataChange?.(event);
		},
		[onGroupDataChange, id],
	);

	const handleTransformEnd = useCallback(
		(_e: DiagramTransformEvent) => {
			// アウトラインの更新
			transformGroupOutline();
		},
		[transformGroupOutline],
	);

	const handleChildGroupDataChange = useCallback(
		(e: GroupDataChangeEvent) => {
			// アウトラインの更新
			const changeItem = getChildDiagramById(items, e.id);
			if (changeItem) {
				transformGroupOutline({
					...changeItem,
					...e,
				});
			}

			onGroupDataChange?.(e);
		},
		[onGroupDataChange, transformGroupOutline, items],
	);

	// グループ内の図形の作成
	const children = items.map((item) => {
		const itemType = DiagramTypeComponentMap[item.type];
		const props = {
			...item,
			key: item.id,
			onDiagramClick: handleChildDiagramClick,
			onDiagramDragStart: handleChildDiagramDragStart,
			onDiagramDrag: handleChildDiagramDrag,
			onDiagramDragEnd: handleChildDiagramDragEnd,
			onTransform: handleChildDiagramTransfrom,
			onTransformEnd: handleChildDiagramTransfromEnd,
			onGroupDataChange: handleChildGroupDataChange,
			onDiagramSelect: handleChildDiagramSelect,
		};

		return React.createElement(itemType, props);
	});

	return (
		<>
			{children}
			<Transformative
				diagramId={id}
				type="Group"
				point={point}
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
		</>
	);
};

export default memo(Group);
