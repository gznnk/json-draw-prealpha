// Reactのインポート
import type React from "react";
import { useRef } from "react";

// ライブラリのインポート
import styled from "@emotion/styled";

// SvgCanvas関連カスタムフックをインポート
import { useDrag } from "../../hooks/dragHooks";
import type { DragProps } from "../../hooks/dragHooks";

/**
 * SVGのcircle要素のProps型定義
 */
type CircleProps = {
	outline: string;
};

/**
 * SVGのcircle要素のスタイル定義
 */
const Circle = styled.circle<CircleProps>`
  :focus {
    outline: ${(props) => props.outline};
	outline-offset: 3px;
  }
`;

/**
 * ドラッグポイントコンポーネントのPropsの型定義
 */
export type DragPointProps = Omit<DragProps, "ref"> & {
	radius?: number;
	stroke?: string;
	fill?: string;
	cursor?: string;
	outline?: string;
	visible?: boolean;
	hidden?: boolean;
	pointerEventsDisabled?: boolean;
};

/**
 * ドラッグポイントコンポーネント
 *
 * @param {DragPointProps} props ドラッグポイントのProps
 * @param {string} [props.id] ID
 * @param {DiagramType} [props.type] 図形の種類
 * @param {Point} [props.point] 座標
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
	allowXDecimal = false,
	allowYDecimal = false,
	onDragStart,
	onDrag,
	onDragEnd,
	onDragOver,
	onDragLeave,
	onDrop,
	onHoverChange,
	dragPositioningFunction,
	radius = 5,
	stroke = "rgba(100, 149, 237, 0.8)",
	fill = "rgba(100, 149, 237, 0.8)",
	cursor = "move",
	outline = "1px rgba(100, 149, 237, 0.8) dashed",
	visible = true,
	hidden = false,
	pointerEventsDisabled = false,
}) => {
	const svgRef = useRef<SVGCircleElement>({} as SVGCircleElement);

	const dragProps = useDrag({
		id,
		type,
		point,
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
		<Circle
			id={id}
			cx={point.x}
			cy={point.y}
			r={radius}
			stroke={stroke}
			fill={fill}
			cursor={cursor}
			outline={outline}
			tabIndex={0}
			pointerEvents={pointerEventsDisabled ? "none" : "auto"}
			style={{ opacity: visible ? 1 : 0 }}
			ref={svgRef}
			{...dragProps}
		/>
	);
};

export default DragPoint;
