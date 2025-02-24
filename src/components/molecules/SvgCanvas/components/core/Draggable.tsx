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
	DiagramPointerEvent,
} from "../../types/EventTypes";

/**
 * ドラッグ領域用のG要素のPropsの型定義
 */
type DraggableGProps = {
	cursor: string;
	outline?: string;
	outlineOffset?: string;
};

/**
 * ドラッグ領域用のG要素
 */
const DraggableG = styled.g<DraggableGProps>`
    cursor: ${({ cursor }) => cursor};
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
 * @property {Point} [point] 座標
 * @property {DragDirection} [direction] ドラッグ方向
 * @property {boolean} [allowXDecimal] X座標の小数点許可フラグ
 * @property {boolean} [allowYDecimal] Y座標の小数点許可フラグ
 * @property {string} [cursor] カーソル
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
 * @property {(point: Point) => Point} [dragPositioningFunction] ドラッグ位置変換関数
 * @property {React.ReactNode} [children] 子要素
 */
export type DraggableProps = {
	key?: string;
	id: string;
	point: Point;
	direction?: DragDirection;
	allowXDecimal?: boolean;
	allowYDecimal?: boolean;
	cursor?: string;
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
			direction = DragDirection.All,
			allowXDecimal = false,
			allowYDecimal = false,
			cursor = "move",
			tabIndex = 0,
			outline = "none",
			outlineOffset = "0px",
			onPointerDown,
			onPointerUp,
			onClick,
			onDragStart,
			onDrag,
			onDragEnd,
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
			let x = e.clientX - startX.current;
			let y = e.clientY - startY.current;

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

				// ドラッグ開始時の、このドラッグ領域の座標からのポインターの相対位置を計算して保持
				startX.current = e.clientX - state.point.x;
				startY.current = e.clientY - state.point.y;

				// ポインター押下イベント発火
				onPointerDown?.({
					id,
					point: getPointOnDrag(e),
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

			// ドラッグ中のイベント情報を作成
			const event = {
				id,
				old: {
					point: state.point,
					width: 0,
					height: 0,
				},
				new: {
					point: getPointOnDrag(e),
					width: 0,
					height: 0,
				},
			};

			if (
				!isDragging &&
				(Math.abs(e.clientX - state.point.x - startX.current) > 3 ||
					Math.abs(e.clientY - state.point.y - startY.current) > 3)
			) {
				// ドラッグ中でない場合、かつポインターの移動量が一定以上の場合はドラッグ開始とする
				onDragStart?.(event);
				setIsDragging(true);
			}

			if (!isDragging) {
				// ドラッグ中でない場合は何もしない
				return;
			}

			// 描画処理負荷軽減のため、DOMを直接操作し、ドラッグ中の描画を行う
			gRef?.current?.setAttribute(
				"transform",
				`translate(${event.new.point.x}, ${event.new.point.y})`,
			);

			// ドラッグ中イベント発火
			// 親側ではこのドラッグ領域の座標の更新は行わないが（行ってはダメ）、通知のために発火する
			onDrag?.(event);
		};

		/**
		 * ドラッグ領域内でのポインターの離上イベントハンドラ
		 *
		 * @param {React.PointerEvent<SVGElement>} e ポインターイベント
		 * @returns {void}
		 */
		const handlePointerUp = (e: React.PointerEvent<SVGElement>): void => {
			// ドラッグ後のドラッグ領域の座標を取得
			const newPoint = getPointOnDrag(e);

			if (isDragging) {
				// ドラッグ中だった場合はドラッグ終了イベントを発火
				onDragEnd?.({
					id,
					old: {
						point: state.point,
						width: 0,
						height: 0,
					},
					new: {
						point: newPoint,
						width: 0,
						height: 0,
					},
				});
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
				point: newPoint,
			});

			// フラグのクリア
			setIsDragging(false);
			setIsPointerDown(false);
		};

		// TODO: 以下コメント未整理

		const handleKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
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
					old: {
						point: state.point,
						width: 0,
						height: 0,
					},
					new: {
						point: newPoint,
						width: 0,
						height: 0,
					},
				};

				onDragStart?.(dragEvent);
				onDrag?.(dragEvent);
				setState({
					point: newPoint,
				});
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
				default:
					break;
			}
		};

		const handleKeyUp = (e: React.KeyboardEvent<SVGGElement>) => {
			if (
				e.key === "ArrowRight" ||
				e.key === "ArrowLeft" ||
				e.key === "ArrowUp" ||
				e.key === "ArrowDown"
			) {
				onDragEnd?.({
					id,
					old: {
						point: state.point,
						width: 0,
						height: 0,
					},
					new: {
						point: state.point,
						width: 0,
						height: 0,
					},
				});
			}
		};

		return (
			<DraggableG
				key={key}
				transform={`translate(${state.point.x}, ${state.point.y})`}
				tabIndex={tabIndex}
				cursor={cursor}
				outline={outline}
				outlineOffset={outlineOffset}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onKeyDown={handleKeyDown}
				onKeyUp={handleKeyUp}
				ref={gRef}
			>
				{children}
			</DraggableG>
		);
	},
);

export default Draggable;
