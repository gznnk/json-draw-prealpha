// Import React.
import React, {
	createContext,
	memo,
	useCallback,
	useEffect,
	useRef,
} from "react";

// SvgCanvas関連型定義をインポート
import { type Diagram, DiagramComponentCatalog } from "../types/DiagramCatalog";
import {
	type DiagramChangeEvent,
	type DiagramDragEvent,
	type DiagramSelectEvent,
	SVG_CANVAS_SCROLL_EVENT_NAME,
	type SvgCanvasResizeEvent,
	type SvgCanvasScrollEvent,
} from "../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import { FlashConnectLine } from "../components/core/FlashConnectLine";
import { TextEditor } from "../components/core/Textable";
import { CanvasMenu } from "../components/menus/CanvasMenu";
import { ContextMenu, useContextMenu } from "../components/menus/ContextMenu";
import { DiagramMenu, useDiagramMenu } from "../components/menus/DiagramMenu";
import { Group } from "../components/shapes/Group";

// SvgCanvas関連関数をインポート
import { newEventId } from "../utils/Util";

import UserMenu from "../components/menus/UserMenu/UserMenu";
import { getDiagramById } from "./SvgCanvasFunctions";

// Imports related to this component.
import type { Point } from "../types/CoordinateTypes";
import {
	CANVAS_EXPANSION_SIZE,
	MULTI_SELECT_GROUP,
} from "./SvgCanvasConstants";
import {
	Container,
	HTMLElementsContainer,
	MultiSelectGroupContainer,
	Svg,
	ViewportOverlay,
} from "./SvgCanvasStyled";
import type { SvgCanvasProps, SvgCanvasState } from "./SvgCanvasTypes";

// SvgCanvasの状態を階層を跨いで提供するためにSvgCanvasStateProviderを保持するコンテキストを作成
export const SvgCanvasContext = createContext<SvgCanvasStateProvider | null>(
	null,
);

/**
 * SvgCanvasコンポーネント
 */
const SvgCanvasComponent: React.FC<SvgCanvasProps> = (props) => {
	// In the SvgCanvas render function,
	// we handle DOM events related to the SvgCanvas elements,
	// process tasks that require element references,
	// directly manipulate the DOM when needed,
	// and pass the events to the hooks.

	const {
		title,
		minX,
		minY,
		width,
		height,
		items,
		multiSelectGroup,
		textEditorState,
		onTransform,
		onDiagramChange,
		onDrag,
		onDrop,
		onSelect,
		onSelectAll,
		onClearAllSelection,
		onDelete,
		onConnect,
		onUndo,
		onRedo,
		onCanvasResize,
		onTextEdit,
		onTextChange,
		onNewDiagram,
		onNewItem,
		onExecute,
	} = props;

	// SVG要素のコンテナの参照
	const containerRef = useRef<HTMLDivElement>(null);
	// SVG要素の参照
	const svgRef = useRef<SVGSVGElement>(null);

	// Ctrlキーが押されているかどうかのフラグ
	const isCtrlDown = useRef(false);

	// SvgCanvasStateProviderのインスタンスを生成
	// 現時点ではシングルトン的に扱うため、useRefで保持し、以降再作成しない
	// TODO: レンダリングの負荷が高くなければ、都度インスタンスを更新して再レンダリングさせたい
	const stateProvider = useRef(
		new SvgCanvasStateProvider({ items } as SvgCanvasState),
	);
	stateProvider.current.setState({ items } as SvgCanvasState);

	// Use the context menu hook to handle context menu events.
	const { contextMenuProps, contextMenuHandlers, contextMenuFunctions } =
		useContextMenu(props);

	// Use the diagram menu hook to handle diagram menu events.
	const { diagramMenuProps } = useDiagramMenu(props);

	// Create references bypass to avoid function creation in every render.
	const refBusValForCanvasResize = {
		onCanvasResize,
		minX,
		minY,
		width,
		height,
	};
	const refBusForCanvasResize = useRef(refBusValForCanvasResize);
	refBusForCanvasResize.current = refBusValForCanvasResize;

	/**
	 * Resize the canvas when the pointer is moved to the edges of the canvas.
	 */
	const canvasResize = useCallback((p: Point) => {
		// Bypass references to avoid function creation in every render.
		const { onCanvasResize, minX, minY, width, height } =
			refBusForCanvasResize.current;

		if (p.x <= minX) {
			if (containerRef.current && svgRef.current) {
				// SVGの幅を増やす
				const newMinX = minX - CANVAS_EXPANSION_SIZE;
				const newWidth = width - newMinX + CANVAS_EXPANSION_SIZE;

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
				containerRef.current.scrollLeft = CANVAS_EXPANSION_SIZE;
			}
		} else if (p.y <= minY) {
			if (containerRef.current && svgRef.current) {
				// SVGの高さを増やす
				const newMinY = minY - CANVAS_EXPANSION_SIZE;
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
				containerRef.current.scrollTop = CANVAS_EXPANSION_SIZE;
			}
		} else if (p.x >= minX + width) {
			// Notify the new width to the hooks.
			onCanvasResize?.({
				minX,
				minY,
				width: width - minX + CANVAS_EXPANSION_SIZE,
				height,
			} as SvgCanvasResizeEvent);
		} else if (p.y >= minY + height) {
			// Notify the new height to the hooks.
			onCanvasResize?.({
				minX,
				minY,
				width,
				height: height - minY + CANVAS_EXPANSION_SIZE,
			} as SvgCanvasResizeEvent);
		}
	}, []);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		// Component properties
		textEditorState,
		onDrag,
		onDiagramChange,
		onDelete,
		onSelect,
		onSelectAll,
		onClearAllSelection,
		onUndo,
		onRedo,
		// Internal variables and functions
		contextMenuFunctions,
		canvasResize,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Handle the pointer down event on the SVG canvas.
	 */
	const handlePointerDown = useCallback(
		(e: React.PointerEvent<SVGSVGElement>) => {
			// Bypass references to avoid function creation in every render.
			const { onClearAllSelection, contextMenuFunctions } = refBus.current;

			if (e.target === e.currentTarget) {
				// Clear the selection when pointer is down on the canvas.
				onClearAllSelection?.();
			}

			// Close the context menu.
			contextMenuFunctions.closeContextMenu();
		},
		[],
	);

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
	const handleDrag = useCallback((e: DiagramDragEvent) => {
		// Bypass references to avoid function creation in every render.
		const { canvasResize, onDrag } = refBus.current;

		canvasResize({
			x: e.endX,
			y: e.endY,
		});

		onDrag?.(e);
	}, []);

	/**
	 * Handle the diagram change event to resize the canvas.
	 */
	const handleDiagramChange = useCallback((e: DiagramChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const { canvasResize, onDiagramChange } = refBus.current;

		if (e.changeType === "Drag" && e.endDiagram.x && e.endDiagram.y) {
			canvasResize({
				x: e.endDiagram.x,
				y: e.endDiagram.y,
			});
		}

		onDiagramChange?.(e);
	}, []);

	/**
	 * 図形選択イベントハンドラ
	 */
	const handleSelect = useCallback((e: DiagramSelectEvent) => {
		// Bypass references to avoid function creation in every render.
		const { onSelect } = refBus.current;

		// Ctrlキーの押下状態を付与して、処理をHooksに委譲
		onSelect?.({
			eventId: newEventId(),
			id: e.id,
			isMultiSelect: isCtrlDown.current,
		});
	}, []);

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

	// Monitor keyboard events.
	useEffect(() => {
		const onDocumentKeyDown = (e: KeyboardEvent) => {
			// Bypass references to avoid function creation in every render.
			const {
				textEditorState,
				onDelete,
				onSelectAll,
				onClearAllSelection,
				onUndo,
				onRedo,
			} = refBus.current;

			if (e.key === "Control") {
				isCtrlDown.current = true;
			}
			if (e.key === "Escape") {
				// Clear selection when Escape key is pressed.
				onClearAllSelection?.();
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
				if (e.key === "a" && !textEditorState.isActive) {
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

	useEffect(() => {
		const el = containerRef.current;

		const handleTouchMove = (e: TouchEvent) => {
			if (e.target !== e.currentTarget && e.target !== svgRef.current) {
				e.preventDefault();
			}
		};

		el?.addEventListener("touchmove", handleTouchMove, { passive: false });

		return () => {
			el?.removeEventListener("touchmove", handleTouchMove);
		};
	}, []);

	// 図形の描画
	const renderedItems = items.map((item) => {
		const component = DiagramComponentCatalog[item.type];
		const props = {
			...item,
			key: item.id,
			onTransform,
			onDiagramChange: handleDiagramChange,
			onDrag: handleDrag,
			onDrop,
			onSelect: handleSelect,
			onConnect,
			onTextEdit,
			onNewItem,
			onExecute,
		};

		return React.createElement(component, props);
	});

	return (
		<>
			<Container ref={containerRef} onScroll={handleScroll}>
				<SvgCanvasContext.Provider value={stateProvider.current}>
					<Svg
						width={width}
						height={height}
						viewBox={`${minX} ${minY} ${width} ${height}`}
						tabIndex={0}
						ref={svgRef}
						onPointerDown={handlePointerDown}
						onKeyDown={handleKeyDown}
						onContextMenu={contextMenuHandlers.onContextMenu}
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
									id={MULTI_SELECT_GROUP}
									syncWithSameId
									onSelect={handleSelect}
									onTransform={onTransform}
									onDiagramChange={onDiagramChange}
								/>
							</MultiSelectGroupContainer>
						)}
						{/* Render flash connect lines */}
						<FlashConnectLine />
					</Svg>
				</SvgCanvasContext.Provider>
				{/* Container for HTML elements that follow the scroll of the SVG canvas. */}
				<HTMLElementsContainer
					left={-minX}
					top={-minY}
					width={width + minX}
					height={height + minY}
				>
					<TextEditor {...textEditorState} onTextChange={onTextChange} />
					<DiagramMenu {...diagramMenuProps} />
				</HTMLElementsContainer>
				{/* Container for HTML elements fixed to the viewport. */}
				<ViewportOverlay>
					<CanvasMenu onNewDiagram={onNewDiagram} />
					<UserMenu />
					<ContextMenu {...contextMenuProps} />
				</ViewportOverlay>
			</Container>
		</>
	);
};

export const SvgCanvas = memo(SvgCanvasComponent);

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
