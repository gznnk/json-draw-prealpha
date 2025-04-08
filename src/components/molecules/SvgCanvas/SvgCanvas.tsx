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
import type { SvgCanvasHistory, SvgCanvasState } from "./hooks/canvasHooks";
import type { Diagram, DiagramType, GroupData } from "./types/DiagramTypes";
import { DiagramTypeComponentMap } from "./types/DiagramTypes";
import {
	type NewDiagramEvent,
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
	type SvgCanvasResizeEvent,
	type SvgCanvasScrollEvent,
} from "./types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import { TextEditor, type TextEditorProps } from "./components/core/Textable";
import Group from "./components/diagram/Group";
import ContextMenu, {
	type ContextMenuStateMap,
	type ContextMenuType,
} from "./components/operation/ContextMenu";

// SvgCanvas関連関数をインポート
import { getDiagramById, getSelectedItems } from "./functions/SvgCanvas";
import { newEventId } from "./functions/Util";
import UserMenu from "./components/operation/UserMenu";
import CanvasMenu from "./components/operation/CanvasMenu";

// SvgCanvasの状態を階層を跨いで提供するためにSvgCanvasStateProviderを保持するコンテキストを作成
export const SvgCanvasContext = createContext<SvgCanvasStateProvider | null>(
	null,
);

// 増やす領域の幅
const EXPAND_SIZE = 300;

/**
 * Style for the container of the SVG canvas.
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
 * Style for the SVG element.
 */
const Svg = styled.svg`
	display: block;
	box-sizing: border-box;
	outline: none;
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
 * Properties for the container of HTML elements.
 */
type HTMLElementsContainerProps = {
	left: number;
	top: number;
	width: number;
	height: number;
};

/**
 * Style for the container of HTML elements.
 */
const HTMLElementsContainer = styled.div<HTMLElementsContainerProps>`
	position: absolute;
	left: ${(props) => props.left}px;
	top: ${(props) => props.top}px;
	width: ${(props) => props.width}px;
	height: ${(props) => props.height}px;
	pointer-events: none;
`;

/**
 * Styles for the viewport overlay.
 */
const ViewportOverlay = styled.div`
	position: fixed;
    top: 0;
    left: 0;
	right: 0;
	bottom: 0;
	overflow: hidden;
    pointer-events: none;
`;

/**
 * SvgCanvasのプロパティの型定義
 */
type SvgCanvasProps = {
	title?: string;
	minX: number;
	minY: number;
	width: number;
	height: number;
	items: Diagram[];
	multiSelectGroup?: GroupData;
	history: SvgCanvasHistory[];
	historyIndex: number;
	onTransform?: (e: DiagramTransformEvent) => void;
	onDiagramChange?: (e: DiagramChangeEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragEnd?: (e: DiagramDragEvent) => void;
	onDrop?: (e: DiagramDragDropEvent) => void;
	onSelect?: (e: DiagramSelectEvent) => void;
	onSelectAll?: () => void;
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
	onCanvasResize?: (e: SvgCanvasResizeEvent) => void;
	onNewDiagram?: (e: NewDiagramEvent) => void;
};

/**
 * SvgCanvasコンポーネント
 */
const SvgCanvas: React.FC<SvgCanvasProps> = ({
	title,
	minX,
	minY,
	width,
	height,
	items,
	multiSelectGroup,
	history,
	historyIndex,
	onTransform,
	onDiagramChange,
	onDrag,
	onDrop,
	onSelect,
	onSelectAll,
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
	onCanvasResize,
	onNewDiagram,
}) => {
	// In the SvgCanvas render function,
	// we handle DOM events related to the SvgCanvas elements,
	// process tasks that require element references,
	// directly manipulate the DOM when needed,
	// and pass the events to the hooks.

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

	/**
	 * Handle the drag event to resize the canvas.
	 */
	const handleDrag = useCallback(
		(e: DiagramDragEvent) => {
			if (e.endX <= minX) {
				if (containerRef.current && svgRef.current) {
					// SVGの幅を増やす
					const newMinX = minX - EXPAND_SIZE;
					const newWidth = width - newMinX + EXPAND_SIZE;

					// Notify the new minX and width to the canvasHooks.
					onCanvasResize?.({
						minX: newMinX,
						minY,
						width: newWidth,
						height,
					} as SvgCanvasResizeEvent);

					// スクロール位置の設定がDOMの直接更新である一方、state変更によるSVG要素の更新は次のReactの描画処理時であることにより、
					// 描画タイミングのずれが発生してしまうので、一度SVGのviewBoxを直接更新し、ずれが発生しないようにする
					svgRef.current.setAttribute("width", `${newWidth}`);
					svgRef.current.setAttribute(
						"viewBox",
						`${newMinX} ${minY} ${newWidth} ${height}`,
					);

					// Scroll position adjustment.
					containerRef.current.scrollLeft = EXPAND_SIZE;
				}
			} else if (e.endY <= minY) {
				if (containerRef.current && svgRef.current) {
					// SVGの高さを増やす
					const newMinY = minY - EXPAND_SIZE;
					const newHeight = height - newMinY;

					// Notify the new minY and height to the hooks.
					onCanvasResize?.({
						minX,
						minY: newMinY,
						width,
						height: newHeight,
					} as SvgCanvasResizeEvent);

					// スクロール位置の設定がDOMの直接更新である一方、state変更によるSVG要素の更新は次のReactの描画処理時であることにより、
					// 描画タイミングのずれが発生してしまうので、一度SVGのviewBoxを直接更新し、ずれが発生しないようにする
					svgRef.current.setAttribute("height", `${newHeight}`);
					svgRef.current.setAttribute(
						"viewBox",
						`${minX} ${newMinY} ${width} ${newHeight}`,
					);

					// Scroll position adjustment.
					containerRef.current.scrollTop = EXPAND_SIZE;
				}
			} else if (e.endX >= minX + width) {
				// Notify the new width to the hooks.
				onCanvasResize?.({
					minX,
					minY,
					width: width - minX + EXPAND_SIZE,
					height,
				} as SvgCanvasResizeEvent);
			} else if (e.endY >= minY + height) {
				// Notify the new height to the hooks.
				onCanvasResize?.({
					minX,
					minY,
					width,
					height: height - minY + EXPAND_SIZE,
				} as SvgCanvasResizeEvent);
			} else {
				// When the pointer is moved within the canvas, notify the drag event to the hooks.
				onDrag?.(e);
			}
		},
		[onCanvasResize, height, minY, width, minX, onDrag],
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
			// Dispatch a custom event with scroll position.
			document.dispatchEvent(
				new CustomEvent(SVG_CANVAS_SCROLL_EVENT_NAME, {
					bubbles: true,
					detail: {
						scrollTop: e.currentTarget.scrollTop,
						scrollLeft: e.currentTarget.scrollLeft,
					} as SvgCanvasScrollEvent,
				}),
			);
		},
		[],
	);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		onDelete,
		onSelectAll,
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
			const { onDelete, onSelectAll, onAllSelectionClear, onUndo, onRedo } =
				refBus.current;

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
					// Undo the last action when Ctrl+Z is pressed.
					onUndo?.();
				}
				if (e.key === "y") {
					// Redo the last action when Ctrl+Y is pressed.
					onRedo?.();
				}
				if (e.key === "a") {
					// Select all items when Ctrl+A is pressed.
					e.preventDefault();
					onSelectAll?.();
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

	// Create a map of context menu states.
	const selectedItems = getSelectedItems(items);
	const isItemSelected = selectedItems.length > 0;
	const isGroupSelected = selectedItems.some((item) => item.type === "Group");
	const contextMenuStateMap = {
		Undo: historyIndex > 0 ? "Enable" : "Disable",
		Redo: historyIndex < history.length - 1 ? "Enable" : "Disable",
		SelectAll: items.length > 0 ? "Enable" : "Disable",
		Group: multiSelectGroup ? "Enable" : "Disable",
		Ungroup: isGroupSelected ? "Enable" : "Disable",
		Delete: isItemSelected ? "Enable" : "Disable",
	} as ContextMenuStateMap;

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
				case "Undo":
					onUndo?.();
					break;
				case "Redo":
					onRedo?.();
					break;
				case "SelectAll":
					onSelectAll?.();
					break;
				case "Group":
					onGroup?.();
					break;
				case "Ungroup":
					onUngroup?.();
					break;
				case "Delete":
					onDelete?.();
					break;
				default:
			}
			setContextMenu({ x: 0, y: 0, isVisible: false });
		},
		[onUndo, onRedo, onSelectAll, onGroup, onUngroup, onDelete],
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
				{/* The container of HTML elements that overlays the SVG canvas.*/}
				<HTMLElementsContainer
					left={-minX}
					top={-minY}
					width={width + minX}
					height={height + minY}
				>
					<TextEditor {...textEditorState} onTextChange={handleTextChange} />
				</HTMLElementsContainer>
				<ViewportOverlay>
					<CanvasMenu onNewDiagram={onNewDiagram} />
					<UserMenu />
					<ContextMenu
						{...contextMenu}
						menuStateMap={contextMenuStateMap}
						onMenuClick={handleContextMenuClick}
					/>
				</ViewportOverlay>
			</ContainerDiv>
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
