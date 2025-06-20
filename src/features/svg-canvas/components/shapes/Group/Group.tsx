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
import { getSelectedChildDiagram } from "../../../utils/shapes/group/getSelectedChildDiagram";

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
	showOutline = false,
	syncWithSameId = false,
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

	// Group's oriented box at the start of a drag or transform.
	const startBox = useRef({ x, y, width, height });

	// ハンドラ生�Eの頻発を回避するため、参照する値をuseRefで保持する
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
		// 冁E��変数・冁E��関数
		isGroupDragging,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * グループ�Eの図形の選択イベントハンドラ
	 */
	const handleChildDiagramSelect = useCallback((e: DiagramSelectEvent) => {
		const { id, isSelected, items, onSelect } = refBus.current;

		const selectedChild = getSelectedChildDiagram(items);
		if (!selectedChild) {
			// グループ�Eの図形が選択されてぁE��ぁE��合�E、このグループ�E選択イベントを発火させる、E
			// これにより、グループ�Eの図形が選択されてぁE��ぁE��ループ�EぁE��、最も上位�Eグループ�Eイベントが
			// SvgCanvasまで伝番され、そのグループが選択状態になる、E
			onSelect?.({
				eventId: e.eventId,
				id,
			});
		} else if (selectedChild.id !== e.id) {
			// グループ�Eの図形が選択されてぁE��、かつグループ�Eの別の図形が選択された場合、その図形を選択状態にする
			onSelect?.(e);
		}

		if (isSelected) {
			// グループ連続選択時のクリチE���E��EインターアチE�E�E�時に、グループ�EでクリチE��された図形を選択状態にしたぁE�Eで、E
			// フラグを立てておき、クリチE��イベント�Eで参�Eする、E
			isSequentialSelection.current = true;
		}
	}, []);

	/**
	 * グループ�Eの図形のクリチE��イベントハンドラ
	 */
	const handleChildDiagramClick = useCallback((e: DiagramSelectEvent) => {
		const { id, onSelect, onClick } = refBus.current;

		if (isSequentialSelection.current) {
			// グループ連続選択時のクリチE���E��EインターアチE�E�E�時であれば、そのグループ�Eの図形を選択状態にする、E
			// これにより、グループがネストしてぁE��場合�E、E��択�E階層が１つずつ下がってぁE��、最終的にクリチE��された図形が選択される、E
			onSelect?.(e);
			isSequentialSelection.current = false;
		} else {
			// グループ連続選択時でなぁE��合�E、このグループ�EクリチE��イベントを発火させる、E
			// これにより、E��続選択でなぁE��ループ�EぁE��、最も上位�Eグループ�EクリチE��イベントが
			// 連続選択されたグループまで伝番し、そのグループ�E連続選択時の処琁E��当該刁E���Etrue側�E�が実行され、E
			// そ�E直下�Eグループが選択状態になる、E
			onClick?.({
				eventId: e.eventId,
				id,
			});
		}
	}, []);

	// グループ�E選択状態制御
	useEffect(() => {
		// グループから選択が外れたら連続選択フラグも解除
		if (!isSelected) {
			isSequentialSelection.current = false;
		}
	}, [isSelected]);

	/**
	 * グループ�Eの図形のドラチE��中イベントハンドラ
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

		// ドラチE��開始時の処琁E
		if (e.eventType === "Start") {
			if (!isSelected) {
				// グループ選択時でなければ、ドラチE��イベントをそ�Eまま伝番し、E
				// 選択されてぁE��図形のみ移動を行う
				onDrag?.(e);
			} else {
				// グループ選択時であれば、グループ�E体をドラチE��可能にする
				setIsGroupDragging(true);

				// ドラチE��開始時のグループ�E形状を記�E
				startItems.current = items;
				startBox.current = { x, y, width, height };

				// グループ�E体�E変更開始を通知
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

		// 以降ドラチE��中・ドラチE��終亁E��の処琁E
		if (!isGroupDragging) {
			// グループ�E体�EドラチE��でなければ、ドラチE��イベントをそ�Eまま伝番し、E
			// 選択されてぁE��図形のみ移動を行う
			onDrag?.(e);
		} else {
			// グループ�E体�EドラチE��の場合、グループ�Eの図形を�E帰皁E��移動させる
			const dx = e.endX - e.startX;
			const dy = e.endY - e.startY;

			// グループ�Eの図形を�E帰皁E��移動させる�E�接続�Eイント�E含まなぁE��E
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

			// グループ�Eの全ての図形の移動をまとめて通知
			onDiagramChange?.(event);
		}

		// ドラチE��終亁E��にドラチE��中フラグを解除
		if (e.eventType === "End") {
			setIsGroupDragging(false);
		}
	}, []);

	/**
	 * グループ�Eの図形の変形イベントハンドラ
	 */
	const handleChildDiagramTransfrom = useCallback(
		(e: DiagramTransformEvent) => {
			const { onTransform } = refBus.current;

			// 変形イベントをそ�Eまま伝番する
			// アウトライン更新はCanvas側で行うので、ここでは何もしなぁE
			onTransform?.(e);
		},
		[],
	);

	/**
	 * グループ�Eの図形の変更イベントハンドラ
	 */
	const handleChildDiagramChange = useCallback(
		(e: DiagramChangeEvent) => {
			const { id, isSelected, onDiagramChange } = refBus.current;

			if (isSelected) {
				// TODO: 忁E��か�E�E
				// グループ選択時の場合、ここに来る�EはドラチE��相当�E操作�E場合なので、ドラチE��イベントに変換して伝番する
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
				// グループ選択時でなぁE��合、アウトライン以外�Eグループへの影響はなぁE�Eで、変更イベントをそ�Eまま伝番する
				onDiagramChange?.(e);
			}
		},
		[handleChildDiagramDrag],
	);

	/**
	 * グループ�Eの図形の接続イベントハンドラ
	 */
	const handleChildDiagramConnect = useCallback((e: DiagramConnectEvent) => {
		const { onConnect } = refBus.current;

		// 特にすることはなぁE�Eでそ�Eまま伝番する
		onConnect?.(e);
	}, []);

	/**
	 * グループ�Eの図形のチE��スト編雁E��ベントハンドラ
	 */
	const handleChildDiagramTextEdit = useCallback((e: DiagramTextEditEvent) => {
		const { onTextEdit } = refBus.current;

		// グループ�Eの図形のチE��スト編雁E��ベントをそ�Eまま伝番する
		onTextEdit?.(e);
	}, []);

	/**
	 * グループ�E変形イベントハンドラ
	 */
	const handleTransform = useCallback((e: DiagramTransformEvent) => {
		const { id, x, y, width, height, items, onDiagramChange } = refBus.current;

		// グループ�E変形開始時の処琁E
		if (e.eventType === "Start") {
			// 変形開始時のグループ�E形状を記�E
			startBox.current = { x, y, width, height };
			startItems.current = items;

			// まだ何も変形してなぁE�Eで、E��始�E通知のみ行う
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

		// 以降グループ�E変形中・変形終亁E��の処琁E

		// グループ�E拡縮を計箁E
		const groupScaleX = e.endShape.width / e.startShape.width;
		const groupScaleY = e.endShape.height / e.startShape.height;

		// グループ�Eの図形を�E帰皁E��変形させる（接続�Eイントも含む�E�E
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

		// グループ�Eの全ての図形の変形をまとめて通知
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

	// グループ�Eの図形の作�E
	const children = items.map((item) => {
		// item.typeがDiagramType型であることを確誁E
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
			// グループが選択されてぁE��か、親から子要素としてアウトライン表示持E��があった場合に子要素にアウトラインを表示
			showOutline: isSelected || showOutline,
			syncWithSameId,
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
				showOutline={showOutline}
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
