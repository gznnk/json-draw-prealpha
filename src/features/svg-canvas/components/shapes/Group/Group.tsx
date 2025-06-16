// Import React.
import React, { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import { DiagramRegistry } from "../../../registry";
import type { DiagramChangeEvent } from "../../../types/events/DiagramChangeEvent";
import type { DiagramConnectEvent } from "../../../types/events/DiagramConnectEvent";
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { DiagramSelectEvent } from "../../../types/events/DiagramSelectEvent";
import type { DiagramTextEditEvent } from "../../../types/events/DiagramTextEditEvent";
import type { DiagramTransformEvent } from "../../../types/events/DiagramTransformEvent";
import type { GroupProps } from "../../../types/props/shapes/GroupProps";

// Import components related to SvgCanvas.
import { PositionLabel } from "../../core/PositionLabel";
import { Outline } from "../../core/Outline";
import { Transformative } from "../../core/Transformative";

// Import utils.
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { isItemableData } from "../../../utils/validation/isItemableData";
import { isTransformativeData } from "../../../utils/validation/isTransformativeData";
import { rotatePoint } from "../../../utils/math/points/rotatePoint";

// Imports related to this component.
import { getSelectedChildDiagram } from "./GroupFunctions";

/**
 * Group component.
 */
const GroupComponent: React.FC<GroupProps> = ({
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
	isMultiSelectSource,
	items,
	showConnectPoints = true,
	showAsChildOutline = false,
	syncWithSameId = false,
	eventBus,
	onDrag,
	onClick,
	onSelect,
	onTransform,
	onDiagramChange,
	onConnect,
	onTextEdit,
	onExecute,
}) => {
	// Flag indicating whether the entire group is being dragged.
	// Set to true only when this group is selected and currently being dragged.
	const [isGroupDragging, setIsGroupDragging] = useState(false);

	// Flag indicating whether the entire group is being transformed.
	const [isGroupTransforming, setIsGroupTransforming] = useState(false);

	// Flag for sequential selection.
	// Sequential selection refers to the operation of selecting shape within the same group in succession,
	// even if the shape are not the same.
	// This is set to true only when the group is already selected and the pointer is pressed again on a shape inside the group.
	const isSequentialSelection = useRef(false);

	// List of child shapes at the start of a drag or transform.
	const startItems = useRef<Diagram[]>(items);

	// Group's bounding box at the start of a drag or transform.
	const startBox = useRef({ x, y, width, height });

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
		onDiagramChange,
		onConnect,
		onTextEdit,
		// 内部変数・内部関数
		isGroupDragging,
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
				eventId: e.eventId,
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
				eventId: e.eventId,
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
			onDiagramChange,
			isGroupDragging,
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
				onDiagramChange?.({
					eventId: e.eventId,
					eventType: "Start",
					changeType: "Drag",
					id,
					startDiagram: {
						x,
						y,
						items,
					},
					endDiagram: {
						x,
						y,
						items,
					},
					cursorX: e.cursorX,
					cursorY: e.cursorY,
				});
			}
			return;
		}

		// 以降ドラッグ中・ドラッグ終了時の処理
		if (!isGroupDragging) {
			// グループ全体のドラッグでなければ、ドラッグイベントをそのまま伝番し、
			// 選択されている図形のみ移動を行う
			onDrag?.(e);
		} else {
			// グループ全体のドラッグの場合、グループ内の図形を再帰的に移動させる
			const dx = e.endX - e.startX;
			const dy = e.endY - e.startY;

			// グループ内の図形を再帰的に移動させる（接続ポイントは含まない）
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

			const event: DiagramChangeEvent = {
				eventId: e.eventId,
				eventType: e.eventType,
				changeType: "Drag",
				id,
				startDiagram: {
					x: startBox.current.x,
					y: startBox.current.y,
					items: startItems.current,
				},
				endDiagram: {
					x: startBox.current.x + dx,
					y: startBox.current.y + dy,
					items: moveRecursive(startItems.current),
				},
				cursorX: e.cursorX,
				cursorY: e.cursorY,
			};

			// グループ内の全ての図形の移動をまとめて通知
			onDiagramChange?.(event);
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
			const { onTransform } = refBus.current;

			// 変形イベントをそのまま伝番する
			// アウトライン更新はCanvas側で行うので、ここでは何もしない
			onTransform?.(e);
		},
		[],
	);

	/**
	 * グループ内の図形の変更イベントハンドラ
	 */
	const handleChildDiagramChange = useCallback(
		(e: DiagramChangeEvent) => {
			const { id, isSelected, onDiagramChange } = refBus.current;

			if (isSelected) {
				// TODO: 必要か？
				// グループ選択時の場合、ここに来るのはドラッグ相当の操作の場合なので、ドラッグイベントに変換して伝番する
				const dragEvent = {
					eventType: e.eventType,
					id,
					startX: e.startDiagram.x,
					startY: e.startDiagram.y,
					endX: e.endDiagram.x,
					endY: e.endDiagram.y,
				} as DiagramDragEvent;

				handleChildDiagramDrag(dragEvent);
			} else {
				// グループ選択時でない場合、アウトライン以外はグループへの影響はないので、変更イベントをそのまま伝番する
				onDiagramChange?.(e);
			}
		},
		[handleChildDiagramDrag],
	);

	/**
	 * グループ内の図形の接続イベントハンドラ
	 */
	const handleChildDiagramConnect = useCallback((e: DiagramConnectEvent) => {
		const { onConnect } = refBus.current;

		// 特にすることはないのでそのまま伝番する
		onConnect?.(e);
	}, []);

	/**
	 * グループ内の図形のテキスト編集イベントハンドラ
	 */
	const handleChildDiagramTextEdit = useCallback((e: DiagramTextEditEvent) => {
		const { onTextEdit } = refBus.current;

		// グループ内の図形のテキスト編集イベントをそのまま伝番する
		onTextEdit?.(e);
	}, []);

	/**
	 * グループの変形イベントハンドラ
	 */
	const handleTransform = useCallback((e: DiagramTransformEvent) => {
		const { id, x, y, width, height, items, onDiagramChange } = refBus.current;

		// グループの変形開始時の処理
		if (e.eventType === "Start") {
			// 変形開始時のグループの形状を記憶
			startBox.current = { x, y, width, height };
			startItems.current = items;

			// まだ何も変形してないので、開始の通知のみ行う
			onDiagramChange?.({
				eventId: e.eventId,
				eventType: "Start",
				changeType: "Transform",
				id,
				startDiagram: {
					...e.startShape,
					items,
				},
				endDiagram: {
					...e.endShape,
					items,
				},
				cursorX: e.cursorX,
				cursorY: e.cursorY,
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

		const event: DiagramChangeEvent = {
			eventId: e.eventId,
			eventType: e.eventType,
			changeType: "Transform",
			id,
			startDiagram: {
				...e.startShape,
				items: startItems.current,
			},
			endDiagram: {
				...e.endShape,
				items: transformRecursive(startItems.current),
			},
			cursorX: e.cursorX,
			cursorY: e.cursorY,
		};

		// グループ内の全ての図形の変形をまとめて通知
		onDiagramChange?.(event);

		if (e.eventType === "End") {
			setIsGroupTransforming(false);
		}
	}, []);

	const doShowConnectPoints =
		showConnectPoints &&
		!isSelected &&
		!isGroupDragging &&
		!isGroupTransforming;

	// グループ内の図形の作成
	const children = items.map((item) => {
		// item.typeがDiagramType型であることを確認
		if (!item.type) {
			console.error("Item has no type", item);
			return null;
		}
		const component = DiagramRegistry.getComponent(item.type);
		if (!component) {
			console.warn(`Component not found for type: ${item.type}`);
			return null;
		}
		const props = {
			...item,
			key: item.id,
			showConnectPoints: doShowConnectPoints,
			// グループが選択されているか、親から子要素としてアウトライン表示指示があった場合に子要素にアウトラインを表示
			showAsChildOutline: isSelected || showAsChildOutline,
			syncWithSameId,
			eventBus,
			onClick: handleChildDiagramClick,
			onSelect: handleChildDiagramSelect,
			onDrag: handleChildDiagramDrag,
			onTransform: handleChildDiagramTransfrom,
			onDiagramChange: handleChildDiagramChange,
			onConnect: handleChildDiagramConnect,
			onTextEdit: handleChildDiagramTextEdit,
			onExecute,
		};

		return React.createElement(component(), props);
	});
	return (
		<>
			{children}
			<Outline
				x={x}
				y={y}
				width={width}
				height={height}
				rotation={rotation}
				scaleX={scaleX}
				scaleY={scaleY}
				isSelected={isSelected}
				showAsChildOutline={showAsChildOutline}
				isMultiSelectSource={isMultiSelectSource}
			/>
			{!isMultiSelectSource && !isGroupDragging && (
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
					isMultiSelectSource={isMultiSelectSource}
					eventBus={eventBus}
					onTransform={handleTransform}
				/>
			)}
			{isSelected && isGroupDragging && (
				<PositionLabel
					x={x}
					y={y}
					width={width}
					height={height}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
				/>
			)}
		</>
	);
};

export const Group = memo(GroupComponent);
