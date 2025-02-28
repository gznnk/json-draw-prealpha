// Reactのインポート
import { forwardRef, useImperativeHandle, useRef } from "react";

// SvgCanvas関連コンポーネントをインポート
import type { DraggableProps } from "../core/Draggable";
import Draggable from "../core/Draggable";

/**
 * ドラッグポイントコンポーネントのPropsの型定義
 *
 * @property {string} [id] ID
 * @property {DiagramType} [type] 図形の種類
 * @property {Point} [point] 座標
 * @property {DragDirection} [direction] ドラッグ方向
 * @property {boolean} [allowXDecimal] X座標の小数点許可フラグ
 * @property {boolean} [allowYDecimal] Y座標の小数点許可フラグ
 * @property {string} [cursor] カーソル
 * @property {boolean} [visible] 表示フラグ
 * @property {(e: DiagramDragEvent) => void} [onDragStart] ドラッグ開始時のイベントハンドラ
 * @property {(e: DiagramDragEvent) => void} [onDrag] ドラッグ中のイベントハンドラ
 * @property {(e: DiagramDragEvent) => void} [onDragEnd] ドラッグ終了時のイベントハンドラ
 * @property {(e: DiagramDragDropEvent) => void} [onDragOver] ドラッグオーバー時のイベントハンドラ
 * @property {(e: DiagramDragDropEvent) => void} [onDragLeave] ドラッグリーブ時のイベントハンドラ
 * @property {(e: DiagramDragDropEvent) => void} [onDrop] ドロップ時のイベントハンドラ
 * @property {(e: DiagramHoverEvent) => void} [onHoverChange] ホバー変更時のイベントハンドラ
 * @property {(point: Point) => Point} [dragPositioningFunction] ドラッグ位置変換関数
 * @property {string} [color] 色
 * @property {boolean} [hidden] 非表示フラグ
 */
export type DragPointProps = DraggableProps & {
	color?: string;
	hidden?: boolean;
};

/**
 * ドラッグポイントコンポーネント
 *
 * @param {DragPointProps} props ドラッグポイントのProps
 * @returns {JSX.Element} ドラッグポイントコンポーネント
 */
const DragPoint = forwardRef<SVGGElement, DragPointProps>(
	(
		{
			id,
			type,
			point,
			direction,
			allowXDecimal = false,
			allowYDecimal = false,
			cursor,
			visible,
			onDragStart,
			onDrag,
			onDragEnd,
			onDragOver,
			onDragLeave,
			onDrop,
			onHoverChange,
			dragPositioningFunction,
			color = "rgba(61, 90, 128, 0.8)",
			hidden = false,
		},
		ref,
	) => {
		const svgRef = useRef<SVGGElement>({} as SVGGElement);
		useImperativeHandle(ref, () => svgRef.current);

		if (hidden) {
			return;
		}

		return (
			<Draggable
				id={id}
				type={type}
				point={point}
				direction={direction}
				allowXDecimal={allowXDecimal}
				allowYDecimal={allowYDecimal}
				cursor={cursor}
				visible={visible}
				outline="1px dashed blue"
				outlineOffset="4px"
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onDrop={onDrop}
				onHoverChange={onHoverChange}
				dragPositioningFunction={dragPositioningFunction}
				ref={svgRef}
			>
				<circle id={id} cx={0} cy={0} r="5" fill={color} />
			</Draggable>
		);
	},
);

export default DragPoint;
