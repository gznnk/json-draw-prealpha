// Import React.
import React, {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

// SvgCanvas関連型定義をインポート
import { DiagramComponentCatalog } from "../catalog/DiagramComponentCatalog";

// SvgCanvas関連コンポーネントをインポート
import { TextEditor } from "../components/core/Textable";
import { CanvasMenu } from "../components/menus/CanvasMenu";
import { ContextMenu, useContextMenu } from "../components/menus/ContextMenu";
import { DiagramMenu, useDiagramMenu } from "../components/menus/DiagramMenu";
import { FlashConnectLine } from "../components/shapes/ConnectLine";
import { NewConnectLine } from "../components/shapes/ConnectPoint";
import { Group } from "../components/shapes/Group";
import UserMenu from "../components/menus/UserMenu/UserMenu";
import { MiniMap } from "../components/auxiliary/MiniMap";

// Imports related to this component.
import { useShortcutKey } from "./hooks/useShortcutKey";
import { MULTI_SELECT_GROUP } from "./SvgCanvasConstants";
import {
	Container,
	HTMLElementsContainer,
	Svg,
	Viewport,
	ViewportOverlay,
} from "./SvgCanvasStyled";
import type {
	SvgCanvasProps,
	SvgCanvasRef,
	SvgCanvasState,
} from "./SvgCanvasTypes";

// Import SvgCanvas context.
import { SvgCanvasContext, SvgCanvasStateProvider } from "./SvgCanvasContext";

/**
 * SvgCanvasコンポーネント
 */
const SvgCanvasComponent = forwardRef<SvgCanvasRef, SvgCanvasProps>(
	(props, ref) => {
		// In the SvgCanvas render function,
		// we handle DOM events related to the SvgCanvas elements.
		const {
			title,
			minX,
			minY,
			items,
			zoom,
			multiSelectGroup,
			textEditorState,
			isGrabScrollReady,
			isGrabScrolling,
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
			onTextEdit,
			onTextChange,
			onDataChange,
			onNewDiagram,
			onExecute,
			onScroll,
			onZoom,
			onCopy,
			onPaste,
			onNavigate,
			onGrabStart,
			onGrabMove,
			onGrabEnd,
		} = props;

		// SVG要素のコンテナの参照
		const containerRef = useRef<HTMLDivElement>(null);
		// SVG要素の参照
		const svgRef = useRef<SVGSVGElement>(null);

		// Container dimensions state
		const [containerWidth, setContainerWidth] = useState(0);
		const [containerHeight, setContainerHeight] = useState(0);

		// Forward refs to parent using useImperativeHandle
		useImperativeHandle(ref, () => ({
			containerRef,
			svgRef,
		}));

		// SVG要素にフォーカスがあるかどうかのフラグ
		const hasFocus = useRef(false);

		// SvgCanvasStateProviderのインスタンスを生成
		// 現時点ではシングルトン的に扱うため、useRefで保持し、以降再作成しない
		const stateProvider = useRef(
			new SvgCanvasStateProvider({} as SvgCanvasState),
		);
		stateProvider.current.setState({
			minX,
			minY,
			items,
		} as SvgCanvasState);

		// Use the context menu hook to handle context menu events.
		const { contextMenuProps, contextMenuHandlers, contextMenuFunctions } =
			useContextMenu(props);

		// Use the diagram menu hook to handle diagram menu events.
		const { diagramMenuProps } = useDiagramMenu(props);

		// Use the shortcut key hook to handle keyboard shortcuts
		useShortcutKey({
			zoom,
			hasFocus,
			textEditorState,
			onDelete,
			onSelectAll,
			onClearAllSelection,
			onUndo,
			onRedo,
			onCopy,
			onPaste,
			onZoom,
		});

		// Create references bypass to avoid function creation in every render.
		const refBusVal = {
			minX,
			minY,
			zoom,
			hasFocus,
			textEditorState,
			onDrag,
			onDiagramChange,
			onClearAllSelection,
			onDataChange,
			onScroll,
			onZoom,
			onGrabStart,
			onGrabMove,
			onGrabEnd,
			contextMenuFunctions,
		};
		const refBus = useRef(refBusVal);
		refBus.current = refBusVal;

		/**
		 * SVG要素のフォーカスイベントハンドラ
		 */
		const handleFocus = useCallback(() => {
			hasFocus.current = true;
		}, []);

		/**
		 * SVG要素のブラーイベントハンドラ
		 */
		const handleBlur = useCallback(() => {
			hasFocus.current = false;
		}, []);

		/**
		 * Handle the pointer down event on the SVG canvas.
		 */
		const handlePointerDown = useCallback(
			(e: React.PointerEvent<SVGSVGElement>) => {
				// Bypass references to avoid function creation in every render.
				const { onClearAllSelection, onGrabStart, contextMenuFunctions } =
					refBus.current;

				// Check for Ctrl+drag to start grab scrolling
				if (onGrabStart?.(e)) {
					return;
				}

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
		 * Handle the pointer move event for grab scrolling.
		 */
		const handlePointerMove = useCallback(
			(e: React.PointerEvent<SVGSVGElement>) => {
				refBus.current.onGrabMove?.(e);
			},
			[],
		);

		/**
		 * Handle the pointer up event to end grab scrolling.
		 */
		const handlePointerUp = useCallback(
			(e: React.PointerEvent<SVGSVGElement>) => {
				refBus.current.onGrabEnd?.(e);
			},
			[],
		);

		/**
		 * Handle the wheel event on the SVG canvas for scrolling.
		 */
		const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
			// Bypass references to avoid function creation in every render.
			const { minX, minY, onScroll } = refBus.current;

			onScroll?.({
				minX: minX + e.deltaX,
				minY: minY + e.deltaY,
				clientX: e.clientX + e.deltaX,
				clientY: e.clientY + e.deltaY,
			});
		}, []);

		/**
		 * SvgCanvasのキーダウンイベントハンドラ
		 */
		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<SVGSVGElement>) => {
				// キャンバスにフォーカスがない場合はイベントをキャンセルし、スクロールを無効化
				if (e.target !== e.currentTarget) {
					e.preventDefault();
				}
			},
			[],
		);

		// Monitor container size changes with ResizeObserver
		useEffect(() => {
			const container = containerRef.current;
			if (!container) return;

			const resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const { width, height } = entry.contentRect;
					setContainerWidth(width);
					setContainerHeight(height);
				}
			});

			resizeObserver.observe(container);

			// Initialize with current dimensions
			const rect = container.getBoundingClientRect();
			setContainerWidth(rect.width);
			setContainerHeight(rect.height);

			return () => {
				resizeObserver.disconnect();
			};
		}, []);

		useEffect(() => {
			// Prevent browser zoom with Ctrl+wheel at document level
			const onDocumentWheel = (e: WheelEvent) => {
				if (e.ctrlKey && !isGrabScrolling) {
					e.preventDefault();
					e.stopPropagation();

					const delta = e.deltaY > 0 ? 0.9 : 1.1;
					const newZoom = refBus.current.zoom * delta;
					refBus.current.onZoom?.(newZoom);
				}
			};

			document.addEventListener("wheel", onDocumentWheel, {
				passive: false,
				capture: true,
			});

			return () => {
				document.removeEventListener("wheel", onDocumentWheel, true);
			};
		}, [isGrabScrolling]);

		// 図形の描画
		const renderedItems = items.map((item) => {
			const component = DiagramComponentCatalog[item.type];
			const props = {
				...item,
				key: item.id,
				onTransform,
				onDiagramChange,
				onDrag,
				onDrop,
				onSelect,
				onConnect,
				onTextEdit,
				onExecute,
			};

			return React.createElement(component(), props);
		});

		return (
			<Viewport>
				<Container ref={containerRef}>
					<SvgCanvasContext.Provider value={stateProvider.current}>
						<Svg
							width={containerWidth}
							height={containerHeight}
							viewBox={`${minX / zoom} ${minY / zoom} ${containerWidth / zoom} ${containerHeight / zoom}`}
							tabIndex={0}
							ref={svgRef}
							isGrabScrollReady={isGrabScrollReady}
							isGrabScrolling={isGrabScrolling}
							onPointerDown={handlePointerDown}
							onPointerMove={handlePointerMove}
							onPointerUp={handlePointerUp}
							onKeyDown={handleKeyDown}
							onFocus={handleFocus}
							onBlur={handleBlur}
							onWheel={handleWheel}
							onContextMenu={contextMenuHandlers.onContextMenu}
						>
							<title>{title}</title>
							{/* Render the items in the SvgCanvas. */}
							{renderedItems}
							{/* Dummy group for multi-select. */}
							{multiSelectGroup && (
								<Group
									{...multiSelectGroup}
									id={MULTI_SELECT_GROUP}
									syncWithSameId
									onSelect={onSelect}
									onTransform={onTransform}
									onDiagramChange={onDiagramChange}
								/>
							)}
							{/* Render new connect line. */}
							<NewConnectLine />
							{/* Render flash connect lines */}
							<FlashConnectLine />
						</Svg>
					</SvgCanvasContext.Provider>
					{/* Container for HTML elements that follow the scroll of the SVG canvas with zoom scaling. */}
					<HTMLElementsContainer
						left={-minX}
						top={-minY}
						width={containerWidth + minX}
						height={containerHeight + minY}
						zoom={zoom}
					>
						<TextEditor {...textEditorState} onTextChange={onTextChange} />
					</HTMLElementsContainer>
					{/* Container for HTML elements that follow the scroll but not zoom. */}
					<HTMLElementsContainer
						left={-minX}
						top={-minY}
						width={containerWidth + minX}
						height={containerHeight + minY}
					>
						<DiagramMenu {...diagramMenuProps} />
					</HTMLElementsContainer>
				</Container>
				{/* Container for HTML elements fixed to the viewport. */}
				<ViewportOverlay>
					<CanvasMenu onNewDiagram={onNewDiagram} />
					<UserMenu />
					<ContextMenu {...contextMenuProps} />
					<MiniMap
						items={items}
						minX={minX}
						minY={minY}
						containerWidth={containerWidth}
						containerHeight={containerHeight}
						zoom={zoom}
						onNavigate={onNavigate}
					/>
				</ViewportOverlay>
			</Viewport>
		);
	},
);

export const SvgCanvas = memo(SvgCanvasComponent);
