// Reactのインポート
import React, { createContext, memo, useCallback, useRef } from "react";

// ライブラリのインポート
import styled from "@emotion/styled";

// SvgCanvas関連型定義をインポート
import type { Diagram } from "./types/DiagramTypes";
import { DiagramTypeComponentMap } from "./types/DiagramTypes";
import type {
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramSelectEvent,
	DiagramTransformEvent,
	GroupDataChangeEvent,
} from "./types/EventTypes";

import type { SvgCanvasState } from "./hooks";
import { isGroupData } from "./SvgCanvasFunctions";

export const SvgCanvasContext = createContext<SvgCanvasStateProvider | null>(
	null,
);

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

		const stateProvider = useRef(new SvgCanvasStateProvider({ items }));
		stateProvider.current.setState({ items });

		return (
			<ContainerDiv>
				<SvgCanvasContext.Provider value={stateProvider.current}>
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
				</SvgCanvasContext.Provider>
			</ContainerDiv>
		);
	},
);

export default SvgCanvas;

class SvgCanvasStateProvider {
	s: SvgCanvasState;
	constructor(state: SvgCanvasState) {
		this.s = state;
	}
	setState(state: SvgCanvasState) {
		this.s = state;
	}
	state(): SvgCanvasState {
		return this.s;
	}
	items(): Diagram[] {
		return this.s.items;
	}
	getDiagramById(id: string): Diagram | undefined {
		return getDiagramById(this.s.items, id);
	}
}

const getDiagramById = (
	diagrams: Diagram[],
	id: string,
): Diagram | undefined => {
	for (const diagram of diagrams) {
		if (diagram.id === id) {
			return diagram;
		}
		if (isGroupData(diagram)) {
			const ret = getDiagramById(diagram.items || [], id);
			if (ret) {
				return ret;
			}
		}
	}
};
