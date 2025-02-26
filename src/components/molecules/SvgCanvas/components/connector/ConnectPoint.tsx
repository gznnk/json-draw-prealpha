// Reactのインポート
import type React from "react";
import { memo, useState, useRef, useCallback, useEffect } from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../types/CoordinateTypes";
// SvgCanvas関連型定義をインポート
import type {
	DiagramRef,
	RectangleData,
	ConnectPointData,
} from "../../types/DiagramTypes";
import type {
	DiagramHoverEvent,
	DiagramResizeEvent,
	GroupDragEvent,
	GroupResizeEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import type { DraggableProps } from "../core/Draggable";
import Draggable from "../core/Draggable";

import DragPoint from "../core/DragPoint";

type ConnectPointProps = ConnectPointData & {
	visible: boolean;
	onDrop?: (e: DiagramDragDropEvent) => void;
};

const ConnectPoint: React.FC<ConnectPointProps> = ({
	diagramId,
	point,
	visible,
}) => {
	// TODO useCallback使う

	// console.log("ConnectPoint rendered");
	// ホバー状態の管理
	const [isHovered, setIsHovered] = useState(false);
	// ドラッグ状態の管理
	const [isDragging, setIsDragging] = useState(false);

	const svgRef = useRef<SVGPathElement>({} as SVGPathElement);
	const dragPointRef = useRef<SVGGElement>({} as SVGGElement);

	const id = `connectPoint-${diagramId}`;

	const handleDragStart = useCallback((_e: DiagramDragEvent) => {
		setIsDragging(true);
	}, []);

	const handleDrag = useCallback(
		(e: DiagramDragEvent) => {
			svgRef.current.setAttribute(
				"d",
				`M ${point.x} ${point.y} L ${e.endPoint.x} ${e.endPoint.y}`,
			);
		},
		[point],
	);

	const handleDragEnd = useCallback(
		(_e: DiagramDragEvent) => {
			setIsDragging(false);
			svgRef.current.removeAttribute("d");
			dragPointRef.current.setAttribute(
				"transform",
				`translate(${point.x}, ${point.y})`,
			);
		},
		[point],
	);

	const handleDragOver = useCallback((e: DiagramDragDropEvent) => {
		if (e.dropItem.type === "connectPoint") {
			setIsHovered(true);
		}
	}, []);

	const handleDragLeave = useCallback((_e: DiagramDragDropEvent) => {
		setIsHovered(false);
	}, []);

	const handleDrop = useCallback((e: DiagramDragDropEvent) => {
		if (e.dropItem.type === "connectPoint") {
			alert("connect");
		}
		setIsHovered(false);
	}, []);

	/**
	 * ホバー状態変更イベントハンドラ
	 *
	 * @param {DiagramHoverEvent} e ホバー状態変更イベント
	 * @returns {void}
	 */
	const handleHoverChange = useCallback((e: DiagramHoverEvent) => {
		setIsHovered(e.isHovered);
	}, []);

	return (
		<>
			<DragPoint
				id={id}
				point={point}
				type="connectPoint"
				color="rgba(120, 120, 1, 0.8)"
				visible={visible || isHovered}
				onDragStart={handleDragStart}
				onDrag={handleDrag}
				onDragEnd={handleDragEnd}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onHoverChange={handleHoverChange}
				ref={dragPointRef}
			/>
			{isDragging && <path stroke="black" strokeWidth={1} ref={svgRef} />}
		</>
	);
};

export default memo(ConnectPoint);
