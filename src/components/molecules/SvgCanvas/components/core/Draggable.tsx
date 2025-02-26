// Reactのインポート
import type React from "react";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

// ライブラリのインポート
import styled from "@emotion/styled";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../types/CoordinateTypes";
import { DragDirection } from "../../types/CoordinateTypes";
import type {
	DiagramClickEvent,
	DiagramDragEvent,
	DiagramDragDropEvent,
	DiagramPointerEvent,
	DiagramHoverEvent,
} from "../../types/EventTypes";
import type { DiagramType } from "../../types/DiagramTypes";

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
 * ドラッグ領域用のG要素のPropsの型定義
 */
type DraggableGProps = {
	cursor: string;
	opacity?: number;
	outline?: string;
	outlineOffset?: string;
};

/**
 * ドラッグ領域用のG要素
 */
const DraggableG = styled.g<DraggableGProps>`
    cursor: ${({ cursor }) => cursor};
	opacity: ${({ opacity }) => opacity};
    &:focus {
        outline: ${({ outline }) => outline};
        outline-offset: ${({ outlineOffset }) => outlineOffset};
    }
`;

/**
 * ドラッグ領域のPropsの型定義
 *
 * @type {Object} DraggableProps
 * @property {string} [key] キー
 * @property {string} [id] ID（子要素にも同じIDを設定すること。しない場合は正しく動作しなくなる）
 * @property {DiagramType} [type] 図形の種類
 * @property {Point} [point] 座標
 * @property {DragDirection} [direction] ドラッグ方向
 * @property {boolean} [allowXDecimal] X座標の小数点許可フラグ
 * @property {boolean} [allowYDecimal] Y座標の小数点許可フラグ
 * @property {string} [cursor] カーソル
 * @property {boolean} [visible] 表示フラグ
 * @property {number} [tabIndex] タブインデックス
 * @property {string} [outline] アウトライン
 * @property {string} [outlineOffset] アウトラインオフセット
 * @property {SVGGElement} [ref] ドラッグ領域用のG要素への参照
 * @property {(e: DiagramPointerEvent) => void} [onPointerDown] ポインター押下時のイベントハンドラ
 * @property {(e: DiagramPointerEvent) => void} [onPointerUp] ポインター離上時のイベントハンドラ
 * @property {(e: DiagramClickEvent) => void} [onClick] クリック時のイベントハンドラ
 * @property {(e: DiagramDragEvent) => void} [onDragStart] ドラッグ開始時のイベントハンドラ
 * @property {(e: DiagramDragEvent) => void} [onDrag] ドラッグ中のイベントハンドラ
 * @property {(e: DiagramDragEvent) => void} [onDragEnd] ドラッグ終了時のイベントハンドラ
 * @property {(e: DiagramDragDropEvent) => void} [onDragOver] ドラッグオーバー時のイベントハンドラ
 * @property {(e: DiagramDragDropEvent) => void} [onDragLeave] ドラッグリーブ時のイベントハンドラ
 * @property {(e: DiagramDragDropEvent) => void} [onDrop] ドロップ時のイベントハンドラ
 * @property {(e: DiagramHoverEvent) => void} [onHoverChange] ホバー変更時のイベントハンドラ
 * @property {(point: Point) => Point} [dragPositioningFunction] ドラッグ位置変換関数
 * @property {React.ReactNode} [children] 子要素
 */
export type DraggableProps = {
	key?: string;
	id: string;
	type?: DiagramType;
	point: Point;
	direction?: DragDirection;
	allowXDecimal?: boolean;
	allowYDecimal?: boolean;
	cursor?: string;
	visible?: boolean;
	tabIndex?: number;
	outline?: string;
	outlineOffset?: string;
	ref?: SVGGElement;
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
	children?: React.ReactNode;
};

/**
 * ドラッグ領域コンポーネント
 *
 * このコンポーネントでは座標系としてはX座標とY座標だけを表現し、自身では幅と高さを表現しない。
 * 親側から、幅と高さを持つ要素をG要素の子要素に指定することで、ドラッグ領域の範囲を表現する。
 * 座標はStateにも保持しているが、これはキーボードの矢印キーによる高頻度の再描画に耐えられるように内部的にも保持しているだけであり、
 * 前提としては正規の座標はSvgCanvas側で保持され、それがPropsで渡されることにより座標の更新を行うものとする。
 * ただし、ドラッグ中の描画は、描画処理負荷軽減のため、DOMを直接操作することで行い、
 * ドラッグ完了時にPropsで渡されたコールバック関数を呼び出すことで、SvgCanvas側に座標の更新を通知する。
 *
 * @param {DraggableProps} props ドラッグ領域のProps
 * @returns {JSX.Element} ドラッグ領域コンポーネント
 */
const Draggable = forwardRef<SVGGElement, DraggableProps>(
	(
		{
			key,
			id,
			point,
			type,
			direction = DragDirection.All,
			allowXDecimal = false,
			allowYDecimal = false,
			cursor = "move",
			visible = true,
			tabIndex = 0,
			outline = "none",
			outlineOffset = "0px",
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
			children,
		},
		ref,
	) => {
		// このドラッグ領域の座標
		const [state, setState] = useState({ point });
		// このドラッグ領域でポインターが押されたかどうかのフラグ
		const [isPointerDown, setIsPointerDown] = useState(false);
		// ドラッグ中かのフラグ
		const [isDragging, setIsDragging] = useState(false);
		// 矢印キーによるドラッグ中かのフラグ
		const [isArrowDragging, setIsArrowDragging] = useState(false);
		// ドラッグエンターしたかのフラグ
		const [dragEntered, setDragEntered] = useState(false); // TODO refのほうがいいかも

		// ドラッグ開始時の、このドラッグ領域の座標からのポインターの相対位置
		const startX = useRef(0);
		const startY = useRef(0);

		// ドラッグ領域用のG要素への参照
		const gRef = useRef<SVGGElement>({} as SVGGElement);

		// ドラッグ領域用のG要素への参照を親側に公開
		useImperativeHandle(ref, () => gRef.current);

		// Propsで渡された座標が変更された場合、Stateにも反映する
		useEffect(() => {
			setState({ point });
		}, [point]);

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
		const getPointOnDrag = (e: React.PointerEvent<SVGElement>): Point => {
			// ドラッグ中のポインターの移動量から、ドラッグ中のこの領域の座標を計算
			let x = state.point.x + (e.clientX - startX.current);
			let y = state.point.y + (e.clientY - startY.current);

			if (direction === DragDirection.Horizontal) {
				// 水平移動の場合はY座標を固定
				y = state.point.y;
			} else if (direction === DragDirection.Vertical) {
				// 垂直移動の場合はX座標を固定
				x = state.point.x;
			} else if (dragPositioningFunction) {
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
		};

		// TODO 使ってない
		/**
		 * ドラッグ中のポインターの座標（SvgCanvas上の座標）を取得する
		 *
		 * @param e
		 * @returns
		 */
		const getPointerPointOnDrag = (
			e: React.PointerEvent<SVGElement>,
		): Point => {
			const dragX = state.point.x + (e.clientX - startX.current);
			const dragY = state.point.y + (e.clientY - startY.current);
			const x = dragX + e.clientX - gRef.current?.getBoundingClientRect().left;
			const y = dragY + e.clientY - gRef.current?.getBoundingClientRect().top;

			return {
				x,
				y,
			};
		};

		/**
		 * ドラッグ領域内でのポインターの押下イベントハンドラ
		 *
		 * @param {React.PointerEvent<SVGElement>} e ポインターイベント
		 * @returns {void}
		 */
		const handlePointerDown = (e: React.PointerEvent<SVGElement>): void => {
			// ポインターイベントが発生した要素のIDがこのドラッグ領域のIDと一致する場合のみ、ポインターキャプチャを設定する
			if ((e.target as HTMLElement).id === id) {
				e.currentTarget.setPointerCapture(e.pointerId);

				setIsPointerDown(true);

				// ドラッグ開始時の座標を記憶
				startX.current = e.clientX;
				startY.current = e.clientY;

				// ポインター押下イベント発火
				onPointerDown?.({
					id,
				});
			}
		};

		/**
		 * ドラッグ領域内でのポインターの移動イベントハンドラ
		 *
		 * @param {React.PointerEvent<SVGElement>} e ポインターイベント
		 * @returns {void}
		 */
		const handlePointerMove = (e: React.PointerEvent<SVGElement>): void => {
			if (!isPointerDown) {
				// このドラッグ領域内でポインターが押されていない場合は何もしない
				return;
			}

			// ドラッグ座標を取得
			const dragPoint = getPointOnDrag(e);

			// ドラッグ中のイベント情報を作成
			const dragEvent = {
				id,
				startPoint: state.point,
				endPoint: dragPoint,
			};

			if (
				!isDragging &&
				(Math.abs(e.clientX - startX.current) > 3 ||
					Math.abs(e.clientY - startY.current) > 3)
			) {
				// ドラッグ中でない場合、かつポインターの移動量が一定以上の場合はドラッグ開始とする
				onDragStart?.(dragEvent);
				setIsDragging(true);
			}

			if (!isDragging) {
				// ドラッグ中でない場合は何もしない
				return;
			}

			// 描画処理負荷軽減のため、DOMを直接操作し、ドラッグ中の描画を行う
			gRef?.current?.setAttribute(
				"transform",
				`translate(${dragEvent.endPoint.x}, ${dragEvent.endPoint.y})`,
			);

			// ドラッグ中イベント発火
			// 親側ではこのドラッグ領域の座標の更新は行わないが（行ってはダメ）、通知のために発火する
			onDrag?.(dragEvent);

			// 親子関係にない図形でハンドリングする用のドラッグ中イベント発火
			gRef.current?.dispatchEvent(
				new CustomEvent("DraggableDrag", {
					bubbles: true,
					detail: {
						id,
						type: type,
						startPoint: state.point,
						endPoint: dragPoint,
						clientPoint: {
							x: e.clientX,
							y: e.clientY,
						},
					} as DraggableDragEvent,
				}),
			);
		};

		/**
		 * ドラッグ領域内でのポインターの離上イベントハンドラ
		 *
		 * @param {React.PointerEvent<SVGElement>} e ポインターイベント
		 * @returns {void}
		 */
		const handlePointerUp = (e: React.PointerEvent<SVGElement>): void => {
			if (isDragging) {
				// ドラッグ座標を取得
				const dragPoint = getPointOnDrag(e);

				// ドラッグ中だった場合はドラッグ終了イベントを発火
				onDragEnd?.({
					id,
					startPoint: state.point,
					endPoint: dragPoint,
				});

				// 親子関係にない図形でハンドリングする用のドラッグ終了イベント発火
				gRef.current?.dispatchEvent(
					new CustomEvent("DraggableDragEnd", {
						bubbles: true,
						detail: {
							id,
							type: type,
							startPoint: state.point,
							endPoint: dragPoint,
							clientPoint: {
								x: e.clientX,
								y: e.clientY,
							},
						} as DraggableDragEvent,
					}),
				);
			}

			if (isPointerDown && !isDragging) {
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
			setIsPointerDown(false);
		};

		// TODO: 以下コメント未整理

		const handleKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
			// ポインターダウン中は何もしない
			if (isPointerDown) {
				return;
			}
			const movePoint = (dx: number, dy: number) => {
				let newPoint = {
					x: state.point.x + dx,
					y: state.point.y + dy,
				};

				if (direction === DragDirection.Horizontal) {
					newPoint.y = state.point.y;
				} else if (direction === DragDirection.Vertical) {
					newPoint.x = state.point.x;
				} else if (dragPositioningFunction) {
					newPoint = dragPositioningFunction({ ...newPoint });
				}

				newPoint = adjustCoordinates(newPoint);

				const dragEvent = {
					id,
					startPoint: state.point,
					endPoint: newPoint,
				};

				onDragStart?.(dragEvent);
				onDrag?.(dragEvent);
				setState({
					point: newPoint,
				});
				setIsArrowDragging(true);
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
					if (isArrowDragging) {
						// 矢印キーによるドラッグ中にシフトキーが押された場合はドラッグを終了させる。
						// ドラッグ終了イベントを発火させSvgCanvas側に座標の更新を通知し、座標を更新する
						onDragEnd?.({
							id,
							startPoint: state.point,
							endPoint: state.point,
						});
						// 矢印キーによるドラッグ終了とマーク
						setIsArrowDragging(false);
					}
					break;
				default:
					break;
			}
		};

		const handleKeyUp = (e: React.KeyboardEvent<SVGGElement>) => {
			// ポインターダウン中は何もしない
			if (isPointerDown) {
				return;
			}

			if (isArrowDragging) {
				if (e.key === "Shift") {
					// 矢印キーによるドラッグ中にシフトキーが離された場合はドラッグ終了イベントを発火させ
					// SvgCanvas側に座標の更新を通知し、一度座標を更新する
					const dragEvent = {
						id,
						startPoint: state.point,
						endPoint: state.point,
					};
					onDragEnd?.(dragEvent);
					onDragStart?.(dragEvent);
				}
				if (
					e.key === "ArrowRight" ||
					e.key === "ArrowLeft" ||
					e.key === "ArrowUp" ||
					e.key === "ArrowDown"
				) {
					// 矢印キー離されたらドラッグ終了イベントを発火させSvgCanvas側に座標の更新を通知し、座標を更新する
					onDragEnd?.({
						id,
						startPoint: state.point,
						endPoint: state.point,
					});

					// 矢印キーによるドラッグ終了とマーク
					setIsArrowDragging(false);
				}
			}
		};

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
				const svgCanvas = gRef.current?.ownerSVGElement as SVGSVGElement;
				const svgPoint = svgCanvas.createSVGPoint();

				if (svgPoint) {
					svgPoint.x = clientPoint.x - point.x;
					svgPoint.y = clientPoint.y - point.y;
					const transformedPoint = svgPoint.matrixTransform(
						svgCanvas.getScreenCTM()?.inverse(),
					);
					const svg = gRef.current?.firstChild;
					if (svg instanceof SVGGeometryElement) {
						return (
							svg.isPointInFill(transformedPoint) ||
							svg.isPointInStroke(transformedPoint)
						);
					}
				}
				return false;
			},
			[point],
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
						setDragEntered(true);
						onDragOver?.(dragDropEvent);
					} else if (dragEntered) {
						setDragEntered(false);
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
		}, [
			id,
			point,
			type,
			dragEntered,
			isPointerOver,
			onDragOver,
			onDragLeave,
			onDrop,
		]);

		return (
			<DraggableG
				key={key}
				transform={`translate(${state.point.x}, ${state.point.y})`}
				tabIndex={tabIndex}
				cursor={cursor}
				opacity={visible ? undefined : 0}
				outline={outline}
				outlineOffset={outlineOffset}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onKeyDown={handleKeyDown}
				onKeyUp={handleKeyUp}
				onPointerEnter={handlePointerEnter}
				onPointerLeave={handlePointerLeave}
				ref={gRef}
			>
				{children}
			</DraggableG>
		);
	},
);

export default Draggable;
