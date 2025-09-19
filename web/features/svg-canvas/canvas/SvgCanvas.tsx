import React, {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

import { MULTI_SELECT_GROUP } from "./SvgCanvasConstants";
import { InteractionState } from "./types/InteractionState";
import type { SvgCanvasProps } from "./types/SvgCanvasProps";
import type { SvgCanvasRef } from "./types/SvgCanvasRef";
import {
	getNextZoomLevel,
	getPreviousZoomLevel,
	getResetZoomLevel,
} from "./utils/zoomLevels";
import { GridBackground } from "../components/auxiliary/GridBackground";
import { GridPattern } from "../components/auxiliary/GridPattern";
import { MiniMap } from "../components/auxiliary/MiniMap";
import { PointerCaptureElement } from "../components/auxiliary/PointerCaptureElement";
import { PreviewConnectLine } from "../components/auxiliary/PreviewConnectLine";
import { ZoomControls } from "../components/auxiliary/ZoomControls";
import { TextEditor } from "../components/core/Textable";
import { CanvasMenu } from "../components/menus/CanvasMenu";
import { ContextMenu, useContextMenu } from "../components/menus/ContextMenu";
import { DiagramMenu, useDiagramMenu } from "../components/menus/DiagramMenu";
import UserMenu from "../components/menus/UserMenu/UserMenu";
import { FlashConnectLine } from "../components/shapes/ConnectLine";
import { Group } from "../components/shapes/Group";
// Import registry.
import { DiagramRegistry } from "../registry";
import { initializeSvgCanvasDiagrams } from "./SvgCanvasRegistry";
import { newEventId } from "../utils/core/newEventId";
import { useShortcutKey } from "./hooks/keyboard/useShortcutKey";
import {
	Container,
	HTMLElementsContainer,
	SelectionRect,
	Svg,
	Viewport,
	ViewportOverlay,
} from "./SvgCanvasStyled";
import { EventBusProvider } from "../context/EventBusContext";
import { SvgViewportProvider } from "../context/SvgViewportContext";
import type { SvgViewport } from "../types/core/SvgViewport";

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
			grabScrollState,
			selectionState,
			interactionState,
			// actions
			onClick,
			onConnect,
			onCopy,
			onDelete,
			onDiagramChange,
			onDrag,
			onDragOver,
			onDragLeave,
			onExecute,
			onHoverChange,
			onAddDiagramByType,
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
		} = props;

		// Reference to the SVG element container
		const containerRef = useRef<HTMLDivElement>(null);
		// Reference to the SVG element
		const svgRef = useRef<SVGSVGElement>(null);
		// Forward refs to parent using useImperativeHandle
		useImperativeHandle(ref, () => ({
			containerRef,
			svgRef,
		}));

		// Container dimensions state
		const [containerWidth, setContainerWidth] = useState(0);
		const [containerHeight, setContainerHeight] = useState(0);

		// Reference of the SVG viewport
		const viewportRef = useRef<SvgViewport>({
			minX,
			minY,
			containerWidth,
			containerHeight,
			zoom,
		});
		viewportRef.current = {
			minX,
			minY,
			containerWidth,
			containerHeight,
			zoom,
		};

		// Flag indicating whether the SVG element has focus
		const hasFocus = useRef(false);

		// Use the context menu hook to handle context menu events.
		const {
			contextMenuProps,
			contextMenuHandlers: { onContextMenu },
			contextMenuFunctions,
		} = useContextMenu(props);

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
			onDragOver,
			onDragLeave,
			onDiagramChange,
			onClearAllSelection,
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
					// Start area selection if left mouse button is pressed
					if (e.button === 0 && onAreaSelection) {
						// Use dummy element for pointer capture to enable auto-scroll when pointer is outside viewport
						if (dummyElementRef.current) {
							dummyElementRef.current.setPointerCapture(e.pointerId);
							capturedPointerIdRef.current = e.pointerId;
						}

						onAreaSelection({
							eventId: newEventId(),
							eventPhase: "Started",
							clientX: e.clientX,
							clientY: e.clientY,
						});
					}

					// Handle grab start for right mouse button
					if (e.button === 2) {
						onGrabStart?.(e);
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
		 * Handle the pointer move event for grab scrolling.
		 * Area selection is handled by PointerCaptureElement when pointer capture is active.
		 */
		const handlePointerMove = useCallback(
			(e: React.PointerEvent<SVGSVGElement>) => {
				// Call the grab move handler
				refBus.current.onGrabMove?.(e);
			},
			[],
		);

		/**
		 * Handle the pointer up event to end grab scrolling.
		 * Area selection end is handled by PointerCaptureElement when pointer capture is active.
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
				newMinX: minX + e.deltaX,
				newMinY: minY + e.deltaY,
				clientX: e.clientX,
				clientY: e.clientY,
				deltaX: e.deltaX,
				deltaY: e.deltaY,
			});
		}, []);

		/**
		 * SvgCanvas key down event handler
		 */
		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<SVGSVGElement>) => {
				// Cancel area selection on Escape key
				if (
					e.key === "Escape" &&
					interactionState === InteractionState.AreaSelection
				) {
					e.preventDefault();
					// Release pointer capture from dummy element
					if (
						dummyElementRef.current &&
						capturedPointerIdRef.current !== null
					) {
						try {
							dummyElementRef.current.releasePointerCapture(
								capturedPointerIdRef.current,
							);
							capturedPointerIdRef.current = null;
						} catch {
							// Ignore errors if pointer capture wasn't set
						}
					}
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
			[interactionState, onCancelAreaSelection],
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

		// Create a dummy element for pointer capture during area selection
		const dummyElementRef = useRef<HTMLDivElement>(null);
		const capturedPointerIdRef = useRef<number | null>(null);

		/**
		 * Handle pointer move events from the capture element
		 */
		const handleCaptureElementPointerMove = useCallback(
			(e: React.PointerEvent<HTMLDivElement>) => {
				// Forward pointer move events to area selection when captured
				if (
					interactionState === InteractionState.AreaSelection &&
					onAreaSelection
				) {
					onAreaSelection({
						eventId: newEventId(),
						eventPhase: "InProgress",
						clientX: e.clientX,
						clientY: e.clientY,
					});
				}
			},
			[interactionState, onAreaSelection],
		);

		/**
		 * Handle pointer up events from the capture element
		 */
		const handleCaptureElementPointerUp = useCallback(
			(e: React.PointerEvent<HTMLDivElement>) => {
				// Forward pointer up events to area selection when captured
				if (
					interactionState === InteractionState.AreaSelection &&
					onAreaSelection
				) {
					// Release pointer capture from dummy element
					if (
						dummyElementRef.current &&
						capturedPointerIdRef.current !== null
					) {
						dummyElementRef.current.releasePointerCapture(
							capturedPointerIdRef.current,
						);
						capturedPointerIdRef.current = null;
					}

					onAreaSelection({
						eventId: newEventId(),
						eventPhase: "Ended",
						clientX: e.clientX,
						clientY: e.clientY,
					});
				}
			},
			[interactionState, onAreaSelection],
		);

		// Zoom control handlers
		const handleZoomIn = useCallback(() => {
			const nextLevel = getNextZoomLevel(zoom);
			onZoom?.(nextLevel);
		}, [onZoom, zoom]);

		const handleZoomOut = useCallback(() => {
			const prevLevel = getPreviousZoomLevel(zoom);
			onZoom?.(prevLevel);
		}, [onZoom, zoom]);

		const handleZoomReset = useCallback(() => {
			const resetLevel = getResetZoomLevel();
			onZoom?.(resetLevel);
		}, [onZoom]);

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
				onDragOver,
				onDragLeave,
				onClick,
				onSelect,
				onConnect,
				onPreviewConnectLine,
				onTextChange,
				onExecute,
				onHoverChange,
			};

			return React.createElement(component, props);
		});

		return (
			<Viewport>
				<Container ref={containerRef}>
					<EventBusProvider eventBus={eventBus}>
						<SvgViewportProvider viewportRef={viewportRef}>
							<Svg
								width={containerWidth}
								height={containerHeight}
								viewBox={`${minX / zoom} ${minY / zoom} ${containerWidth / zoom} ${containerHeight / zoom}`}
								tabIndex={0}
								ref={svgRef}
								isGrabScrolling={grabScrollState?.isGrabScrolling}
								onPointerDown={handlePointerDown}
								onPointerMove={handlePointerMove}
								onPointerUp={handlePointerUp}
								onKeyDown={handleKeyDown}
								onFocus={handleFocus}
								onBlur={handleBlur}
								onWheel={handleWheel}
								onContextMenu={onContextMenu}
							>
								<title>{title}</title>
								{/* Grid pattern definition */}
								<GridPattern gridSize={20} color="rgba(24, 144, 255, 0.1)" />
								{/* Grid background */}
								<GridBackground
									x={minX / zoom}
									y={minY / zoom}
									width={containerWidth / zoom}
									height={containerHeight / zoom}
								/>
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
										width={Math.abs(
											selectionState.endX - selectionState.startX,
										)}
										height={Math.abs(
											selectionState.endY - selectionState.startY,
										)}
										visible={
											interactionState === InteractionState.AreaSelection
										}
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
						</SvgViewportProvider>
					</EventBusProvider>
				</Container>
				{/* Container for HTML elements fixed to the viewport. */}
				<ViewportOverlay>
					<CanvasMenu onAddDiagramByType={onAddDiagramByType} />
					<UserMenu />
					<ContextMenu {...contextMenuProps} />
					<ZoomControls
						zoom={zoom}
						onZoomIn={handleZoomIn}
						onZoomOut={handleZoomOut}
						onZoomReset={handleZoomReset}
					/>
					<MiniMap
						items={items}
						minX={minX}
						minY={minY}
						containerWidth={containerWidth}
						containerHeight={containerHeight}
						zoom={zoom}
						onNavigate={onNavigate}
					/>
					{/* Pointer capture element for area selection */}
					<PointerCaptureElement
						elementRef={dummyElementRef}
						capturedPointerId={capturedPointerIdRef.current}
						onPointerMove={handleCaptureElementPointerMove}
						onPointerUp={handleCaptureElementPointerUp}
					/>
				</ViewportOverlay>
			</Viewport>
		);
	},
);
SvgCanvasComponent.displayName = "SvgCanvas";

export const SvgCanvas = memo(SvgCanvasComponent);
