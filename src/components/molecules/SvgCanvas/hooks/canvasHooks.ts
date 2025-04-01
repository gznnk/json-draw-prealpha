// Reactのインポート
import { useCallback, useState } from "react";

// 型定義をインポート
import type { PartiallyRequired } from "../../../../types/ParticallyRequired";

// SvgCanvas関連型定義をインポート
import type {
	ConnectLineData,
	Diagram,
	GroupData,
	PathPointData,
} from "../types/DiagramTypes";
import type {
	ConnectPointMoveData,
	ConnectPointsMoveEvent,
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramSelectEvent,
	DiagramTextChangeEvent,
	DiagramTextEditEvent,
	DiagramTransformEvent,
	ItemableChangeEvent,
} from "../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import { notifyConnectPointsMove } from "../components/connector/ConnectLine";
import { calcGroupBoxOfNoRotation } from "../components/diagram/Group";

// SvgCanvas関連関数をインポート
import { isItemableData, isSelectableData, newId } from "../functions/Diagram";
import { calcPointsOuterShape } from "../functions/Math";
import { newEventId, deepCopy } from "../functions/Util";

/**
 * 最大履歴サイズ
 */
const MAX_HISTORY_SIZE = 20;

/**
 * SvgCanvasの状態の型定義
 */
export type SvgCanvasState = {
	items: Diagram[];
	multiSelectGroup?: GroupData;
	selectedItemId?: string; // TODO: いらないかも
	history: SvgCanvasState[];
	historyIndex: number;
	lastHistoryEventId: string;
};

// TODO: 精査
type UpdateItem = Omit<PartiallyRequired<Diagram, "id">, "type" | "isSelected">;

/**
 * SVGキャンバスのフック
 *
 * @param initialItems 初期図形配列
 * @returns キャンバスの状態と関数
 */
export const useSvgCanvas = (initialItems: Diagram[]) => {
	// SVGキャンバスの状態
	const [canvasState, setCanvasState] = useState<SvgCanvasState>({
		items: initialItems,
		history: [
			{
				items: deepCopy(initialItems),
				history: [],
				historyIndex: -1,
				lastHistoryEventId: "",
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
				items: applyRecursive(prevState.items, (item) =>
					item.id === e.id ? { ...item, x: e.endX, y: e.endY } : item,
				),
			};

			if (e.eventType === "End") {
				console.log(
					"onDrag",
					prevState.lastHistoryEventId,
					newState.lastHistoryEventId,
				);

				// 終了時に履歴を追加
				newState.lastHistoryEventId = e.eventId;
				newState = addHistory(prevState, newState);
				console.log("addHistory caused by Drag", e.eventId);
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
				items: applyRecursive(prevState.items, (item) =>
					item.id === e.id ? { ...item, ...e.endShape } : item,
				),
			};

			if (e.eventType === "End") {
				// 終了時に履歴を追加
				newState.lastHistoryEventId = e.eventId;
				newState = addHistory(prevState, newState);
				console.log("addHistory caused by onTransform", e.eventId);
			}

			return newState;
		});
	}, []);

	/**
	 * 子図形をもつ図形の変更イベントハンドラ
	 */
	const onItemableChange = useCallback((e: ItemableChangeEvent) => {
		// 接続ポイントの移動データを取得
		const connectPoints: ConnectPointMoveData[] = [];
		const findRecursive = (data: Partial<Diagram>) => {
			if (isItemableData(data) && !data.isMultiSelectSource) {
				for (const item of data.items ?? []) {
					if (item.type === "ConnectPoint") {
						connectPoints.push({
							id: item.id,
							x: item.x,
							y: item.y,
							ownerId: data.id,
							ownerShape: {
								...data,
							},
						});
					}
					if (isItemableData(item)) {
						findRecursive(item);
					}
				}
			}
		};
		findRecursive(e.endItemable);

		if (0 < connectPoints.length) {
			// 接続ポイントの移動を通知
			notifyConnectPointsMove({
				eventId: e.eventId,
				eventType: e.eventType,
				points: connectPoints,
			});
		}

		// 図形の変更を反映
		setCanvasState((prevState) => {
			let items = prevState.items;
			let multiSelectGroup: GroupData | undefined = prevState.multiSelectGroup;

			if (e.id === "MultiSelectGroup") {
				// 複数選択グループの変更の場合、複数選択グループ内の図形を更新
				multiSelectGroup = {
					...multiSelectGroup,
					...e.endItemable,
				} as GroupData;

				// // 複数選択グループの変更が終了したタイミングで、元の図形にも変更を反映する
				if (e.eventType === "End") {
					items = applyRecursive(prevState.items, (item) => {
						// 元図形に対応する複数選択グループ側の変更データを取得
						const changedItem = (e.endItemable.items ?? []).find(
							(i) => i.id === item.id,
						);
						if (changedItem && isSelectableData(item)) {
							const newItem = {
								...item,
								...changedItem,
								isSelected: item.isSelected, // 元図形の選択状態を維持（これをやらないとchangeItem側の値で上書きされてしまう）
								isMultiSelectSource: item.isMultiSelectSource, // 元図形の非表示を維持（同上）
							};
							if (isItemableData(newItem)) {
								newItem.items = applyMultiSelectSourceRecursive(
									newItem.items ?? [],
									item.isMultiSelectSource,
								); // 子図形の非表示を維持（同上）
							}

							return newItem;
						}

						// 対応する変更データがない場合はそのまま
						return item;
					});
				}
			} else {
				// 複数選択グループ以外の場合は、普通に更新
				items = applyRecursive(prevState.items, (item) =>
					item.id === e.id ? { ...item, ...e.endItemable } : item,
				);
			}

			// 新しい状態を作成
			let newState = {
				...prevState,
				items,
				multiSelectGroup,
			} as SvgCanvasState;

			if (e.eventType === "End") {
				// 終了時に履歴を追加
				newState.lastHistoryEventId = e.eventId;
				newState = addHistory(prevState, newState);
				console.log("addHistory caused by onItemableChange", e.eventId);
			}

			return newState;
		});
	}, []);

	/**
	 * 図形の選択イベントハンドラ
	 */
	const onSelect = useCallback((e: DiagramSelectEvent) => {
		// 複数選択グループ自身の選択イベントは無視
		if (e.id === "MultiSelectGroup") return;

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
			const selectedItems = getSelectedRecursive(items);

			// 複数選択の場合は、選択されている図形をグループ化
			let multiSelectGroup: GroupData | undefined = undefined;
			if (1 < selectedItems.length) {
				// 複数選択グループの初期値を作成
				const box = calcGroupBoxOfNoRotation(selectedItems);
				multiSelectGroup = {
					x: box.left + (box.right - box.left) / 2,
					y: box.top + (box.bottom - box.top) / 2,
					width: box.right - box.left,
					height: box.bottom - box.top,
					rotation: 0,
					scaleX: 1,
					scaleY: 1,
					keepProportion: false,
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

				// 元の図形は非表示にする
				items = applyMultiSelectSourceRecursive(items, false);
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
	 * 選択状態の全解除イベントハンドラ
	 */
	const onAllSelectionClear = useCallback(() => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				isSelectableData(item)
					? { ...item, isSelected: false, isMultiSelectSource: false } // 全ての図形の選択状態を解除し、かつ表示状態を元に戻す
					: item,
			),
			multiSelectGroup: undefined,
			selectedItemId: undefined,
		}));
	}, []);

	/**
	 * 図形の削除イベントハンドラ
	 */
	const onDelete = useCallback(() => {
		setCanvasState((prevState) => {
			const items = applyRecursive(prevState.items, (item) => {
				if (!isSelectableData(item)) {
					return item;
				}
				item.items = item.items?.filter(
					(i) => !isSelectableData(i) || !i.isSelected,
				);
				return item;
			}).filter((item) => !isSelectableData(item) || !item.isSelected);

			// 新しい状態を作成
			let newState = {
				...prevState,
				items,
			};

			// 履歴を追加
			newState.lastHistoryEventId = newEventId();
			newState = addHistory(prevState, newState);
			console.log("addHistory caused by Delete");

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
		} as ConnectLineData);
	}, []);

	const onConnectPointsMove = useCallback((e: ConnectPointsMoveEvent) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) => {
				if (item.type === "ConnectLine") {
					// 接続線の方の座標は最後のnotifyConnectPointsMoveで更新されるのでここでは更新しない
					return item;
				}
				const newPoint = e.points.find((p) => p.id === item.id);
				if (newPoint) {
					return { ...item, x: newPoint.x, y: newPoint.y };
				}
				return item;
			}),
		}));

		notifyConnectPointsMove(e);
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
			const selectedItems = getSelectedRecursive(prevState.items);
			if (selectedItems.length < 2) {
				// 選択されている図形が2つ未満の場合はグループ化させない
				// ここに到達する場合は呼び出し元の制御に不備あり
				console.error("Invalid selection count for group.");
				return prevState;
			}

			// 新しいグループを作成
			const box = calcGroupBoxOfNoRotation(selectedItems);
			const group: GroupData = {
				id: newId(),
				type: "Group",
				x: box.left + (box.right - box.left) / 2,
				y: box.top + (box.bottom - box.top) / 2,
				width: box.right - box.left,
				height: box.bottom - box.top,
				rotation: 0,
				scaleX: 1,
				scaleY: 1,
				keepProportion: false,
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
		// TODO: 複数選択時のグループ解除に対応する
		setCanvasState((prevState) => {
			let newItems = ungroupRecursive(prevState.items);
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

	const canvasProps = {
		...canvasState,
		onDrag,
		onDrop,
		onSelect,
		onAllSelectionClear,
		onDelete,
		onConnect,
		onConnectPointsMove,
		onTransform,
		onItemableChange,
		onTextEdit,
		onTextChange,
		onGroup,
		onUngroup,
	};

	const getSelectedItem = useCallback(() => {
		let selectedItem: Diagram | undefined;
		const findSelectedItem = (items: Diagram[]) => {
			for (const item of items) {
				if (isSelectableData(item) && item.isSelected) {
					selectedItem = item;
				}
				if (isItemableData(item)) {
					findSelectedItem(item.items ?? []);
				}
			}
		};
		findSelectedItem(canvasState.items);
		return selectedItem;
	}, [canvasState.items]);

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
			console.log("addHistory caused by addItem");

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

			console.log("undo", prevHistory.lastHistoryEventId);

			return {
				...prevHistory,
				history: prevState.history,
				historyIndex: prevIndex,
			};
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

			console.log("redo", nextHistory.lastHistoryEventId);

			return {
				...nextHistory,
				history: prevState.history,
				historyIndex: nextIndex,
			};
		});
	}, []);

	const canvasFunctions = {
		getSelectedItem,
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

/**
 * 再帰的に更新関数を適用する
 *
 * @param items 更新対象の図形配列
 * @param updateFunction 更新関数
 * @returns 更新後の図形配列
 */
const applyRecursive = (
	items: Diagram[],
	updateFunction: (item: Diagram) => Diagram,
) => {
	let isItemChanged = false;
	const newItems: Diagram[] = [];
	for (const item of items) {
		const newItem = updateFunction(item);
		newItems.push(newItem);

		// アイテムの参照先が変わった場合は変更ありと判断する
		if (item !== newItem) {
			isItemChanged = true;
		}
		if (isItemableData(item) && isItemableData(newItem)) {
			const newGroupItems = applyRecursive(item.items ?? [], updateFunction);
			// 配列の参照先が変わった場合は変更ありと判断する
			if (newGroupItems !== item.items) {
				newItem.items = newGroupItems;
				isItemChanged = true;
			}
		}
	}

	// 変更がない場合はReactが変更なしと検知するよう元の配列を返す
	return isItemChanged ? newItems : items;
};

// TODO: ちゃんと中身を見ていないので要確認
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const deepMerge = <T extends Record<string, any>>(
	target: T,
	...sources: Partial<T>[]
): T => {
	for (const source of sources) {
		if (typeof source !== "object" || source === null) continue;

		for (const key of Object.keys(source)) {
			const sourceValue = source[key];
			const targetValue = target[key];

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(target as any)[key] =
				typeof sourceValue === "object" && sourceValue !== null
					? deepMerge(
							Array.isArray(sourceValue) ? [] : { ...targetValue },
							sourceValue,
						)
					: sourceValue;
		}
	}

	return Array.isArray(target) ? target : { ...target };
};

/**
 * 選択されている図形を取得する
 *
 * @param items 図形配列
 * @param selectedItems １つ前の再帰呼び出し時の選択されている図形の配列
 * @returns 選択されている図形の配列
 */
const getSelectedRecursive = (items: Diagram[], selectedItems?: Diagram[]) => {
	const _selectedItems = selectedItems ?? [];
	for (const item of items) {
		if (isSelectableData(item)) {
			if (item.isSelected) {
				_selectedItems.push(item);
			} else if (isItemableData(item)) {
				getSelectedRecursive(item.items, _selectedItems);
			}
		}
	}
	return _selectedItems;
};

/**
 * 複数選択時に、選択されている図形を選択元として設定する（非表示にする）
 *
 * @param items 図形配列
 * @param isGroupMultiSelected 複数選択されたグループか
 * @returns 更新後の図形配列
 */
const applyMultiSelectSourceRecursive = (
	items: Diagram[],
	isGroupMultiSelected: boolean,
): Diagram[] => {
	return items.map((item) => {
		const newItem = { ...item };
		if (!isSelectableData(newItem)) {
			return item;
		}
		newItem.isMultiSelectSource = isGroupMultiSelected || newItem.isSelected;
		if (isItemableData(newItem)) {
			newItem.items = applyMultiSelectSourceRecursive(
				newItem.items ?? [],
				newItem.isMultiSelectSource,
			);
		}
		return newItem;
	});
};

/**
 * 複数選択時に、選択元として設定された図形の非表示を解除する
 *
 * @param items 図形配列
 * @returns 更新後の図形配列
 */
const clearMultiSelectSourceRecursive = (items: Diagram[]): Diagram[] => {
	return items.map((item) => {
		const newItem = { ...item };
		if (!isSelectableData(newItem)) {
			return item;
		}
		newItem.isMultiSelectSource = false;
		if (isItemableData(newItem)) {
			newItem.items = clearMultiSelectSourceRecursive(newItem.items ?? []);
		}
		return newItem;
	});
};

/**
 * グループ化された図形を図形配列から削除する
 *
 * @param items 図形配列
 * @returns 更新後の図形配列
 */
const removeGroupedRecursive = (items: Diagram[]) => {
	return items.filter((item) => {
		if (isSelectableData(item) && item.isSelected) {
			return false;
		}
		if (isItemableData(item)) {
			item.items = removeGroupedRecursive(item.items ?? []);
			if (item.type === "Group" && item.items.length === 0) {
				return false;
			}
		}
		return true;
	});
};

/**
 * 選択されているグループを解除する
 *
 * @param items 図形配列
 * @returns 更新後の図形配列
 */
const ungroupRecursive = (items: Diagram[]) => {
	const newItems: Diagram[] = [];
	for (const item of [...items]) {
		if (isItemableData(item) && item.type === "Group") {
			if (item.isSelected) {
				for (const groupItem of item.items ?? []) {
					newItems.push(groupItem);
				}
			} else {
				item.items = ungroupRecursive(item.items ?? []);
				newItems.push(item);
			}
		} else {
			newItems.push(item);
		}
	}
	return newItems;
};

/**
 * 履歴を追加
 */
const addHistory = (
	prevState: SvgCanvasState,
	newState: SvgCanvasState,
): SvgCanvasState => {
	// 履歴データからは履歴データを削除
	newState.history = [];
	newState.historyIndex = -1;
	// newState.lastHistoryEventId = "";

	// 前回の履歴追加時と同じイベントIDの場合、履歴を上書きする
	if (prevState.lastHistoryEventId === newState.lastHistoryEventId) {
		console.log("overwrite history", newState.lastHistoryEventId);

		// 履歴を上書き
		const newHistory = prevState.history.slice(0, prevState.historyIndex);
		newHistory.push(deepCopy(newState));
		const ret = {
			...newState,
			history: newHistory,
			historyIndex: prevState.historyIndex,
			lastHistoryEventId: prevState.lastHistoryEventId,
		};

		console.log("overwrite history", ret);

		return ret;
	}

	// 履歴を追加
	let newHistory = prevState.history.slice(0, prevState.historyIndex + 1);
	newHistory.push(deepCopy(newState));

	// 履歴のサイズが最大値を超えた場合、古い履歴を削除
	if (MAX_HISTORY_SIZE <= newHistory.length) {
		newHistory = newHistory.slice(1);
	}

	const ret = {
		...newState,
		history: newHistory,
		historyIndex: prevState.historyIndex + 1,
	};

	console.log("history", JSON.stringify(ret, null, 2));

	return ret;
};
