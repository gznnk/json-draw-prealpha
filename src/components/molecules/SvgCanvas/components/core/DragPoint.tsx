// Reactのインポート
import type React from "react";
import { useRef } from "react";

// SvgCanvas関連カスタムフックをインポート
import { useDraggable } from "../../hooks/draggableHooks";
import type { DraggableProps } from "../../hooks/draggableHooks";

/**
 * ドラッグポイントコンポーネントのPropsの型定義
 */
export type DragPointProps = Omit<DraggableProps, "ref"> & {
	color?: string;
	cursor?: string;
	hidden?: boolean;
};

/**
 * ドラッグポイントコンポーネント
 *
 * @param {DragPointProps} props ドラッグポイントのProps
 * @param {string} [props.id] ID
 * @param {DiagramType} [props.type] 図形の種類
 * @param {Point} [props.point] 座標
 * @param {DragDirection} [props.direction] ドラッグ方向
 * @param {boolean} [props.allowXDecimal] X座標の小数点許可フラグ
 * @param {boolean} [props.allowYDecimal] Y座標の小数点許可フラグ
 * @param {string} [props.cursor] カーソル
 * @param {boolean} [props.visible] 表示フラグ
 * @param {string} [props.color] 色
 * @param {boolean} [props.hidden] 非表示フラグ
 * @param {(e: DiagramDragEvent) => void} [props.onDragStart] ドラッグ開始時のイベントハンドラ
 * @param {(e: DiagramDragEvent) => void} [props.onDrag] ドラッグ中のイベントハンドラ
 * @param {(e: DiagramDragEvent) => void} [props.onDragEnd] ドラッグ終了時のイベントハンドラ
 * @param {(e: DiagramDragDropEvent) => void} [props.onDragOver] ドラッグオーバー時のイベントハンドラ
 * @param {(e: DiagramDragDropEvent) => void} [props.onDragLeave] ドラッグリーブ時のイベントハンドラ
 * @param {(e: DiagramDragDropEvent) => void} [props.onDrop] ドロップ時のイベントハンドラ
 * @param {(e: DiagramHoverEvent) => void} [props.onHoverChange] ホバー変更時のイベントハンドラ
 * @param {(point: Point) => Point} [props.dragPositioningFunction] ドラッグ位置変換関数
 * @returns {JSX.Element} ドラッグポイントコンポーネント
 */
const DragPoint: React.FC<DragPointProps> = ({
	id,
	type,
	point,
	direction,
	allowXDecimal = false,
	allowYDecimal = false,
	cursor,
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
}) => {
	const svgRef = useRef<SVGCircleElement>({} as SVGCircleElement);

	const draggableProps = useDraggable({
		id,
		type,
		point,
		direction,
		allowXDecimal,
		allowYDecimal,
		ref: svgRef,
		onDragStart,
		onDrag,
		onDragEnd,
		onDragOver,
		onDragLeave,
		onDrop,
		onHoverChange,
		dragPositioningFunction,
	});

	if (hidden) {
		return;
	}

	return (
		<circle
			id={id}
			cx={point.x}
			cy={point.y}
			r="5"
			fill={color}
			cursor={cursor}
			tabIndex={0}
			ref={svgRef}
			{...draggableProps}
		/>
	);
};

export default DragPoint;
