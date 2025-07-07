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

// Import SvgCanvas related type definitions
import { DiagramRegistry } from "../registry";
import { initializeSvgCanvasDiagrams } from "./SvgCanvasRegistry";
import { newEventId } from "../utils/common/newEventId";

// Import SvgCanvas related components
import { TextEditor } from "../components/core/Textable";
import { CanvasMenu } from "../components/menus/CanvasMenu";
import { ContextMenu, useContextMenu } from "../components/menus/ContextMenu";
import { DiagramMenu, useDiagramMenu } from "../components/menus/DiagramMenu";
import { FlashConnectLine } from "../components/shapes/ConnectLine";
import { PreviewConnectLine } from "../components/shapes/PreviewConnectLine";
import { Group } from "../components/shapes/Group";
import UserMenu from "../components/menus/UserMenu/UserMenu";
import { MiniMap } from "../components/auxiliary/MiniMap";

// Imports related to this component.
import { useShortcutKey } from "./hooks/keyboard/useShortcutKey";
import { MULTI_SELECT_GROUP } from "./SvgCanvasConstants";
import {
	Container,
	HTMLElementsContainer,
	SelectionRect,
	Svg,
	Viewport,
	ViewportOverlay,
} from "./SvgCanvasStyled";
import type { SvgCanvasProps, SvgCanvasRef } from "./SvgCanvasTypes";

// Import SvgCanvas context.
import { EventBusProvider } from "../context/EventBusContext";

// Initialize all diagram types when this module is loaded
initializeSvgCanvasDiagrams();

/**
 * SvgCanvas component
 */
const SvgCanvasComponent = forwardRef<SvgCanvasRef, SvgCanvasProps>(
	(props, ref) => {
		// In the SvgCanvas render function,
		// we handle DOM events related to the SvgCanvas elements.
		const {
			eventBus,
			title,
			minX,
			minY,
			items,
			zoom,
			multiSelectGroup,
			textEditorState,
			previewConnectLineState,
			isGrabScrollReady,
			isGrabScrolling,
			selectionState,
			// actions
			onClick,
			onConnect,
			onCopy,
			onDelete,
			onDiagramChange,
			onDrag,
			onDragEnter,
			onDragLeave,
			onExecute,
			onHoverChange,
			onNewDiagram,
			onPaste,
			onPreviewConnectLine,
			onTextChange,
			onTransform,
			// history
			onRedo,
			onUndo,
			// navigation
			onGrabStart,
			onGrabMove,
			onGrabEnd,
			onNavigate,
			onScroll,
			onZoom,
			// selection
			onAreaSelection,
			onCancelAreaSelection,
			onClearAllSelection,
			onSelect,
			onSelectAll,
			// other
			onDataChange,
		} = props;

		// Reference to the SVG element container
		const containerRef = useRef<HTMLDivElement>(null);
		// Reference to the SVG element
		const svgRef = useRef<SVGSVGElement>(null);
		// Container dimensions state
		const [containerWidth, setContainerWidth] = useState(0);
		const [containerHeight, setContainerHeight] = useState(0);

		// Forward refs to parent using useImperativeHandle
		useImperativeHandle(ref, () => ({
			containerRef,
			svgRef,
		}));

		// Flag indicating whether the SVG element has focus
		const hasFocus = useRef(false);

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
			onDragEnter,
			onDragLeave,
			onDiagramChange,
			onClearAllSelection,
			onDataChange,
			onHoverChange,
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
		 * Focus event handler for SVG element
		 */
		const handleFocus = useCallback(() => {
			hasFocus.current = true;
		}, []);

		/**
		 * Blur event handler for SVG element
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

				if (e.target === e.currentTarget) {
					// Check for Ctrl+drag to start grab scrolling
					if (e.ctrlKey && onGrabStart?.(e)) {
						return;
					}

					// Start area selection if not pressing Ctrl key
					if (!e.ctrlKey && onAreaSelection) {
						onAreaSelection({
							eventId: newEventId(),
							eventType: "Start",
							clientX: e.clientX,
							clientY: e.clientY,
						});
					}

					// Clear the selection when pointer is down on the canvas.
					onClearAllSelection?.();
				}

				// Close the context menu.
				contextMenuFunctions.closeContextMenu();
			},
			[onAreaSelection],
		);

		/**
		 * Handle the pointer move event for grab scrolling and area selection.
		 */
		const handlePointerMove = useCallback(
			(e: React.PointerEvent<SVGSVGElement>) => {
				// Handle area selection if active
				if (selectionState?.isSelecting && onAreaSelection) {
					onAreaSelection({
						eventId: newEventId(),
						eventType: "InProgress",
						clientX: e.clientX,
						clientY: e.clientY,
					});
					return;
				}

				refBus.current.onGrabMove?.(e);
			},
			[selectionState?.isSelecting, onAreaSelection],
		);
		/**
		 * Handle the pointer up event to end grab scrolling and area selection.
		 */
		const handlePointerUp = useCallback(
			(e: React.PointerEvent<SVGSVGElement>) => {
				// Handle area selection end
				if (selectionState?.isSelecting && onAreaSelection) {
					onAreaSelection({
						eventId: newEventId(),
						eventType: "End",
						clientX: e.clientX,
						clientY: e.clientY,
					});
					return;
				}

				refBus.current.onGrabEnd?.(e);
			},
			[selectionState?.isSelecting, onAreaSelection],
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
		 * SvgCanvas key down event handler
		 */
		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<SVGSVGElement>) => {
				// Cancel area selection on Escape key
				if (e.key === "Escape" && selectionState?.isSelecting) {
					e.preventDefault();
					if (onCancelAreaSelection) {
						onCancelAreaSelection();
					}
					return;
				}

				// Cancel event if canvas doesn't have focus to disable scrolling
				if (e.target !== e.currentTarget) {
					e.preventDefault();
				}
			},
			[selectionState?.isSelecting, onCancelAreaSelection],
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

		// Render diagrams
		const renderedItems = items.map((item) => {
			const component = DiagramRegistry.getComponent(item.type);
			if (!component) {
				console.warn(`Component not found for type: ${item.type}`);
				return null;
			}
			const props = {
				...item,
				key: item.id,
				onTransform,
				onDiagramChange,
				onDrag,
				onDragEnter,
				onDragLeave,
				onClick,
				onSelect,
				onConnect,
				onPreviewConnectLine,
				onTextChange,
				onExecute,
				onHoverChange,
			};

			return React.createElement(component(), props);
		});

		return (
			<Viewport>
				<Container ref={containerRef}>
					<EventBusProvider eventBus={eventBus}>
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
									onTransform={onTransform}
								/>
							)}
							{/* Render preview connect line. */}
							<PreviewConnectLine pathData={previewConnectLineState} />
							{/* Render flash connect lines */}
							<FlashConnectLine />
							{/* Render area selection rectangle */}
							{selectionState && (
								<SelectionRect
									x={Math.min(selectionState.startX, selectionState.endX)}
									y={Math.min(selectionState.startY, selectionState.endY)}
									width={Math.abs(selectionState.endX - selectionState.startX)}
									height={Math.abs(selectionState.endY - selectionState.startY)}
									visible={selectionState.isSelecting}
								/>
							)}
						</Svg>
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
					</EventBusProvider>
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
