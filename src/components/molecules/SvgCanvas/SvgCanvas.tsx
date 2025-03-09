// Reactのインポート
import React, { memo, useCallback, useRef } from "react";

// ライブラリのインポート
import styled from "@emotion/styled";

// SvgCanvas関連型定義をインポート
import type { Diagram } from "./types/DiagramTypes";
import { DiagramTypeComponentMap } from "./types/DiagramTypes";
import type {
	ConnectPointMoveEvent,
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramResizeEvent,
	DiagramSelectEvent,
	DiagramRotateEvent,
	DiagramTransformEvent,
	GroupDataChangeEvent,
} from "./types/EventTypes";

// ユーティリティをインポート
import { getLogger } from "../../../utils/Logger";

// ロガーを取得
const logger = getLogger("SvgCanvas");

const ContainerDiv = styled.div`
	position: absolute;
    top: 0;
    left: 0;
	right: 0;
	bottom: 0;
	overflow: auto;
`;

type SvgCanvasProps = {
	title?: string;
	items: Array<Diagram>;
	onTransform?: (e: DiagramTransformEvent) => void;
	onGroupDataChange?: (e: GroupDataChangeEvent) => void;
	// --------------------------------------------------
	onDiagramDrag?: (e: DiagramDragEvent) => void;
	onDiagramDragEnd?: (e: DiagramDragEvent) => void;
	onDiagramDragEndByGroup?: (e: DiagramDragEvent) => void;
	onDiagramDrop?: (e: DiagramDragDropEvent) => void;
	onDiagramResizing?: (e: DiagramResizeEvent) => void;
	onDiagramResizeEnd?: (e: DiagramResizeEvent) => void;
	onDiagramRotateEnd?: (e: DiagramRotateEvent) => void;
	onDiagramSelect?: (e: DiagramSelectEvent) => void;
	onDiagramDelete?: () => void;
	onDiagramConnect?: (e: DiagramConnectEvent) => void;
	onConnectPointMove?: (e: ConnectPointMoveEvent) => void;
};

const SvgCanvas: React.FC<SvgCanvasProps> = memo(
	({
		title,
		items,
		onTransform,
		onGroupDataChange,
		onDiagramDrag,
		onDiagramDragEnd,
		onDiagramDragEndByGroup,
		onDiagramDrop,
		onDiagramResizing,
		onDiagramResizeEnd,
		onDiagramRotateEnd,
		onDiagramSelect,
		onDiagramDelete,
		onDiagramConnect,
		onConnectPointMove,
	}) => {
		const isCtrlDown = useRef(false);

		const handleDiagramSelect = useCallback(
			(e: DiagramSelectEvent) => {
				onDiagramSelect?.({ id: e.id, isMultiSelect: isCtrlDown.current });
			},
			[onDiagramSelect],
		);

		logger.debug("SvgCanvas items", items);

		const renderedItems = items.map((item) => {
			const itemType = DiagramTypeComponentMap[item.type];
			const props = {
				...item,
				key: item.id,
				onTransform,
				onGroupDataChange,
				onDiagramDrag,
				onDiagramDragEnd,
				onDiagramDragEndByGroup,
				onDiagramDrop,
				onDiagramResizing,
				onDiagramResizeEnd,
				onDiagramRotateEnd,
				onDiagramSelect: handleDiagramSelect,
				onDiagramConnect,
				onConnectPointMove,
			};

			return React.createElement(itemType, props);
		});

		const handlePointerDown = useCallback(
			(e: React.PointerEvent<SVGSVGElement>) => {
				if (e.target === e.currentTarget) {
					onDiagramSelect?.({ id: "dummy" });
				}
			},
			[onDiagramSelect],
		);

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<SVGSVGElement>) => {
				if (e.key === "Control") {
					isCtrlDown.current = true;
				}

				if (e.key === "Delete") {
					onDiagramDelete?.();
				}

				// キャンバスにフォーカスがない場合はイベントをキャンセルし、スクロールを無効化
				if (e.target !== e.currentTarget) {
					e.preventDefault();
				}
			},
			[onDiagramDelete],
		);

		const handleKeyUp = useCallback((e: React.KeyboardEvent<SVGSVGElement>) => {
			if (e.key === "Control") {
				isCtrlDown.current = false;
			}
		}, []);

		// console.log(items);

		return (
			<ContainerDiv>
				<svg
					width="120vw"
					height="120vh"
					onPointerDown={handlePointerDown}
					onKeyDown={handleKeyDown}
					onKeyUp={handleKeyUp}
				>
					<title>{title}</title>
					{renderedItems}
				</svg>
			</ContainerDiv>
		);
	},
);

export default SvgCanvas;
