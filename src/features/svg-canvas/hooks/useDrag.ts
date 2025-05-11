// Import React.
import type React from "react";
import { useEffect, useRef, useState } from "react";

// Import types.
import {
	SVG_CANVAS_SCROLL_EVENT_NAME,
	type DiagramClickEvent,
	type DiagramDragDropEvent,
	type DiagramDragEvent,
	type DiagramHoverEvent,
	type DiagramPointerEvent,
	type DiagramType,
	type EventType,
	type Point,
} from "../types";

// Import utils.
import { newEventId } from "../utils";

/** 全体通知用ドラッグイベントの名前 */
const EVENT_NAME_BROADCAST_DRAG = "BroadcastDrag";

/** ドラッグのあそび */
const DRAG_DEAD_ZONE = 5;

/**
 * 全体通知用ドラッグイベントの型定義
 */
type BroadcastDragEvent = {
	eventId: string;
	eventType: EventType;
	id: string;
	type: DiagramType;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	clientX: number;
	clientY: number;
};

/**
 * ドラッグ領域のPropsの型定義
 */
export type DragProps = {
	id: string;
	type?: DiagramType;
	x: number;
	y: number;
	syncWithSameId?: boolean;
	ref: React.RefObject<SVGElement>;
	onPointerDown?: (e: DiagramPointerEvent) => void;
	onPointerUp?: (e: DiagramPointerEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragOver?: (e: DiagramDragDropEvent) => void;
	onDragLeave?: (e: DiagramDragDropEvent) => void;
	onDrop?: (e: DiagramDragDropEvent) => void;
	onHover?: (e: DiagramHoverEvent) => void;
	dragPositioningFunction?: (x: number, y: number) => Point;
};

/**
 * ドラッグ可能な領域を作成するカスタムフック
 *
 * @param {DragProps} props ドラッグ領域のProps
 * @param {string} props.id ID（ドラッグ可能にする要素にも同じIDを設定すること。しない場合は正しく動作しなくなる）
 * @param {DiagramType} [props.type] 図形の種類
 * @param {number} props.x X座標
 * @param {number} props.y Y座標
 * @param {boolean} [props.syncWithSameId] 同じIDの図形とドラッグを同期させるかどうかのフラグ
 * @param {React.RefObject<SVGElement>} props.ref ドラッグ可能にする要素の参照
 * @param {(e: DiagramPointerEvent) => void} [props.onPointerDown] ポインター押下時のイベントハンドラ
 * @param {(e: DiagramPointerEvent) => void} [props.onPointerUp] ポインター離上時のイベントハンドラ
 * @param {(e: DiagramClickEvent) => void} [props.onClick] クリック時のイベントハンドラ
 * @param {(e: DiagramDragEvent) => void} [props.onDragStart] ドラッグ開始時のイベントハンドラ
 * @param {(e: DiagramDragEvent) => void} [props.onDrag] ドラッグ中のイベントハンドラ
 * @param {(e: DiagramDragEvent) => void} [props.onDragEnd] ドラッグ終了時のイベントハンドラ
 * @param {(e: DiagramDragDropEvent) => void} [props.onDragOver] ドラッグオーバー時のイベントハンドラ
 * @param {(e: DiagramDragDropEvent) => void} [props.onDragLeave] ドラッグリーブ時のイベントハンドラ
 * @param {(e: DiagramDragDropEvent) => void} [props.onDrop] ドロップ時のイベントハンドラ
 * @param {(e: DiagramHoverEvent) => void} [props.onHover] ホバー変更時のイベントハンドラ
 * @param {(x: number, y: number) => Point} [props.dragPositioningFunction] ドラッグ位置変換関数
 */
export const useDrag = (props: DragProps) => {
	const {
		id,
		x,
		y,
		type,
		syncWithSameId = false,
		ref,
		onPointerDown,
		onPointerUp,
		onClick,
		onDrag,
		onDragOver,
		onDragLeave,
		onDrop,
		onHover,
		dragPositioningFunction,
	} = props;

	// ドラッグ中かのフラグ
	const [isDragging, setIsDragging] = useState(false);
	// このドラッグ領域でポインターが押されたかどうかのフラグ
	const isPointerDown = useRef(false);
	// 矢印キーによるドラッグ中かのフラグ
	const isArrowDragging = useRef(false);
	// ドラッグエンターしたかのフラグ
	const dragEntered = useRef(false);
	// ドラッグ開始時のドラッグ領域の座標
	const startX = useRef(0);
	const startY = useRef(0);
	// ドラッグ中のブラウザウィンドウ上のポインタの座標
	const currentClientX = useRef(0);
	const currentClientY = useRef(0);
	// The offset between the center and the pointer.
	const offsetXBetweenCenterAndPointer = useRef(0);
	const offsetYBetweenCenterAndPointer = useRef(0);

	/**
	 * Get the SVG point from the client coordinates.
	 *
	 * @param clientX - The X position of the cursor relative to the viewport (not the whole page).
	 * @param clientY - The Y position of the cursor relative to the viewport (not the whole page).
	 * @returns The SVG point
	 */
	const getSvgPoint = (clientX: number, clientY: number): Point => {
		const ownerSVGElement = ref.current?.ownerSVGElement;
		if (ownerSVGElement === null) throw new Error("ownerSVGElement is null."); // Unreachable — added to prevent type errors in the following code.

		const point = ownerSVGElement.createSVGPoint();
		point.x = clientX;
		point.y = clientY;

		return point.matrixTransform(ownerSVGElement.getScreenCTM()?.inverse());
	};

	/**
	 * ドラッグ中のポインターの位置からドラッグ領域の座標を取得する
	 *
	 * @param {number} clientX ブラウザウィンドウ上のポインタのX座標
	 * @param {number} clientY ブラウザウィンドウ上のポインタのY座標
	 * @returns {Point} ドラッグ領域の座標
	 */
	const getPointOnDrag = (clientX: number, clientY: number): Point => {
		const svgPoint = getSvgPoint(clientX, clientY);

		let newX = svgPoint.x;
		let newY = svgPoint.y;

		// Adjust the coordinates by the offset between the center and the pointer
		newX -= offsetXBetweenCenterAndPointer.current;
		newY -= offsetYBetweenCenterAndPointer.current;

		if (dragPositioningFunction) {
			// ドラッグ位置変換関数が指定されている場合は、その関数を適用
			const p = dragPositioningFunction(newX, newY);
			newX = p.x;
			newY = p.y;
		}

		return {
			x: newX,
			y: newY,
		};
	};

	/**
	 * ドラッグ領域内でのポインターの押下イベントハンドラ
	 */
	const handlePointerDown = (e: React.PointerEvent<SVGElement>): void => {
		if (e.button !== 0) {
			// 左クリック以外の場合は何もしない
			return;
		}

		// ポインターイベントが発生した要素のIDがこのドラッグ領域のIDと一致する場合のみイベントを処理する
		if ((e.target as HTMLElement).id === id) {
			// ポインターキャプチャーを設定
			e.currentTarget.setPointerCapture(e.pointerId);

			// ポインターが押されたフラグを立てる
			isPointerDown.current = true;

			// ドラッグ開始時のドラッグ領域の座標を記憶
			startX.current = x;
			startY.current = y;

			// 現在のブラウザウィンドウ上のポインタの座標を記憶
			currentClientX.current = e.clientX;
			currentClientY.current = e.clientY;

			// Store the offset between the center and the pointer
			const svgPoint = getSvgPoint(e.clientX, e.clientY);
			offsetXBetweenCenterAndPointer.current = svgPoint.x - x;
			offsetYBetweenCenterAndPointer.current = svgPoint.y - y;

			// ポインター押下イベント発火
			onPointerDown?.({
				eventId: newEventId(),
				id,
			});
		}
	};

	/**
	 * ドラッグ領域内でのポインターの移動イベントハンドラ
	 */
	const handlePointerMove = (e: React.PointerEvent<SVGElement>): void => {
		if (!isPointerDown.current) {
			// このドラッグ領域内でポインターが押されていない場合は何もしない
			return;
		}

		// 現在のブラウザウィンドウ上のポインタの座標を記憶
		currentClientX.current = e.clientX;
		currentClientY.current = e.clientY;

		// ドラッグ座標を取得
		const dragPoint = getPointOnDrag(e.clientX, e.clientY);

		// SVG座標系でのカーソル位置を取得
		const svgCursorPoint = getSvgPoint(e.clientX, e.clientY);

		// イベントIDを生成
		const eventId = newEventId();

		// ドラッグ中のイベント情報を作成
		const dragEvent = {
			eventId,
			eventType: "InProgress",
			id,
			startX: startX.current,
			startY: startY.current,
			endX: dragPoint.x,
			endY: dragPoint.y,
			cursorX: svgCursorPoint.x,
			cursorY: svgCursorPoint.y,
		} as DiagramDragEvent;

		// 全体通知用ドラッグイベント情報を作成
		const broadcastDragEvent = {
			eventId,
			eventType: "InProgress",
			id,
			type: type,
			startX: startX.current,
			startY: startY.current,
			endX: dragPoint.x,
			endY: dragPoint.y,
			clientX: e.clientX,
			clientY: e.clientY,
		};

		if (
			!isDragging &&
			(Math.abs(dragPoint.x - startX.current) > DRAG_DEAD_ZONE ||
				Math.abs(dragPoint.y - startY.current) > DRAG_DEAD_ZONE)
		) {
			// ドラッグ中でない場合、かつポインターの移動量が一定以上の場合はドラッグ開始とする
			onDrag?.({
				...dragEvent,
				eventType: "Start",
			});

			// 親子関係にない図形でハンドリングする用のドラッグ中イベント発火
			ref.current?.dispatchEvent(
				new CustomEvent(EVENT_NAME_BROADCAST_DRAG, {
					bubbles: true,
					detail: {
						...broadcastDragEvent,
						eventType: "Start",
					},
				}),
			);

			setIsDragging(true);
			return;
		}

		if (!isDragging) {
			// ドラッグ中でない場合は何もしない
			return;
		}

		// ドラッグ中イベント発火
		onDrag?.(dragEvent);

		// 親子関係にない図形でハンドリングする用のドラッグ中イベント発火
		ref.current?.dispatchEvent(
			new CustomEvent(EVENT_NAME_BROADCAST_DRAG, {
				bubbles: true,
				detail: broadcastDragEvent,
			}),
		);
	};

	/**
	 * ドラッグ領域内でのポインターの離上イベントハンドラ
	 */
	const handlePointerUp = (e: React.PointerEvent<SVGElement>): void => {
		// ポインターキャプチャーを解放
		e.currentTarget.releasePointerCapture(e.pointerId);

		// イベントIDを生成
		const eventId = newEventId();

		if (isDragging) {
			// ドラッグ座標を取得
			const dragPoint = getPointOnDrag(e.clientX, e.clientY);

			// SVG座標系でのカーソル位置を取得
			const svgCursorPoint = getSvgPoint(e.clientX, e.clientY);

			// ドラッグ中だった場合はドラッグ終了イベントを発火
			onDrag?.({
				eventId,
				eventType: "End",
				id,
				startX: startX.current,
				startY: startY.current,
				endX: dragPoint.x,
				endY: dragPoint.y,
				cursorX: svgCursorPoint.x,
				cursorY: svgCursorPoint.y,
			});

			// 親子関係にない図形でハンドリングする用のドラッグ終了イベント発火
			ref.current?.dispatchEvent(
				new CustomEvent(EVENT_NAME_BROADCAST_DRAG, {
					bubbles: true,
					detail: {
						eventId,
						eventType: "End",
						id,
						type: type,
						startX: startX.current,
						startY: startY.current,
						endX: dragPoint.x,
						endY: dragPoint.y,
						clientX: e.clientX,
						clientY: e.clientY,
					} as BroadcastDragEvent,
				}),
			);
		}

		if (isPointerDown.current && !isDragging) {
			// ドラッグ後のポインターアップでなければ、クリックイベントを親側に通知する
			onClick?.({
				eventId,
				id,
			});
		}

		// ポインターの離上イベント発火
		onPointerUp?.({
			eventId,
			id,
		});

		// フラグのクリア
		setIsDragging(false);
		isPointerDown.current = false;
	};

	/**
	 * キー押下イベントハンドラ
	 */
	const handleKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
		// ポインターダウン中は何もしない
		if (isPointerDown.current) {
			return;
		}

		// イベントIDを生成
		const eventId = newEventId();

		/**
		 * 矢印キーによる移動処理
		 *
		 * @param dx x座標の移動量
		 * @param dy y座標の移動量
		 */
		const movePoint = (dx: number, dy: number) => {
			let newPoint = {
				x: x + dx,
				y: y + dy,
			};

			if (dragPositioningFunction) {
				newPoint = dragPositioningFunction(newPoint.x, newPoint.y);
			}

			// キーボード操作時は、図形の中心をカーソル位置として扱う
			const dragEvent = {
				eventId,
				eventType: "InProgress",
				id,
				startX: startX.current,
				startY: startY.current,
				endX: newPoint.x,
				endY: newPoint.y,
				cursorX: newPoint.x, // 図形中心をカーソル位置として使用
				cursorY: newPoint.y, // 図形中心をカーソル位置として使用
			} as DiagramDragEvent;

			if (!isArrowDragging.current) {
				startX.current = x;
				startY.current = y;

				onDrag?.({
					...dragEvent,
					eventType: "Start",
				});

				isArrowDragging.current = true;

				return;
			}

			onDrag?.(dragEvent);
		};

		switch (e.key) {
			case "ArrowRight":
				movePoint(1, 0);
				break;
			case "ArrowLeft":
				movePoint(-1, 0);
				break;
			case "ArrowUp":
				movePoint(0, -1);
				break;
			case "ArrowDown":
				movePoint(0, 1);
				break;
			case "Shift":
				if (isArrowDragging.current) {
					// 矢印キーによるドラッグ中にシフトキーが押された場合はドラッグを終了させる。
					// ドラッグ終了イベントを発火させSvgCanvas側に座標の更新を通知し、座標を更新する。
					onDrag?.({
						eventId,
						eventType: "End",
						id,
						startX: x,
						startY: y,
						endX: x,
						endY: y,
						cursorX: x, // 図形中心をカーソル位置として使用
						cursorY: y, // 図形中心をカーソル位置として使用
					});

					// 矢印キーによるドラッグ終了とマーク
					isArrowDragging.current = false;
				}
				break;
			default:
				break;
		}
	};

	/**
	 * キー離上イベントハンドラ
	 */
	const handleKeyUp = (e: React.KeyboardEvent<SVGGElement>) => {
		// ポインターダウン中は何もしない
		if (isPointerDown.current) {
			return;
		}

		// 矢印キー移動完了時のイベント情報を作成
		const dragEvent = {
			eventId: newEventId(),
			eventType: "End",
			id,
			startX: startX.current,
			startY: startY.current,
			endX: x,
			endY: y,
			cursorX: x, // 図形中心をカーソル位置として使用
			cursorY: y, // 図形中心をカーソル位置として使用
		} as DiagramDragEvent;

		if (isArrowDragging.current) {
			if (e.key === "Shift") {
				// 矢印キーによるドラッグ中にシフトキーが離された場合はドラッグ終了イベントを発火させ
				// SvgCanvas側に座標の更新を通知し、一度座標を更新する
				onDrag?.(dragEvent);
				onDrag?.({
					...dragEvent,
					eventType: "Start",
				});
			}
			if (
				e.key === "ArrowRight" ||
				e.key === "ArrowLeft" ||
				e.key === "ArrowUp" ||
				e.key === "ArrowDown"
			) {
				// 矢印キーが離されたらドラッグ終了イベントを発火させSvgCanvas側に座標の更新を通知し、座標を更新する
				onDrag?.(dragEvent);

				// 矢印キーによるドラッグ終了とマーク
				isArrowDragging.current = false;
			}
		}
	};

	/**
	 * ポインターエンター時のイベントハンドラ
	 */
	const handlePointerEnter = () => {
		// ホバー時のイベント発火
		onHover?.({
			eventId: newEventId(),
			id,
			isHovered: true,
		});
	};

	/**
	 * ポインターリーブ時のイベントハンドラ
	 */
	const handlePointerLeave = () => {
		// ホバー解除時のイベント発火
		onHover?.({
			eventId: newEventId(),
			id,
			isHovered: false,
		});
	};

	// 全体周知用ドラッグイベントリスナー登録
	// ハンドラ生成の頻発を回避するため、参照する値をuseRefで保持する
	const refBusVal = {
		// プロパティ
		id,
		x,
		y,
		type,
		ref,
		syncWithSameId,
		onDrag,
		onDragOver,
		onDragLeave,
		onDrop,
		// 内部変数・内部関数
		getSvgPoint,
		getPointOnDrag,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		let handleBroadcastDrag: (e: Event) => void;
		let handleBroadcastDragForSync: (e: Event) => void;

		const { ref, onDrag, onDragOver, onDrop, syncWithSameId } = refBus.current;

		if (onDragOver || onDrop) {
			handleBroadcastDrag = (e: Event) => {
				// refBusを介して参照値を取得
				const { id, x, y, type, ref, onDragOver, onDragLeave } = refBus.current;
				const customEvent = e as CustomEvent<BroadcastDragEvent>;

				// ドラッグ＆ドロップのイベント情報を作成
				const dragDropEvent = {
					eventId: customEvent.detail.eventId,
					dropItem: {
						id: customEvent.detail.id,
						type: customEvent.detail.type,
						x: customEvent.detail.startX,
						y: customEvent.detail.startY,
					},
					dropTargetItem: {
						id,
						type,
						x,
						y,
					},
				};

				if (
					isPointerOver(
						ref,
						customEvent.detail.clientX,
						customEvent.detail.clientY,
					)
				) {
					if (customEvent.detail.eventType === "End") {
						onDrop?.(dragDropEvent);
					} else {
						if (!dragEntered.current) {
							dragEntered.current = true;
							onDragOver?.(dragDropEvent);
						}
					}
				} else if (dragEntered.current) {
					dragEntered.current = false;
					onDragLeave?.(dragDropEvent);
				}
			};
			document.addEventListener(EVENT_NAME_BROADCAST_DRAG, handleBroadcastDrag);
		}

		if (syncWithSameId && onDrag) {
			handleBroadcastDragForSync = (e: Event) => {
				// refBusを介して参照値を取得
				const { id, onDrag, getSvgPoint } = refBus.current;
				const customEvent = e as CustomEvent<BroadcastDragEvent>;

				// 同じIDでかつ自身以外の図形のドラッグイベントの場合、同期のためのドラッグイベントを発火する
				if (customEvent.detail.id === id && e.target !== ref.current) {
					// SVG座標系でのカーソル位置を取得
					const svgCursorPoint = getSvgPoint(
						customEvent.detail.clientX,
						customEvent.detail.clientY,
					);

					const dragEvent = {
						eventId: customEvent.detail.eventId,
						eventType: customEvent.detail.eventType,
						id,
						startX: customEvent.detail.startX,
						startY: customEvent.detail.startY,
						endX: customEvent.detail.endX,
						endY: customEvent.detail.endY,
						cursorX: svgCursorPoint.x, // カーソル位置も同期させる
						cursorY: svgCursorPoint.y, // カーソル位置も同期させる
					};

					onDrag?.(dragEvent);
				}
			};
			document.addEventListener(
				EVENT_NAME_BROADCAST_DRAG,
				handleBroadcastDragForSync,
			);
		}

		return () => {
			if (handleBroadcastDrag) {
				document.removeEventListener(
					EVENT_NAME_BROADCAST_DRAG,
					handleBroadcastDrag,
				);
			}

			if (handleBroadcastDragForSync) {
				document.removeEventListener(
					EVENT_NAME_BROADCAST_DRAG,
					handleBroadcastDragForSync,
				);
			}
		};
	}, []);

	/**
	 * Handle SvgCanvas scroll event.
	 */
	useEffect(() => {
		let handleSvgCanvasScroll: () => void;
		if (isDragging) {
			handleSvgCanvasScroll = () => {
				const { id, getPointOnDrag, onDrag, getSvgPoint } = refBus.current;

				const dragPoint = getPointOnDrag(
					currentClientX.current,
					currentClientY.current,
				);

				// SVG座標系でのカーソル位置を取得
				const svgCursorPoint = getSvgPoint(
					currentClientX.current,
					currentClientY.current,
				);

				onDrag?.({
					eventId: newEventId(),
					eventType: "InProgress",
					id,
					startX: startX.current,
					startY: startY.current,
					endX: dragPoint.x,
					endY: dragPoint.y,
					cursorX: svgCursorPoint.x,
					cursorY: svgCursorPoint.y,
				});
			};
			document.addEventListener(
				SVG_CANVAS_SCROLL_EVENT_NAME,
				handleSvgCanvasScroll,
				true,
			);
		}
		return () => {
			if (handleSvgCanvasScroll) {
				document.removeEventListener(
					SVG_CANVAS_SCROLL_EVENT_NAME,
					handleSvgCanvasScroll,
					true,
				);
			}
		};
	}, [isDragging]);

	return {
		onPointerDown: handlePointerDown,
		onPointerMove: handlePointerMove,
		onPointerUp: handlePointerUp,
		onKeyDown: handleKeyDown,
		onKeyUp: handleKeyUp,
		onPointerEnter: handlePointerEnter,
		onPointerLeave: handlePointerLeave,
	};
};

/**
 * ポインターがこのドラッグ領域上にあるかどうかを判定する
 * ポインターキャプチャー時は他の要素でポインター関連のイベントが発火しないため、自力で判定する必要がある
 *
 * @param {React.RefObject<SVGElement>} ref ドラッグ領域の参照
 * @param {number} clientX ポインターのX座標
 * @param {number} clientY ポインターのY座標
 * @returns {boolean} ポインターがこのドラッグ領域上にあるかどうか
 */
const isPointerOver = (
	ref: React.RefObject<SVGElement>,
	clientX: number,
	clientY: number,
): boolean => {
	const svgCanvas = ref.current?.ownerSVGElement as SVGSVGElement;
	if (!svgCanvas) {
		return false;
	}
	const svgPoint = svgCanvas.createSVGPoint();

	if (svgPoint) {
		svgPoint.x = clientX;
		svgPoint.y = clientY;
		const svg = ref.current;

		if (svg instanceof SVGGeometryElement) {
			const transformedPoint = svgPoint.matrixTransform(
				svg.getScreenCTM()?.inverse(),
			);
			return (
				svg.isPointInFill(transformedPoint) ||
				svg.isPointInStroke(transformedPoint)
			);
		}
	}
	return false;
};
