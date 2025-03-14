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
	DiagramSelectEvent,
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

const Svg = styled.svg`
	* {
		outline: none;
	}
`;

type SvgCanvasProps = {
	title?: string;
	items: Array<Diagram>;
	onTransform?: (e: DiagramTransformEvent) => void;
	onGroupDataChange?: (e: GroupDataChangeEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragEnd?: (e: DiagramDragEvent) => void;
	onDragEndByGroup?: (e: DiagramDragEvent) => void;
	onDrop?: (e: DiagramDragDropEvent) => void;
	onSelect?: (e: DiagramSelectEvent) => void;
	onDelete?: () => void;
	onConnect?: (e: DiagramConnectEvent) => void;
	onConnectPointMove?: (e: ConnectPointMoveEvent) => void;
};

const SvgCanvas: React.FC<SvgCanvasProps> = memo(
	({
		title,
		items,
		onTransform,
		onGroupDataChange,
		onDrag,
		onDragEnd,
		onDragEndByGroup,
		onDrop,
		onSelect,
		onDelete,
		onConnect,
		onConnectPointMove,
	}) => {
		const k1 = window.profiler.start("SvgCanvas render");

		const isCtrlDown = useRef(false);

		const handleSelect = useCallback(
			(e: DiagramSelectEvent) => {
				onSelect?.({ id: e.id, isMultiSelect: isCtrlDown.current });
			},
			[onSelect],
		);

		logger.debug("SvgCanvas items", items);

		const renderedItems = items.map((item) => {
			const itemType = DiagramTypeComponentMap[item.type];
			const props = {
				...item,
				key: item.id,
				onTransform,
				onGroupDataChange,
				onDrag,
				onDragEnd,
				onDragEndByGroup,
				onDrop,
				onSelect: handleSelect,
				onConnect,
				onConnectPointMove,
			};

			return React.createElement(itemType, props);
		});

		const handlePointerDown = useCallback(
			(e: React.PointerEvent<SVGSVGElement>) => {
				if (e.target === e.currentTarget) {
					onSelect?.({ id: "dummy" });
				}
			},
			[onSelect],
		);

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<SVGSVGElement>) => {
				if (e.key === "Control") {
					isCtrlDown.current = true;
				}

				if (e.key === "Delete") {
					onDelete?.();
				}

				// キャンバスにフォーカスがない場合はイベントをキャンセルし、スクロールを無効化
				if (e.target !== e.currentTarget) {
					e.preventDefault();
				}
			},
			[onDelete],
		);

		const handleKeyUp = useCallback((e: React.KeyboardEvent<SVGSVGElement>) => {
			if (e.key === "Control") {
				isCtrlDown.current = false;
			}
		}, []);

		// console.log(items);

		window.profiler.end("SvgCanvas render", k1);

		return (
			<ContainerDiv>
				<Svg
					width="120vw"
					height="120vh"
					onPointerDown={handlePointerDown}
					onKeyDown={handleKeyDown}
					onKeyUp={handleKeyUp}
				>
					<title>{title}</title>
					{renderedItems}
				</Svg>
			</ContainerDiv>
		);
	},
);

export default SvgCanvas;
