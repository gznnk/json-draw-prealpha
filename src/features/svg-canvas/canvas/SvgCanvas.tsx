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
import type { DiagramSelectEvent } from "../types/events/DiagramSelectEvent";

// SvgCanvas関連コンポーネントをインポート
import { TextEditor } from "../components/core/Textable";
import { CanvasMenu } from "../components/menus/CanvasMenu";
import { ContextMenu, useContextMenu } from "../components/menus/ContextMenu";
import { DiagramMenu, useDiagramMenu } from "../components/menus/DiagramMenu";
import { FlashConnectLine } from "../components/shapes/ConnectLine";
import { NewConnectLine } from "../components/shapes/ConnectPoint";
import { Group } from "../components/shapes/Group";
import UserMenu from "../components/menus/UserMenu/UserMenu";

// SvgCanvas関連関数をインポート
import { newEventId } from "../utils/common/newEventId";

// Imports related to this component.
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

		// Ctrlキーが押されているかどうかのフラグ
		const isCtrlDown = useRef(false);
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

		// Create references bypass to avoid function creation in every render.
		const refBusVal = {
			zoom,
			hasFocus,
			textEditorState,
			onDrag,
			onDiagramChange,
			onDelete,
			onSelect,
			onSelectAll,
			onClearAllSelection,
			onUndo,
			onRedo,
			onDataChange,
			onScroll,
			onZoom,
			onCopy,
			onPaste,
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
		 * Handle the wheel event on the SVG canvas for scrolling.
		 */
		const handleWheel = useCallback(
			(e: React.WheelEvent<SVGSVGElement>) => {
				// Bypass references to avoid function creation in every render.
				const { onScroll } = refBus.current;

				onScroll?.({
					minX: minX + e.deltaX,
					minY: minY + e.deltaY,
					clientX: e.clientX + e.deltaX,
					clientY: e.clientY + e.deltaY,
				});
			},
			[minX, minY],
		);

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

		// Monitor keyboard events.
		useEffect(() => {
			const onDocumentKeyDown = (e: KeyboardEvent) => {
				// Bypass references to avoid function creation in every render.
				const {
					hasFocus,
					textEditorState,
					onDelete,
					onSelectAll,
					onClearAllSelection,
					onUndo,
					onRedo,
					onCopy,
					onPaste,
				} = refBus.current;

				if (e.key === "Control") {
					isCtrlDown.current = true;
				}

				// SVG要素にフォーカスがない場合は、以降の処理をスキップ
				if (!hasFocus.current && !textEditorState.isActive) {
					return;
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
					if (e.key === "c" && !textEditorState.isActive) {
						// Copy selected items when Ctrl+C is pressed.
						e.preventDefault();
						onCopy?.();
					}
					if (e.key === "v" && !textEditorState.isActive) {
						// Paste items from clipboard when Ctrl+V is pressed.
						e.preventDefault();
						onPaste?.();
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
				if (e.ctrlKey) {
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
		}, []);

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
				onSelect: handleSelect,
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
							viewBox={`${minX * zoom} ${minY * zoom} ${containerWidth * zoom} ${containerHeight * zoom}`}
							tabIndex={0}
							ref={svgRef}
							onPointerDown={handlePointerDown}
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
									onSelect={handleSelect}
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
					{/* Container for HTML elements that follow the scroll of the SVG canvas. */}{" "}
					<HTMLElementsContainer
						left={-minX}
						top={-minY}
						width={containerWidth + minX}
						height={containerHeight + minY}
					>
						<TextEditor {...textEditorState} onTextChange={onTextChange} />
						<DiagramMenu {...diagramMenuProps} />
					</HTMLElementsContainer>
				</Container>
				{/* Container for HTML elements fixed to the viewport. */}
				<ViewportOverlay>
					<CanvasMenu onNewDiagram={onNewDiagram} />
					<UserMenu />
					<ContextMenu {...contextMenuProps} />
				</ViewportOverlay>
			</Viewport>
		);
	},
);

export const SvgCanvas = memo(SvgCanvasComponent);
