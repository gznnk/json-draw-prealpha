// Import React.
import React, {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
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
	ContentWrapper,
	HTMLElementsContainer,
	MultiSelectGroupContainer,
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
			width,
			height,
			items,
			scrollLeft,
			scrollTop,
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
			onCopy,
			onPaste,
			onZoom,
		} = props;

		// SVG要素のコンテナの参照
		const containerRef = useRef<HTMLDivElement>(null);
		// SVG要素の参照
		const svgRef = useRef<SVGSVGElement>(null);

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
			width,
			height,
			items,
			scrollLeft,
			scrollTop,
			zoom,
		} as SvgCanvasState);

		// Use the context menu hook to handle context menu events.
		const { contextMenuProps, contextMenuHandlers, contextMenuFunctions } =
			useContextMenu(props);

		// Use the diagram menu hook to handle diagram menu events.
		const { diagramMenuProps } = useDiagramMenu(props);
		// Create references bypass to avoid function creation in every render.
		const refBusVal = {
			scrollLeft,
			scrollTop,
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
			onCopy,
			onPaste,
			onZoom,
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
					zoom,
					onDelete,
					onSelectAll,
					onClearAllSelection,
					onUndo,
					onRedo,
					onCopy,
					onPaste,
					onZoom,
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
					} // Zoom in when Ctrl+Plus is pressed (support multiple key variations)
					if (
						(e.key === "+" ||
							e.key === "=" ||
							e.code === "Equal" ||
							e.code === "Semicolon") &&
						!textEditorState.isActive
					) {
						e.preventDefault();
						e.stopPropagation();
						const newZoom = Math.min(3.0, zoom * 1.1);
						onZoom?.(newZoom);
					}
					// Zoom out when Ctrl+Minus is pressed (support multiple key variations)
					if (
						(e.key === "-" || e.code === "Minus") &&
						!textEditorState.isActive
					) {
						e.preventDefault();
						e.stopPropagation();
						const newZoom = Math.max(0.1, zoom * 0.9);
						onZoom?.(newZoom);
					}
					// Reset zoom when Ctrl+0 is pressed
					if (
						(e.key === "0" || e.code === "Digit0") &&
						!textEditorState.isActive
					) {
						e.preventDefault();
						e.stopPropagation();
						onZoom?.(1.0);
					}
				}
			};

			const onDocumentKeyUp = (e: KeyboardEvent) => {
				if (e.key === "Control") {
					isCtrlDown.current = false;
				}
			};

			// Prevent browser zoom with Ctrl+wheel at document level
			const onDocumentWheel = (e: WheelEvent) => {
				if (e.ctrlKey) {
					e.preventDefault();
					e.stopPropagation();
					const delta = e.deltaY > 0 ? 0.9 : 1.1;
					const newZoom = Math.max(
						0.1,
						Math.min(3.0, refBus.current.zoom * delta),
					);
					refBus.current.onZoom?.(newZoom);
				}
			};

			// Add event listeners for keydown, keyup, and wheel events.
			document.addEventListener("keydown", onDocumentKeyDown);
			document.addEventListener("keyup", onDocumentKeyUp);
			document.addEventListener("wheel", onDocumentWheel, {
				passive: false,
				capture: true,
			});

			return () => {
				document.removeEventListener("keydown", onDocumentKeyDown);
				document.removeEventListener("keyup", onDocumentKeyUp);
				document.removeEventListener("wheel", onDocumentWheel, true);
			};
		}, []);

		useEffect(() => {
			if (containerRef.current) {
				const { scrollLeft, scrollTop } = refBus.current;
				containerRef.current.scrollLeft = scrollLeft;
				containerRef.current.scrollTop = scrollTop;
			}
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
				<Container ref={containerRef} onScroll={onScroll}>
					<ContentWrapper
						zoom={zoom}
						contentWidth={width}
						contentHeight={height}
					>
						<SvgCanvasContext.Provider value={stateProvider.current}>
							<Svg
								width={width}
								height={height}
								viewBox={`${minX} ${minY} ${width} ${height}`}
								tabIndex={0}
								ref={svgRef}
								zoom={zoom}
								contentWidth={width}
								contentHeight={height}
								onPointerDown={handlePointerDown}
								onKeyDown={handleKeyDown}
								onFocus={handleFocus}
								onBlur={handleBlur}
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
								{/* Render new connect line. */}
								<NewConnectLine />
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
							zoom={zoom}
						>
							<TextEditor {...textEditorState} onTextChange={onTextChange} />
							<DiagramMenu {...diagramMenuProps} />
						</HTMLElementsContainer>
					</ContentWrapper>
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
