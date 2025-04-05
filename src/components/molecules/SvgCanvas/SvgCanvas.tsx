// Reactのインポート
import React, {
	createContext,
	memo,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

// ライブラリのインポート
import styled from "@emotion/styled";

// SvgCanvas関連型定義をインポート
import type { SvgCanvasState } from "./hooks/canvasHooks";
import type { Diagram, GroupData } from "./types/DiagramTypes";
import { DiagramTypeComponentMap } from "./types/DiagramTypes";
import {
	SVG_CANVAS_SCROLL_EVENT_NAME,
	type ConnectPointsMoveEvent,
	type DiagramChangeEvent,
	type DiagramConnectEvent,
	type DiagramDragDropEvent,
	type DiagramDragEvent,
	type DiagramSelectEvent,
	type DiagramTextChangeEvent,
	type DiagramTextEditEvent,
	type DiagramTransformEvent,
	type SvgCanvasScrollEvent,
} from "./types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import { TextEditor, type TextEditorProps } from "./components/core/Textable";
import Group from "./components/diagram/Group";
import ContextMenu, {
	type ContextMenuType,
} from "./components/operation/ContextMenu";

// SvgCanvas関連関数をインポート
import { getDiagramById } from "./functions/SvgCanvas";
import { newEventId } from "./functions/Util";

// SvgCanvasの状態を階層を跨いで提供するためにSvgCanvasStateProviderを保持するコンテキストを作成
export const SvgCanvasContext = createContext<SvgCanvasStateProvider | null>(
	null,
);

// 増やす領域の幅
const EXPAND_SIZE = 300;

/**
 * SVG要素のコンテナのスタイル定義
 */
const ContainerDiv = styled.div`
	position: absolute;
    top: 0;
    left: 0;
	right: 0;
	bottom: 0;
	overflow: auto;
`;

/**
 * SVG要素のスタイル定義
 */
const Svg = styled.svg`
	* {
		outline: none;
	}
`;

/**
 * Style for the container of the multi-select group.
 */
const MultiSelectGroupContainer = styled.g`
	.diagram {
		opacity: 0;
	}
`;

/**
 * SvgCanvasのプロパティの型定義
 */
type SvgCanvasProps = {
	title?: string;
	items: Diagram[];
	multiSelectGroup?: GroupData;
	onTransform?: (e: DiagramTransformEvent) => void;
	onDiagramChange?: (e: DiagramChangeEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragEnd?: (e: DiagramDragEvent) => void;
	onDrop?: (e: DiagramDragDropEvent) => void;
	onSelect?: (e: DiagramSelectEvent) => void;
	onAllSelectionClear?: () => void;
	onDelete?: () => void;
	onConnect?: (e: DiagramConnectEvent) => void;
	onConnectPointsMove?: (e: ConnectPointsMoveEvent) => void;
	onTextEdit?: (e: DiagramTextEditEvent) => void;
	onTextChange?: (e: DiagramTextChangeEvent) => void;
	onGroup?: () => void;
	onUngroup?: () => void;
	onUndo?: () => void;
	onRedo?: () => void;
};

/**
 * SvgCanvasコンポーネント
 */
const SvgCanvas: React.FC<SvgCanvasProps> = ({
	title,
	items,
	multiSelectGroup,
	onTransform,
	onDiagramChange,
	onDrag,
	onDrop,
	onSelect,
	onAllSelectionClear,
	onDelete,
	onConnect,
	onConnectPointsMove,
	onTextEdit,
	onTextChange,
	onGroup,
	onUngroup,
	onUndo,
	onRedo,
}) => {
	const [minX, setMinX] = useState(0);
	const [minY, setMinY] = useState(0);
	const [width, setWidth] = useState(window.innerWidth);
	const [height, setHeight] = useState(window.innerHeight);
	const isProgrammaticScroll = useRef(false); // プログラムによるスクロールかどうかのフラグ
	const scrollTopIncrement = useRef(0); // スクロールの増分
	const scrollLeftIncrement = useRef(0); // スクロールの増分

	// SVG要素のコンテナの参照
	const containerRef = useRef<HTMLDivElement>(null);
	// SVG要素の参照
	const svgRef = useRef<SVGSVGElement>(null);

	// Ctrlキーが押されているかどうかのフラグ
	const isCtrlDown = useRef(false);

	// スクロール中かどうかのフラグ
	const isScrolling = useRef(false);
	// スクロール開始時の位置情報
	const scrollStart = useRef({
		clientX: 0,
		clientY: 0,
		scrollLeft: 0,
		scrollTop: 0,
	});

	// SvgCanvasStateProviderのインスタンスを生成
	// 現時点ではシングルトン的に扱うため、useRefで保持し、以降再作成しない
	// TODO: レンダリングの負荷が高くなければ、都度インスタンスを更新して再レンダリングさせたい
	const stateProvider = useRef(
		new SvgCanvasStateProvider({ items } as SvgCanvasState),
	);
	stateProvider.current.setState({ items } as SvgCanvasState);

	/**
	 * SvgCanvasのポインターダウンイベントハンドラ
	 */
	const handlePointerDown = useCallback(
		(e: React.PointerEvent<SVGSVGElement>) => {
			if (e.target === e.currentTarget) {
				// 選択状態の解除
				onAllSelectionClear?.();

				// SvgCanvasのスクロール開始
				isScrolling.current = true;
				scrollStart.current = {
					clientX: e.clientX,
					clientY: e.clientY,
					scrollLeft: containerRef.current?.scrollLeft ?? 0,
					scrollTop: containerRef.current?.scrollTop ?? 0,
				};
			}

			setContextMenu({ x: 0, y: 0, isVisible: false });
		},
		[onAllSelectionClear],
	);

	/**
	 * SvgCanvasのポインタームーブイベントハンドラ
	 */
	const handlePointerMove = useCallback(
		(e: React.PointerEvent<SVGSVGElement>) => {
			// SvgCanvasのスクロール処理
			if (isScrolling.current) {
				const dx = scrollStart.current.clientX - e.clientX;
				const dy = scrollStart.current.clientY - e.clientY;
				if (containerRef.current) {
					containerRef.current.scrollLeft = scrollStart.current.scrollLeft + dx;
					containerRef.current.scrollTop = scrollStart.current.scrollTop + dy;
				}
			}
		},
		[],
	);

	/**
	 * SvgCanvasのポインターアップイベントハンドラ
	 */
	const handlePointerUp = useCallback(() => {
		// SvgCanvasのスクロール終了
		isScrolling.current = false;
	}, []);

	/**
	 * SvgCanvasのキーダウンイベントハンドラ
	 */
	const handleKeyDown = useCallback((e: React.KeyboardEvent<SVGSVGElement>) => {
		// キャンバスにフォーカスがない場合はイベントをキャンセルし、スクロールを無効化
		if (e.target !== e.currentTarget) {
			e.preventDefault();
		}
	}, []);

	const handleDrag = useCallback(
		(e: DiagramDragEvent) => {
			// ドラッグイベントをHooksに通知

			// console.log(e.endX, e.endY);

			if (e.endX < minX) {
				setMinX(minX - EXPAND_SIZE);
				setWidth(width - minX + EXPAND_SIZE);
				if (containerRef.current && svgRef.current) {
					svgRef.current.setAttribute("width", `${width - minX + EXPAND_SIZE}`);
					svgRef.current.setAttribute(
						"viewBox",
						`${minX - EXPAND_SIZE} ${minY} ${width - minX + EXPAND_SIZE} ${height}`,
					);
					isProgrammaticScroll.current = true;
					scrollLeftIncrement.current = EXPAND_SIZE;
					containerRef.current.scrollLeft = EXPAND_SIZE;
				}
			} else if (e.endY < minY) {
				setMinY(minY - EXPAND_SIZE);
				setHeight(height - minY + EXPAND_SIZE);
				if (containerRef.current && svgRef.current) {
					svgRef.current.setAttribute(
						"height",
						`${height - minY + EXPAND_SIZE}`,
					);
					svgRef.current.setAttribute(
						"viewBox",
						`${minX} ${minY - EXPAND_SIZE} ${width} ${height - minY + EXPAND_SIZE}`,
					);
					isProgrammaticScroll.current = true;
					scrollTopIncrement.current = EXPAND_SIZE;
					containerRef.current.scrollTop = EXPAND_SIZE;
				}
			} else if (e.endX > minX + width) {
				setWidth(minX + width + EXPAND_SIZE);
			} else if (e.endY > minY + height) {
				setHeight(minY + height + EXPAND_SIZE);
			} else {
				onDrag?.(e);
			}
		},
		[onDrag, minX, minY, width, height],
	);

	/**
	 * 図形選択イベントハンドラ
	 */
	const handleSelect = useCallback(
		(e: DiagramSelectEvent) => {
			// Ctrlキーの押下状態を付与して、処理をHooksに委譲
			onSelect?.({
				eventId: newEventId(),
				id: e.id,
				isMultiSelect: isCtrlDown.current,
			});
		},
		[onSelect],
	);

	/**
	 * テキスト編集コンポーネントの状態
	 */
	const [textEditorState, setTextEditorState] = useState<TextEditorProps>({
		isActive: false,
	} as TextEditorProps);

	/**
	 * 図形のテキスト編集イベントハンドラ
	 */
	const handleTextEdit = useCallback(
		(e: DiagramTextEditEvent) => {
			// テキストエディタを表示
			const diagram = getDiagramById(items, e.id);
			setTextEditorState({
				isActive: true,
				...diagram,
			} as TextEditorProps);

			// テキスト編集イベントをHooksに通知
			onTextEdit?.(e);
		},
		[items, onTextEdit],
	);

	/**
	 * テキスト変更イベントハンドラ
	 */
	const handleTextChange = useCallback(
		(e: DiagramTextChangeEvent) => {
			// テキストエディタを非表示
			setTextEditorState(
				(prev) =>
					({
						...prev,
						isActive: false,
					}) as TextEditorProps,
			);

			// テキスト変更イベントをHooksに通知
			onTextChange?.(e);
		},
		[onTextChange],
	);

	/**
	 * Handle scroll event to dispatch a custom event with scroll position.
	 */
	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement, UIEvent>) => {
			// if (isProgrammaticScroll.current) {
			// 	isProgrammaticScroll.current = false;
			// 	return;
			// }
			// Dispatch a custom event with scroll position.
			document.dispatchEvent(
				new CustomEvent(SVG_CANVAS_SCROLL_EVENT_NAME, {
					bubbles: true,
					detail: {
						scrollTop: e.currentTarget.scrollTop,
						scrollLeft: e.currentTarget.scrollLeft,
						isProgrammaticScroll: isProgrammaticScroll.current,
						scrollTopIncrement: scrollTopIncrement.current,
						scrollLeftIncrement: scrollLeftIncrement.current,
					} as SvgCanvasScrollEvent,
				}),
			);
			scrollTopIncrement.current = 0;
			scrollLeftIncrement.current = 0;
			isProgrammaticScroll.current = false;
		},
		[],
	);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		onDelete,
		onAllSelectionClear,
		onUndo,
		onRedo,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Monitor keyboard events.
	useEffect(() => {
		const onDocumentKeyDown = (e: KeyboardEvent) => {
			// Bypass references to avoid function creation in every render.
			const { onDelete, onAllSelectionClear, onUndo, onRedo } = refBus.current;

			if (e.key === "Control") {
				isCtrlDown.current = true;
			}
			if (e.key === "Escape") {
				// Clear selection when Escape key is pressed.
				onAllSelectionClear?.();
			}
			if (e.key === "Delete") {
				// Delete selected items when Delete key is pressed.
				onDelete?.();
			}
			if (e.ctrlKey) {
				if (e.key === "z") {
					onUndo?.();
				}
				if (e.key === "y") {
					onRedo?.();
				}
			}
		};

		const onDocumentKeyUp = (e: KeyboardEvent) => {
			if (e.key === "Control") {
				isCtrlDown.current = false;
			}
		};

		// Add event listeners for keydown and keyup events.
		document.addEventListener("keydown", onDocumentKeyDown);
		document.addEventListener("keyup", onDocumentKeyUp);

		return () => {
			document.removeEventListener("keydown", onDocumentKeyDown);
			document.removeEventListener("keyup", onDocumentKeyUp);
		};
	}, []);

	// 図形の描画
	const renderedItems = items.map((item) => {
		const itemType = DiagramTypeComponentMap[item.type];
		const props = {
			...item,
			key: item.id,
			onTransform,
			onDiagramChange,
			onDrag: handleDrag,
			onDrop,
			onSelect: handleSelect,
			onConnect,
			onConnectPointsMove,
			onTextEdit: handleTextEdit,
		};

		return React.createElement(itemType, props);
	});

	// コンテキストメニューの状態
	const [contextMenu, setContextMenu] = useState({
		x: 0,
		y: 0,
		isVisible: false,
	});

	/**
	 * コンテキストメニュー表示時イベントハンドラ
	 */
	const handleContextMenu = useCallback(
		(e: React.MouseEvent<SVGSVGElement>) => {
			e.preventDefault();
			const x = e.clientX;
			const y = e.clientY;
			setContextMenu({ x, y, isVisible: true });
		},
		[],
	);

	/**
	 * コンテキストメニュークリックイベントハンドラ
	 */
	const handleContextMenuClick = useCallback(
		(menuType: ContextMenuType) => {
			switch (menuType) {
				case "Group":
					onGroup?.();
					break;
				case "Ungroup":
					onUngroup?.();
					break;
			}
			setContextMenu({ x: 0, y: 0, isVisible: false });
		},
		[onGroup, onUngroup],
	);

	return (
		<>
			<ContainerDiv ref={containerRef} onScroll={handleScroll}>
				<SvgCanvasContext.Provider value={stateProvider.current}>
					<Svg
						width={width}
						height={height}
						viewBox={`${minX} ${minY} ${width} ${height}`}
						tabIndex={0}
						ref={svgRef}
						onPointerDown={handlePointerDown}
						onPointerMove={handlePointerMove}
						onPointerUp={handlePointerUp}
						onKeyDown={handleKeyDown}
						onContextMenu={handleContextMenu}
					>
						<title>{title}</title>
						{/* Render the items in the SvgCanvas. */}
						{renderedItems}
						{/* Dummy group for multi-select. */}
						{multiSelectGroup && (
							// The MultiSelectGroupContainer makes the diagrams transparent and displays only the outline for transformations.
							// This allows for the dragging and transformation of the multi-selected diagrams while maintaining their stacking order of rendering.
							<MultiSelectGroupContainer>
								<Group
									{...multiSelectGroup}
									id="MultiSelectGroup"
									syncWithSameId
									onSelect={handleSelect}
									onTransform={onTransform}
									onDiagramChange={onDiagramChange}
									onConnectPointsMove={onConnectPointsMove}
								/>
							</MultiSelectGroupContainer>
						)}
					</Svg>
				</SvgCanvasContext.Provider>
				<TextEditor {...textEditorState} onTextChange={handleTextChange} />
			</ContainerDiv>
			<ContextMenu {...contextMenu} onMenuClick={handleContextMenuClick} />
		</>
	);
};

export default memo(SvgCanvas);

/**
 * 階層を跨いでSvgCanvasの状態を提供するクラス.
 */
class SvgCanvasStateProvider {
	s: SvgCanvasState;
	constructor(state: SvgCanvasState) {
		this.s = state;
	}
	setState(state: SvgCanvasState) {
		// 現時点ではシングルトン的に扱っているため、状態の更新関数を提供
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
