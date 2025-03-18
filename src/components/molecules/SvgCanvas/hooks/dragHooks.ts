// Reactのインポート
import type React from "react";
import { useEffect, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../types/CoordinateTypes";
import type { DiagramType } from "../types/DiagramTypes";
import type {
	DiagramClickEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramHoverEvent,
	DiagramPointerEvent,
} from "../types/EventTypes";

/** 全体通知用ドラッグイベントの名前 */
const EVENT_NAME_BROADCAST_DRAG = "BroadcastDrag";

/** 全体通知用ドラッグ完了イベントの名前 */
const EVENT_NAME_BROADCAST_DRAG_END = "BroadcastDragEnd";

/** ドラッグのあそび */
const DRAG_DEAD_ZONE = 5;

/**
 * 全体通知用ドラッグイベントの型定義
 */
type BroadcastDragEvent = {
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
	allowXDecimal?: boolean;
	allowYDecimal?: boolean;
	ref: React.RefObject<SVGElement>;
	onPointerDown?: (e: DiagramPointerEvent) => void;
	onPointerUp?: (e: DiagramPointerEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
	onDragStart?: (e: DiagramDragEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragEnd?: (e: DiagramDragEvent) => void;
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
 * @param {boolean} [props.allowXDecimal] X座標の小数点許可フラグ
 * @param {boolean} [props.allowYDecimal] Y座標の小数点許可フラグ
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
		allowXDecimal = true,
		allowYDecimal = true,
		ref,
		onPointerDown,
		onPointerUp,
		onClick,
		onDragStart,
		onDrag,
		onDragEnd,
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
	// ドラッグ開始時のブラウザウィンドウ上のポインタの座標
	const startClientX = useRef(0);
	const startClientY = useRef(0);

	/**
	 * 座標を調整する
	 *
	 * 基本的には座標は整数値とし、小数点での指定が必要な場合のみ小数点以下を許容する。
	 *
	 * @param {number} px X座標
	 * @param {number} py Y座標
	 * @returns {Point} 調整後の座標
	 */
	const adjustCoordinates = (px: number, py: number): Point => {
		let newX = px;
		let newY = py;

		if (!allowXDecimal) {
			newX = Math.round(newX);
		}

		if (!allowYDecimal) {
			newY = Math.round(newY);
		}

		return {
			x: newX,
			y: newY,
		};
	};

	/**
	 * ドラッグ中のポインターの位置からドラッグ領域の座標を取得する
	 *
	 * @param {React.PointerEvent<SVGElement>} e ポインターイベント
	 * @returns {Point} ドラッグ領域の座標
	 */
	const getPointOnDrag = (e: React.PointerEvent<SVGElement>): Point => {
		// ドラッグ中のポインターの移動量から、ドラッグ中のこの領域の座標を計算
		let newX = startX.current + (e.clientX - startClientX.current);
		let newY = startY.current + (e.clientY - startClientY.current);

		if (dragPositioningFunction) {
			// ドラッグ位置変換関数が指定されている場合は、その関数を適用
			const p = dragPositioningFunction(newX, newY);
			newX = p.x;
			newY = p.y;
		}

		// 座標を調整して返却
		return adjustCoordinates(newX, newY);
	};

	/**
	 * ドラッグ領域内でのポインターの押下イベントハンドラ
	 */
	const handlePointerDown = (e: React.PointerEvent<SVGElement>): void => {
		// ポインターイベントが発生した要素のIDがこのドラッグ領域のIDと一致する場合のみ、ポインターキャプチャを設定する
		if ((e.target as HTMLElement).id === id) {
			e.currentTarget.setPointerCapture(e.pointerId);

			isPointerDown.current = true;

			// ドラッグ開始時のドラッグ領域の座標を記憶
			startX.current = x;
			startY.current = y;

			// ドラッグ開始時のブラウザウィンドウ上のポインタの座標を記憶
			startClientX.current = e.clientX;
			startClientY.current = e.clientY;

			// ポインター押下イベント発火
			onPointerDown?.({
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

		// ドラッグ座標を取得
		const dragPoint = getPointOnDrag(e);

		// ドラッグ中のイベント情報を作成
		const dragEvent = {
			id,
			type: "drag",
			startX: startX.current,
			startY: startY.current,
			endX: dragPoint.x,
			endY: dragPoint.y,
		} as DiagramDragEvent;

		if (
			!isDragging &&
			(Math.abs(e.clientX - startClientX.current) > DRAG_DEAD_ZONE ||
				Math.abs(e.clientY - startClientY.current) > DRAG_DEAD_ZONE)
		) {
			// ドラッグ中でない場合、かつポインターの移動量が一定以上の場合はドラッグ開始とする
			onDragStart?.({
				...dragEvent,
				type: "dragStart",
			});
			setIsDragging(true);
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
				detail: {
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
	};

	/**
	 * ドラッグ領域内でのポインターの離上イベントハンドラ
	 */
	const handlePointerUp = (e: React.PointerEvent<SVGElement>): void => {
		if (isDragging) {
			// ドラッグ座標を取得
			const dragPoint = getPointOnDrag(e);

			// ドラッグ中だった場合はドラッグ終了イベントを発火
			onDragEnd?.({
				id,
				type: "dragEnd",
				startX: startX.current,
				startY: startY.current,
				endX: dragPoint.x,
				endY: dragPoint.y,
			});

			// 親子関係にない図形でハンドリングする用のドラッグ終了イベント発火
			ref.current?.dispatchEvent(
				new CustomEvent(EVENT_NAME_BROADCAST_DRAG_END, {
					bubbles: true,
					detail: {
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
				id,
			});
		}

		// ポインターの離上イベント発火
		onPointerUp?.({
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

			newPoint = adjustCoordinates(newPoint.x, newPoint.y);

			const dragEvent = {
				id,
				type: "drag",
				startX: startX.current,
				startY: startY.current,
				endX: newPoint.x,
				endY: newPoint.y,
			} as DiagramDragEvent;

			if (!isArrowDragging.current) {
				startX.current = x;
				startY.current = y;

				onDragStart?.({
					...dragEvent,
					type: "dragStart",
				});
			}

			isArrowDragging.current = true;

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
					onDragEnd?.({
						id,
						type: "dragEnd",
						startX: x,
						startY: y,
						endX: x,
						endY: y,
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
			id,
			type: "dragEnd",
			startX: x,
			startY: y,
			endX: x,
			endY: y,
		} as DiagramDragEvent;

		if (isArrowDragging.current) {
			if (e.key === "Shift") {
				// 矢印キーによるドラッグ中にシフトキーが離された場合はドラッグ終了イベントを発火させ
				// SvgCanvas側に座標の更新を通知し、一度座標を更新する
				onDragEnd?.(dragEvent);
				onDragStart?.({
					...dragEvent,
					type: "dragStart",
				});
			}
			if (
				e.key === "ArrowRight" ||
				e.key === "ArrowLeft" ||
				e.key === "ArrowUp" ||
				e.key === "ArrowDown"
			) {
				// 矢印キーが離されたらドラッグ終了イベントを発火させSvgCanvas側に座標の更新を通知し、座標を更新する
				onDragEnd?.(dragEvent);

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
			id,
			isHovered: false,
		});
	};

	// 全体周知用ドラッグイベントリスナー登録
	// ハンドラ登録の頻発を回避するため、参照する値をuseRefで保持する
	const refBusVal = {
		id,
		x,
		y,
		type,
		ref,
		onDragOver,
		onDragLeave,
		onDrop,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		let handleBroadcastDrag: (e: Event) => void;
		let handleBroadcastDragEnd: (e: Event) => void;

		const { onDragOver, onDrop } = refBus.current;
		if (onDragOver) {
			handleBroadcastDrag = (e: Event) => {
				// refBusを介して参照値を取得
				const { id, x, y, type, ref, onDragOver, onDragLeave } = refBus.current;
				const customEvent = e as CustomEvent<BroadcastDragEvent>;

				// ドラッグ＆ドロップのイベント情報を作成
				const dragDropEvent = {
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
					if (!dragEntered.current) {
						dragEntered.current = true;
						onDragOver?.(dragDropEvent);
					}
				} else if (dragEntered.current) {
					dragEntered.current = false;
					onDragLeave?.(dragDropEvent);
				}
			};
			document.addEventListener(EVENT_NAME_BROADCAST_DRAG, handleBroadcastDrag);
		}

		if (onDrop) {
			handleBroadcastDragEnd = (e: Event) => {
				// refBusを介して参照値を取得
				const { id, x, y, type, ref, onDrop } = refBus.current;
				const customEvent = e as CustomEvent<BroadcastDragEvent>;
				if (
					isPointerOver(
						ref,
						customEvent.detail.clientX,
						customEvent.detail.clientY,
					)
				) {
					onDrop?.({
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
					});
				}
			};
			document.addEventListener(
				EVENT_NAME_BROADCAST_DRAG_END,
				handleBroadcastDragEnd,
			);
		}

		return () => {
			if (handleBroadcastDrag) {
				document.removeEventListener(
					EVENT_NAME_BROADCAST_DRAG,
					handleBroadcastDrag,
				);
			}
			if (handleBroadcastDragEnd) {
				document.removeEventListener(
					EVENT_NAME_BROADCAST_DRAG_END,
					handleBroadcastDragEnd,
				);
			}
		};
	}, []);

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
