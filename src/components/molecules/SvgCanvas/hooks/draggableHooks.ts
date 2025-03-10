// Reactのインポート
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

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

// ユーティリティをインポート
// import { getLogger } from "../../../../utils/Logger";

// ロガーを取得
// const logger = getLogger("draggableHooks");

/**
 * 全体通知用ドラッグイベントの型定義
 */
type DraggableDragEvent = {
	id: string;
	type: DiagramType;
	startPoint: Point;
	endPoint: Point;
	clientPoint: Point;
};

/**
 * ドラッグ領域のPropsの型定義
 */
export type DraggableProps = {
	id: string;
	type?: DiagramType;
	point: Point;
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
	onHoverChange?: (e: DiagramHoverEvent) => void;
	dragPositioningFunction?: (point: Point) => Point;
};

/**
 * ドラッグ可能な領域を作成するカスタムフック
 *
 * @param {DraggableProps} props ドラッグ領域のProps
 * @param {string} props.id ID（ドラッグ可能にする要素にも同じIDを設定すること。しない場合は正しく動作しなくなる）
 * @param {DiagramType} [props.type] 図形の種類
 * @param {Point} props.point 座標
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
 * @param {(e: DiagramHoverEvent) => void} [props.onHoverChange] ホバー変更時のイベントハンドラ
 * @param {(point: Point) => Point} [props.dragPositioningFunction] ドラッグ位置変換関数
 */
export const useDraggable = (props: DraggableProps) => {
	const {
		id,
		point,
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
		onHoverChange,
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
	const startPoint = useRef<Point>({ x: 0, y: 0 });
	// ドラッグ開始時のブラウザウィンドウ上のポインタの座標
	const startClientPoint = useRef<Point>({ x: 0, y: 0 });

	/**
	 * 座標を調整する
	 *
	 * 基本的には座標は整数値とし、小数点での指定が必要な場合のみ小数点以下を許容する。
	 *
	 * @param {Point} p 座標
	 * @returns {Point} 調整後の座標
	 */
	const adjustCoordinates = useCallback(
		(p: Point) => {
			let x = p.x;
			let y = p.y;

			if (!allowXDecimal) {
				x = Math.round(x);
			}

			if (!allowYDecimal) {
				y = Math.round(y);
			}

			return {
				x,
				y,
			};
		},
		[allowXDecimal, allowYDecimal],
	);

	/**
	 * ドラッグ中のポインターの位置からドラッグ領域の座標を取得する
	 *
	 * @param {React.PointerEvent<SVGElement>} e ポインターイベント
	 * @returns {Point} ドラッグ領域の座標
	 */
	const getPointOnDrag = useCallback(
		(e: React.PointerEvent<SVGElement>): Point => {
			// ドラッグ中のポインターの移動量から、ドラッグ中のこの領域の座標を計算
			let x = startPoint.current.x + (e.clientX - startClientPoint.current.x);
			let y = startPoint.current.y + (e.clientY - startClientPoint.current.y);

			if (dragPositioningFunction) {
				// ドラッグ位置変換関数が指定されている場合は、その関数を適用
				const p = dragPositioningFunction({
					x,
					y,
				});
				x = p.x;
				y = p.y;
			}

			// 座標を調整して返却
			return adjustCoordinates({
				x,
				y,
			});
		},
		[dragPositioningFunction, adjustCoordinates],
	);

	/**
	 * ドラッグ領域内でのポインターの押下イベントハンドラ
	 *
	 * @param {React.PointerEvent<SVGElement>} e ポインターイベント
	 * @returns {void}
	 */
	const handlePointerDown = useCallback(
		(e: React.PointerEvent<SVGElement>): void => {
			// ポインターイベントが発生した要素のIDがこのドラッグ領域のIDと一致する場合のみ、ポインターキャプチャを設定する
			if ((e.target as HTMLElement).id === id) {
				e.currentTarget.setPointerCapture(e.pointerId);

				isPointerDown.current = true;

				// ドラッグ開始時のドラッグ領域の座標を記憶
				startPoint.current = point;

				// ドラッグ開始時のブラウザウィンドウ上のポインタの座標を記憶
				startClientPoint.current = {
					x: e.clientX,
					y: e.clientY,
				};

				// ポインター押下イベント発火
				onPointerDown?.({
					id,
				});
			}
		},
		[onPointerDown, id, point],
	);

	/**
	 * ドラッグ領域内でのポインターの移動イベントハンドラ
	 *
	 * @param {React.PointerEvent<SVGElement>} e ポインターイベント
	 * @returns {void}
	 */
	const handlePointerMove = useCallback(
		(e: React.PointerEvent<SVGElement>): void => {
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
				startPoint: startPoint.current,
				endPoint: dragPoint,
			} as DiagramDragEvent;

			if (
				!isDragging &&
				(Math.abs(e.clientX - startClientPoint.current.x) > 3 ||
					Math.abs(e.clientY - startClientPoint.current.y) > 3)
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
				new CustomEvent("DraggableDrag", {
					bubbles: true,
					detail: {
						id,
						type: type,
						startPoint: startPoint.current,
						endPoint: dragPoint,
						clientPoint: {
							x: e.clientX,
							y: e.clientY,
						},
					} as DraggableDragEvent,
				}),
			);
		},
		[getPointOnDrag, onDragStart, onDrag, id, type, ref, isDragging],
	);

	/**
	 * ドラッグ領域内でのポインターの離上イベントハンドラ
	 *
	 * @param {React.PointerEvent<SVGElement>} e ポインターイベント
	 * @returns {void}
	 */
	const handlePointerUp = useCallback(
		(e: React.PointerEvent<SVGElement>): void => {
			if (isDragging) {
				// ドラッグ座標を取得
				const dragPoint = getPointOnDrag(e);

				// ドラッグ中だった場合はドラッグ終了イベントを発火
				onDragEnd?.({
					id,
					type: "dragEnd",
					startPoint: startPoint.current,
					endPoint: dragPoint,
				});

				// 親子関係にない図形でハンドリングする用のドラッグ終了イベント発火
				ref.current?.dispatchEvent(
					new CustomEvent("DraggableDragEnd", {
						bubbles: true,
						detail: {
							id,
							type: type,
							startPoint: startPoint.current,
							endPoint: dragPoint,
							clientPoint: {
								x: e.clientX,
								y: e.clientY,
							},
						} as DraggableDragEvent,
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
		},
		[
			getPointOnDrag,
			onDragEnd,
			onClick,
			onPointerUp,
			id,
			type,
			ref,
			isDragging,
		],
	);

	/**
	 * キー押下イベントハンドラ
	 *
	 * @param {React.KeyboardEvent<SVGGElement>} e キーボードイベント
	 * @returns {void}
	 */
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<SVGGElement>) => {
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
					x: point.x + dx,
					y: point.y + dy,
				};

				if (dragPositioningFunction) {
					newPoint = dragPositioningFunction({ ...newPoint });
				}

				newPoint = adjustCoordinates(newPoint);

				const dragEvent = {
					id,
					type: "drag",
					startPoint: startPoint.current,
					endPoint: newPoint,
				} as DiagramDragEvent;

				if (!isArrowDragging.current) {
					startPoint.current = point;

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
							startPoint: point,
							endPoint: point,
						});

						// 矢印キーによるドラッグ終了とマーク
						isArrowDragging.current = false;
					}
					break;
				default:
					break;
			}
		},
		[
			dragPositioningFunction,
			adjustCoordinates,
			onDragStart,
			onDrag,
			onDragEnd,
			id,
			point,
		],
	);

	/**
	 * キー離上イベントハンドラ
	 *
	 * @param {React.KeyboardEvent<SVGGElement>} e キーボードイベント
	 * @returns {void}
	 */
	const handleKeyUp = useCallback(
		(e: React.KeyboardEvent<SVGGElement>) => {
			// ポインターダウン中は何もしない
			if (isPointerDown.current) {
				return;
			}

			// 矢印キー移動完了時のイベント情報を作成
			const dragEvent = {
				id,
				type: "dragEnd",
				startPoint: point,
				endPoint: point,
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
		},
		[onDragStart, onDragEnd, id, point],
	);

	/**
	 * ポインターエンター時のイベントハンドラ
	 *
	 * @returns {void}
	 */
	const handlePointerEnter = useCallback(() => {
		// ホバー時のイベント発火
		onHoverChange?.({
			id,
			isHovered: true,
		});
	}, [onHoverChange, id]);

	/**
	 * ポインターリーブ時のイベントハンドラ
	 *
	 * @returns {void}
	 */
	const handlePointerLeave = useCallback(() => {
		// ホバー解除時のイベント発火
		onHoverChange?.({
			id,
			isHovered: false,
		});
	}, [onHoverChange, id]);

	/**
	 * ポインターがこのドラッグ領域上にあるかどうかを判定する
	 * ポインターキャプチャー時は他の要素でポインター関連のイベントが発火しないため、自力で判定する必要がある
	 *
	 * @param {Point} clientPoint ポインターの座標
	 * @returns {boolean} ポインターがこのドラッグ領域上にあるかどうか
	 */
	const isPointerOver = useCallback(
		(clientPoint: Point) => {
			const svgCanvas = ref.current?.ownerSVGElement as SVGSVGElement;
			const svgPoint = svgCanvas.createSVGPoint();

			if (svgPoint) {
				svgPoint.x = clientPoint.x;
				svgPoint.y = clientPoint.y;
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
		},
		[ref],
	);

	// 全体周知用ドラッグイベントリスナー登録
	useEffect(() => {
		let handleDraggableDrag: (e: Event) => void;
		let handleDraggableDragEnd: (e: Event) => void;

		if (onDragOver) {
			handleDraggableDrag = (e: Event) => {
				const customEvent = e as CustomEvent<DraggableDragEvent>;

				// ドラッグ＆ドロップのイベント情報を作成
				const dragDropEvent = {
					dropItem: {
						id: customEvent.detail.id,
						type: customEvent.detail.type,
						point: customEvent.detail.startPoint,
					},
					dropTargetItem: {
						id,
						type,
						point,
					},
				};

				if (isPointerOver(customEvent.detail.clientPoint)) {
					if (!dragEntered.current) {
						dragEntered.current = true;
						onDragOver?.(dragDropEvent);
					}
				} else if (dragEntered.current) {
					dragEntered.current = false;
					onDragLeave?.(dragDropEvent);
				}
			};
			document?.addEventListener("DraggableDrag", handleDraggableDrag);
		}

		if (onDrop) {
			handleDraggableDragEnd = (e: Event) => {
				const customEvent = e as CustomEvent<DraggableDragEvent>;
				if (isPointerOver(customEvent.detail.clientPoint)) {
					onDrop?.({
						dropItem: {
							id: customEvent.detail.id,
							type: customEvent.detail.type,
							point: customEvent.detail.startPoint,
						},
						dropTargetItem: {
							id,
							type,
							point,
						},
					});
				}
			};
			document?.addEventListener("DraggableDragEnd", handleDraggableDragEnd);
		}

		return () => {
			if (handleDraggableDrag) {
				document?.removeEventListener("DraggableDrag", handleDraggableDrag);
			}
			if (handleDraggableDragEnd) {
				document?.removeEventListener(
					"DraggableDragEnd",
					handleDraggableDragEnd,
				);
			}
		};
	}, [id, point, type, isPointerOver, onDragOver, onDragLeave, onDrop]);

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
