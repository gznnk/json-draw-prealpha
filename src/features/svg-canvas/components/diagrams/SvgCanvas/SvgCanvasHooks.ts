// Import React.
import { useCallback, useState } from "react";

// Import types related to SvgCanvas.
import type { PartiallyRequired } from "../../../../../types/ParticallyRequired";

// Import types related to SvgCanvas.
import type { Diagram, DiagramType } from "../../../types/DiagramCatalog";
import type {
	ConnectPointMoveData,
	DiagramChangeEvent,
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramSelectEvent,
	DiagramTextChangeEvent,
	DiagramTextEditEvent,
	DiagramTransformEvent,
	NewDiagramEvent,
	StackOrderChangeEvent,
	SvgCanvasResizeEvent,
} from "../../../types/EventTypes";
import type { ConnectLineData } from "../../shapes/ConnectLine";
import type { GroupData } from "../../shapes/Group";
import type { PathPointData } from "../../shapes/Path";

// Import components related to SvgCanvas.
import { notifyConnectPointsMove } from "../../shapes/ConnectLine";
import { createEllipseData } from "../../shapes/Ellipse";
import { calcGroupBoxOfNoRotation } from "../../shapes/Group";
import { createRectangleData } from "../../shapes/Rectangle";

// Import functions related to SvgCanvas.
import {
	isItemableData,
	isSelectableData,
	newId,
} from "../../../utils/Diagram";
import { calcPointsOuterShape } from "../../../utils/Math";
import { deepCopy, newEventId } from "../../../utils/Util";
import {
	addHistory,
	applyMultiSelectSourceRecursive,
	applyRecursive,
	clearMultiSelectSourceRecursive,
	clearSelectedRecursive,
	getDiagramById,
	getSelectedItems,
	removeGroupedRecursive,
	saveCanvasDataToLocalStorage,
	ungroupSelectedGroupsRecursive,
	updateConnectPointsAndCollect,
	updateConnectPointsAndCollectRecursive,
	updateConnectPointsAndNotifyMove,
} from "./SvgCanvasFunctions";

// Imports related to this component.
import { createPathData } from "../../shapes/Path";
import { MULTI_SELECT_GROUP } from "./SvgCanvasConstants";
import type { SvgCanvasState } from "./SvgCanvasTypes";

// TODO: 精査
type UpdateItem = Omit<PartiallyRequired<Diagram, "id">, "type" | "isSelected">;

/**
 * The SvgCanvas state and functions.
 *
 * @param initialItems - The initial items to be displayed on the canvas.
 * @returns The state and functions of the SvgCanvas.
 */
export const useSvgCanvas = (
	initialWidth: number,
	initialHeight: number,
	initialItems: Diagram[],
) => {
	// The state of the canvas.
	const [canvasState, setCanvasState] = useState<SvgCanvasState>({
		minX: 0,
		minY: 0,
		width: initialWidth,
		height: initialHeight,
		items: initialItems,
		isDiagramChanging: false,
		history: [
			{
				minX: 0,
				minY: 0,
				width: initialWidth,
				height: initialHeight,
				items: deepCopy(initialItems),
			},
		],
		historyIndex: 0,
		lastHistoryEventId: "",
	});

	/**
	 * 図形のドラッグイベントハンドラ
	 */
	const onDrag = useCallback((e: DiagramDragEvent) => {
		setCanvasState((prevState) => {
			// 新しい状態を作成
			let newState = {
				...prevState,
				items: applyRecursive(prevState.items, (item) => {
					if (item.id === e.id) {
						const newItem = {
							...item,
							x: e.endX,
							y: e.endY,
						};

						// Update the connect points of the diagram.
						// And notify the connect points move event to ConnectLine.
						return updateConnectPointsAndNotifyMove(
							e.eventId,
							e.eventType,
							newItem,
						);
					}
					return item;
				}),
				isDiagramChanging: e.eventType !== "End" && e.eventType !== "Instant",
			};

			if (e.eventType === "End") {
				// console.log(
				// 	"onDrag",
				// 	prevState.lastHistoryEventId,
				// 	newState.lastHistoryEventId,
				// );

				// 終了時に履歴を追加
				newState.lastHistoryEventId = e.eventId;
				newState = addHistory(prevState, newState);
				// console.log("addHistory caused by Drag", e.eventId);
			}

			return newState;
		});
	}, []);

	/**
	 * 図形のドロップイベントハンドラ
	 */
	const onDrop = useCallback((_e: DiagramDragDropEvent) => {
		// NOP
	}, []);

	/**
	 * 図形の変形イベントハンドラ
	 */
	const onTransform = useCallback((e: DiagramTransformEvent) => {
		setCanvasState((prevState) => {
			// 新しい状態を作成
			let newState = {
				...prevState,
				items: applyRecursive(prevState.items, (item) => {
					if (item.id === e.id) {
						const newItem = {
							...item,
							...e.endShape,
						};

						// Update the connect points of the diagram.
						// And notify the connect points move event to ConnectLine.
						return updateConnectPointsAndNotifyMove(
							e.eventId,
							e.eventType,
							newItem,
						);
					}
					return item;
				}),
				isDiagramChanging: e.eventType !== "End" && e.eventType !== "Instant",
			};

			if (e.eventType === "End") {
				// 終了時に履歴を追加
				newState.lastHistoryEventId = e.eventId;
				newState = addHistory(prevState, newState);
				// console.log("addHistory caused by onTransform", e.eventId);
			}

			return newState;
		});
	}, []);

	/**
	 * 図形の変更イベントハンドラ
	 */
	const onDiagramChange = useCallback((e: DiagramChangeEvent) => {
		// 図形の変更を反映
		setCanvasState((prevState) => {
			let items = prevState.items;
			let multiSelectGroup: GroupData | undefined = prevState.multiSelectGroup;

			const connectPointMoveDataList: ConnectPointMoveData[] = [];

			if (e.id === MULTI_SELECT_GROUP) {
				// 複数選択グループの変更の場合、複数選択グループ内の図形を更新
				multiSelectGroup = {
					...multiSelectGroup,
					...e.endDiagram,
				} as GroupData;

				items = applyRecursive(prevState.items, (item) => {
					if (!isItemableData(e.endDiagram)) return item; // Type guard.

					// Find the corresponding change data in the multi-select group.
					const changedItem = (e.endDiagram.items ?? []).find(
						(i) => i.id === item.id,
					);

					// If there is no corresponding change data, return the original item.
					if (!changedItem) return item;

					// Prepare the new item with the original properties.
					let newItem = { ...item };

					if (isSelectableData(changedItem)) {
						// Remove the properties that are not needed for the update.
						const { isSelected, isMultiSelectSource, ...updateItem } =
							changedItem;

						// Apply updated properties to the original item.
						newItem = {
							...newItem,
							...updateItem,
						};
					}

					if (e.changeType !== "Appearance") {
						// Update the diagram's connect points and collect their move data.
						updateConnectPointsAndCollect(newItem, connectPointMoveDataList);
					}

					return newItem;
				});
			} else {
				// 複数選択グループ以外の場合は、普通に更新
				items = applyRecursive(prevState.items, (item) => {
					// If the id does not match, return the original item.
					if (item.id !== e.id) return item;

					// If the id matches, update the item with the new properties.
					const newItem = { ...item, ...e.endDiagram };

					// Update the diagram's connect points and collect their move data.
					if (e.changeType !== "Appearance") {
						updateConnectPointsAndCollectRecursive(
							newItem,
							connectPointMoveDataList,
						);
					}

					// Return the updated item.
					return newItem;
				});

				if (multiSelectGroup) {
					// TODO: 接続ポイントの更新（現時点では該当ルートで接続ポイントの移動はない）
					// Propagate the original diagram changes to the items in the multi-select group.
					multiSelectGroup.items = applyRecursive(
						multiSelectGroup.items,
						(item) =>
							item.id === e.id
								? {
										...item,
										...e.endDiagram,
										isSelected: false,
										isMultiSelectSource: false,
									}
								: item,
					);
				}
			}

			// 新しい状態を作成
			let newState = {
				...prevState,
				items,
				isDiagramChanging: e.eventType !== "End" && e.eventType !== "Instant",
				multiSelectGroup,
			} as SvgCanvasState;

			if (e.eventType === "End") {
				// 終了時に履歴を追加
				newState.lastHistoryEventId = e.eventId;
				newState = addHistory(prevState, newState);
				// console.log("addHistory caused by onDiagramChange", e.eventId);
			}

			if (0 < connectPointMoveDataList.length) {
				// 接続ポイントの移動を通知
				notifyConnectPointsMove({
					eventId: e.eventId,
					eventType: e.eventType,
					points: connectPointMoveDataList,
				});
			}

			return newState;
		});
	}, []);

	/**
	 * 図形の選択イベントハンドラ
	 */
	const onSelect = useCallback((e: DiagramSelectEvent) => {
		// 複数選択グループ自身の選択イベントは無視
		if (e.id === MULTI_SELECT_GROUP) return;

		setCanvasState((prevState) => {
			let items = applyRecursive(prevState.items, (item) => {
				if (!isSelectableData(item)) {
					// 選択不可能な図形は無視
					return item;
				}

				if (item.id === e.id) {
					if (e.isMultiSelect) {
						// 複数選択の場合は、選択された図形の選択状態を反転
						return {
							...item,
							isSelected: !item.isSelected,
						};
					}

					// 図形を選択状態にする
					return { ...item, isSelected: true };
				}

				if (e.isMultiSelect && item.isSelected) {
					// 複数選択の場合は、選択されている図形の選択状態を解除しない
					return item;
				}

				return {
					...item,
					// 複数選択でない場合は、選択された図形以外の選択状態を解除
					isSelected: false,
					isMultiSelectSource: false,
				};
			});

			// 選択されたアイテムを取得
			const selectedItems = getSelectedItems(items);

			// 複数選択の場合は、選択されている図形をグループ化
			let multiSelectGroup: GroupData | undefined = undefined;
			if (1 < selectedItems.length) {
				if (selectedItems.some((item) => item.type === "ConnectLine")) {
					// 複数選択の中に接続線が含まれている場合はグループ化させず、選択状態を変更しない
					return prevState;
				}

				// 複数選択グループの初期値を作成
				const box = calcGroupBoxOfNoRotation(selectedItems);
				multiSelectGroup = {
					id: MULTI_SELECT_GROUP,
					x: box.left + (box.right - box.left) / 2,
					y: box.top + (box.bottom - box.top) / 2,
					width: box.right - box.left,
					height: box.bottom - box.top,
					rotation: 0,
					scaleX: 1,
					scaleY: 1,
					keepProportion: prevState.multiSelectGroup?.keepProportion ?? true,
					isSelected: true, // 複数選択用のグループは常に選択状態にする
					isMultiSelectSource: false, // 複数選択の選択元ではないと設定
					items: applyRecursive(selectedItems, (item) => {
						if (!isSelectableData(item)) {
							return item;
						}
						return {
							...item,
							isSelected: false, // 複数選択用のグループ内の図形は選択状態を解除
							isMultiSelectSource: false, // 複数選択の選択元ではないと設定
						};
					}),
				} as GroupData;

				// Set `isMultiSelectSource` to true to hide the transform outline of the original diagrams during multi-selection.
				items = applyMultiSelectSourceRecursive(items);
			} else {
				// 複数選択でない場合は、全図形に対して複数選択の選択元ではないと設定
				items = applyRecursive(items, (item) => {
					if (isSelectableData(item)) {
						return {
							...item,
							isMultiSelectSource: false,
						};
					}
					return item;
				});
			}

			return {
				...prevState,
				items,
				multiSelectGroup,
				selectedItemId: e.id,
			};
		});
	}, []);

	/**
	 * Handle select all action.
	 */
	const onSelectAll = useCallback(() => {
		setCanvasState((prevState) => {
			let items = prevState.items.map((item) => {
				if (!isSelectableData(item)) {
					// Ignore non-selectable items.
					return item;
				}
				if (item.type === "ConnectLine") {
					return {
						...item,
						isSelected: false, // Deselect ConnectLine items.
					};
				}
				return {
					...item,
					isSelected: true,
				};
			});

			// Set `isMultiSelectSource` to true to hide the transform outline of the original diagrams during multi-selection.
			items = applyMultiSelectSourceRecursive(items);

			// Create a multi-select group's items.
			const multiSelectGroupItems = items.filter(
				(item) => item.type !== "ConnectLine",
			) as Diagram[]; // Filter out ConnectLine items.
			if (multiSelectGroupItems.length < 2) {
				// If there are less than 2 items, do not create a multi-select group.
				return prevState;
			}

			const box = calcGroupBoxOfNoRotation(multiSelectGroupItems);

			const multiSelectGroup = {
				id: MULTI_SELECT_GROUP,
				x: box.left + (box.right - box.left) / 2,
				y: box.top + (box.bottom - box.top) / 2,
				width: box.right - box.left,
				height: box.bottom - box.top,
				rotation: 0,
				scaleX: 1,
				scaleY: 1,
				keepProportion: prevState.multiSelectGroup?.keepProportion ?? true,
				isSelected: true, // 複数選択用のグループは常に選択状態にする
				isMultiSelectSource: false, // 複数選択の選択元ではないと設定
				items: applyRecursive(multiSelectGroupItems, (item) => {
					if (!isSelectableData(item)) {
						return item;
					}
					return {
						...item,
						isSelected: false, // 複数選択用のグループ内の図形は選択状態を解除
						isMultiSelectSource: false, // 複数選択の選択元ではないと設定
					};
				}),
			} as GroupData;

			return {
				...prevState,
				items,
				multiSelectGroup,
				selectedItemId: undefined,
			};
		});
	}, []);

	/**
	 * 選択状態の全解除イベントハンドラ
	 */
	const onAllSelectionClear = useCallback(() => {
		setCanvasState((prevState) => ({
			...prevState,
			items: clearSelectedRecursive(prevState.items),
			multiSelectGroup: undefined,
			selectedItemId: undefined,
		}));
	}, []);

	/**
	 * Handle delete action.
	 */
	const onDelete = useCallback(() => {
		setCanvasState((prevState) => {
			// Remove selected items.
			let items = applyRecursive(prevState.items, (item) => {
				if (!isSelectableData(item)) {
					return item;
				}
				if (isItemableData(item)) {
					item.items = item.items?.filter(
						(i) => !isSelectableData(i) || !i.isSelected,
					);
				}
				return item;
			}).filter((item) => !isSelectableData(item) || !item.isSelected);

			// Find all ConnectLine components.
			const connectLines = items.filter(
				(item) => item.type === "ConnectLine",
			) as ConnectLineData[];

			// Remove ConnectLine components whose owner was deleted."
			for (const connectLine of connectLines) {
				if (
					!getDiagramById(items, connectLine.startOwnerId) ||
					!getDiagramById(items, connectLine.endOwnerId)
				) {
					items = items.filter((item) => item.id !== connectLine.id);
				}
			}

			// Create new state.
			let newState = {
				...prevState,
				items, // Apply new items after removing the selected items.
				multiSelectGroup: undefined, // Hide the multi-select group because the selected items were deleted.
			} as SvgCanvasState;

			// Add history.
			newState.lastHistoryEventId = newEventId();
			newState = addHistory(prevState, newState);
			// console.log("addHistory caused by Delete");

			return newState;
		});
	}, []);

	/**
	 * 図形の接続イベントハンドラ
	 */
	const onConnect = useCallback((e: DiagramConnectEvent) => {
		const shape = calcPointsOuterShape(
			e.points.map((p) => ({ x: p.x, y: p.y })),
		);

		addItem({
			id: newId(),
			type: "ConnectLine",
			x: shape.x,
			y: shape.y,
			width: shape.width,
			height: shape.height,
			isSelected: false,
			keepProportion: false,
			items: e.points.map((p) => ({
				...p,
				type: "PathPoint",
			})) as PathPointData[],
			startOwnerId: e.startOwnerId,
			endOwnerId: e.endOwnerId,
			autoRouting: true,
			endArrowHead: "ConcaveTriangle",
		} as ConnectLineData);
	}, []);

	/**
	 * テキスト編集イベントハンドラ（開始時のみ発火する）
	 */
	const onTextEdit = useCallback((e: DiagramTextEditEvent) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? { ...item, isTextEditing: true } : item,
			),
		}));
	}, []);

	/**
	 * テキスト変更イベントハンドラ（完了時のみ発火する）
	 */
	const onTextChange = useCallback((e: DiagramTextChangeEvent) => {
		setCanvasState((prevState) => {
			// 新しい状態を作成
			let newState = {
				...prevState,
				items: applyRecursive(prevState.items, (item) =>
					item.id === e.id
						? { ...item, text: e.text, isTextEditing: false }
						: item,
				),
			};

			// 履歴を追加
			newState.lastHistoryEventId = e.eventId;
			newState = addHistory(prevState, newState);

			return newState;
		});
	}, []);

	/**
	 * グループ化イベントハンドラ
	 */
	const onGroup = useCallback(() => {
		setCanvasState((prevState) => {
			const selectedItems = getSelectedItems(prevState.items);
			if (selectedItems.length < 2) {
				// 選択されている図形が2つ未満の場合はグループ化させない
				// ここに到達する場合は呼び出し元の制御に不備あり
				console.error("Invalid selection count for group.");
				return prevState;
			}

			if (!prevState.multiSelectGroup) {
				// Type checking for multiSelectGroup.
				// If this is the case, it means that the canvas state is invalid.
				console.error("Invalid multiSelectGroup state.");
				return prevState;
			}

			// Create a new group data.
			const group: GroupData = {
				...prevState.multiSelectGroup,
				id: newId(),
				type: "Group",
				isSelected: true,
				isMultiSelectSource: false,
				items: selectedItems.map((item) => ({
					...item,
					isSelected: false,
					isMultiSelectSource: false,
				})),
			};

			// グループ化された図形を図形配列から削除
			let items = removeGroupedRecursive(prevState.items);
			// 新しいグループを追加
			items = [...items, group];
			// 複数選択の選択元設定を解除
			items = clearMultiSelectSourceRecursive(items);

			// 新しい状態を作成
			let newState = {
				...prevState,
				items,
				multiSelectGroup: undefined,
			} as SvgCanvasState;

			// 履歴を追加
			newState.lastHistoryEventId = newEventId();
			newState = addHistory(prevState, newState);

			return newState;
		});
	}, []);

	/**
	 * グループ解除イベントハンドラ
	 */
	const onUngroup = useCallback(() => {
		setCanvasState((prevState) => {
			let newItems = ungroupSelectedGroupsRecursive(prevState.items);
			newItems = clearMultiSelectSourceRecursive(newItems);

			// 新しい状態を作成
			let newState = {
				...prevState,
				items: newItems,
				multiSelectGroup: undefined,
			} as SvgCanvasState;

			// 履歴を追加
			newState.lastHistoryEventId = newEventId();
			newState = addHistory(prevState, newState);

			return newState;
		});
	}, []);

	/**
	 * Handle undo action.
	 */
	const onUndo = useCallback(() => {
		undo(); // TODO: ここに直接関数の実装を記述する
	}, []);

	/**
	 * Handle redo action.
	 */
	const onRedo = useCallback(() => {
		redo(); // TODO: ここに直接関数の実装を記述する
	}, []);

	/**
	 * Handle canvas resize event.
	 */
	const onCanvasResize = useCallback((e: SvgCanvasResizeEvent) => {
		setCanvasState((prevState) => ({
			...prevState,
			...e, // Apply new minX, minY, width and height.
		}));
	}, []);

	/**
	 * Handle new diagram action.
	 */
	const onNewDiagram = useCallback(
		(e: NewDiagramEvent) => {
			const centerX = canvasState.minX + canvasState.width / 2;
			const centerY = canvasState.minY + canvasState.height / 2;

			const diagramType = e.diagramType as DiagramType;
			if (diagramType === "Rectangle") {
				addItem(createRectangleData({ x: centerX, y: centerY }) as Diagram);
			}
			if (diagramType === "Ellipse") {
				addItem(createEllipseData({ x: centerX, y: centerY }) as Diagram);
			}
			if (diagramType === "Path") {
				addItem(createPathData({ x: centerX, y: centerY }) as Diagram);
			}
		},
		[canvasState.minX, canvasState.minY, canvasState.width, canvasState.height],
	);

	const onStackOrderChange = useCallback((e: StackOrderChangeEvent) => {
		setCanvasState((prevState) => {
			const moveInList = (items: Diagram[]): Diagram[] => {
				const index = items.findIndex((item) => item.id === e.id);
				if (index === -1) return items;

				const newItems = [...items];
				const [target] = newItems.splice(index, 1); // remove

				switch (e.changeType) {
					case "bringToFront":
						newItems.push(target);
						break;
					case "sendToBack":
						newItems.unshift(target);
						break;
					case "bringForward":
						if (index < newItems.length - 1) {
							newItems.splice(index + 1, 0, target);
						} else {
							newItems.push(target);
						}
						break;
					case "sendBackward":
						if (index > 0) {
							newItems.splice(index - 1, 0, target);
						} else {
							newItems.unshift(target);
						}
						break;
				}
				return newItems;
			};

			// 再帰的に探し、idが一致する図形の属する親のitems配列を対象に並び替える
			const updateOrderRecursive = (items: Diagram[]): Diagram[] => {
				return items.map((item) => {
					if (isItemableData(item)) {
						// グループ内を再帰的に調査
						if (item.items?.some((child) => child.id === e.id)) {
							return {
								...item,
								items: moveInList(item.items),
							};
						}
						return {
							...item,
							items: updateOrderRecursive(item.items ?? []),
						};
					}
					return item;
				});
			};

			// top-level にある場合の対応
			let items = prevState.items;
			if (items.some((item) => item.id === e.id)) {
				items = moveInList(items);
			} else {
				items = updateOrderRecursive(items);
			}

			// 履歴に追加
			let newState: SvgCanvasState = {
				...prevState,
				items,
			};
			newState.lastHistoryEventId = newEventId(); // TODO: Trigger側で設定するようにする
			newState = addHistory(prevState, newState);

			return newState;
		});
	}, []);

	const canvasProps = {
		...canvasState,
		onDrag,
		onDrop,
		onSelect,
		onSelectAll,
		onAllSelectionClear,
		onDelete,
		onConnect,
		onTransform,
		onDiagramChange,
		onTextEdit,
		onTextChange,
		onGroup,
		onUngroup,
		onUndo,
		onRedo,
		onCanvasResize,
		onNewDiagram,
		onStackOrderChange,
	};

	// --- Functions for accessing the canvas state and modifying the canvas. --- //

	const addItem = useCallback((item: Diagram) => {
		setCanvasState((prevState) => {
			let newState = {
				...prevState,
				items: [
					...prevState.items.map((item) => ({ ...item, isSelected: false })),
					{
						...item,
						isSelected: true,
					},
				],
			} as SvgCanvasState;

			// 履歴を追加
			newState.lastHistoryEventId = newEventId();
			newState = addHistory(prevState, newState);
			// console.log("addHistory caused by addItem");

			return newState;
		});
	}, []);

	const updateItem = useCallback((item: UpdateItem) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (i) =>
				i.id === item.id ? { ...i, ...item } : i,
			),
		}));
	}, []);

	/**
	 * 元に戻す
	 */
	const undo = useCallback(() => {
		setCanvasState((prevState) => {
			// 前の状態を取得
			const prevIndex = prevState.historyIndex - 1;
			if (prevIndex < 0) {
				// 履歴がない場合は何もしない
				return prevState;
			}
			const prevHistory = prevState.history[prevIndex];

			// console.log("undo", prevHistory.lastHistoryEventId);

			const ret = {
				...prevState,
				...prevHistory, // Overwrite the current state with the previous history.
				historyIndex: prevIndex,
			};

			saveCanvasDataToLocalStorage(ret); // Save the canvas data to local storage.

			return ret;
		});
	}, []);

	/**
	 * やり直す
	 */
	const redo = useCallback(() => {
		setCanvasState((prevState) => {
			// 次の状態を取得
			const nextIndex = prevState.historyIndex + 1;
			if (nextIndex >= prevState.history.length) {
				// 履歴がない場合は何もしない
				return prevState;
			}
			const nextHistory = prevState.history[nextIndex];

			// console.log("redo", nextHistory.lastHistoryEventId);

			const ret = {
				...prevState,
				...nextHistory, // Overwrite the current state with the next history.
				historyIndex: nextIndex,
			};

			saveCanvasDataToLocalStorage(ret); // Save the canvas data to local storage.

			return ret;
		});
	}, []);

	const canvasFunctions = {
		addItem,
		updateItem,
		undo,
		redo,
	};

	return {
		state: [canvasState, setCanvasState],
		canvasProps,
		canvasFunctions,
	} as const;
};
