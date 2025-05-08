// Import React.
import React, {
	createContext,
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
} from "react";

// SvgCanvas関連型定義をインポート
import { type Diagram, DiagramComponentCatalog } from "../types/DiagramCatalog";
import type { DiagramSelectEvent, NewItemEvent } from "../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import { TextEditor } from "../components/core/Textable";
import { CanvasMenu } from "../components/menus/CanvasMenu";
import { ContextMenu, useContextMenu } from "../components/menus/ContextMenu";
import { DiagramMenu, useDiagramMenu } from "../components/menus/DiagramMenu";
import { FlashConnectLine } from "../components/shapes/ConnectLine";
import { NewConnectLine } from "../components/shapes/ConnectPoint";
import { Group } from "../components/shapes/Group";

// SvgCanvas関連関数をインポート
import { newEventId } from "../utils/Util";

import UserMenu from "../components/menus/UserMenu/UserMenu";
import { getDiagramById } from "./SvgCanvasFunctions";

// Imports related to this component.
import { MULTI_SELECT_GROUP } from "./SvgCanvasConstants";
import {
	Container,
	HTMLElementsContainer,
	MultiSelectGroupContainer,
	Svg,
	ViewportOverlay,
} from "./SvgCanvasStyled";
import type {
	SvgCanvasProps,
	SvgCanvasRef,
	SvgCanvasState,
} from "./SvgCanvasTypes";
import { ADD_NEW_ITEM_EVENT_NAME } from "./hooks/useNewItem";

// SvgCanvasの状態を階層を跨いで提供するためにSvgCanvasStateProviderを保持するコンテキストを作成
export const SvgCanvasContext = createContext<SvgCanvasStateProvider | null>(
	null,
);

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
			onNewDiagram,
			onNewItem,
			onExecute,
			onScroll,
			onCopy,
			onPaste,
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
			onScroll,
			onCopy,
			onPaste,
			onNewItem,
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

		// Use the useEffect hook to add an event listener for the new item event.
		useEffect(() => {
			// Bypass references to avoid function creation in every render.
			const { onNewItem } = refBus.current;

			// Add an event listener for the new item event.
			const addNewItemListener = (e: Event) => {
				onNewItem?.((e as CustomEvent<NewItemEvent>).detail);
			};
			window.addEventListener(ADD_NEW_ITEM_EVENT_NAME, addNewItemListener);

			// Cleanup the event listener on component unmount.
			return () => {
				window.removeEventListener(ADD_NEW_ITEM_EVENT_NAME, addNewItemListener);
			};
		}, []);

		useEffect(() => {
			if (containerRef.current) {
				const { scrollLeft, scrollTop } = refBus.current;
				containerRef.current.scrollLeft = scrollLeft;
				containerRef.current.scrollTop = scrollTop;
			}
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
				onDiagramChange,
				onDrag,
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
				<Container ref={containerRef} onScroll={onScroll}>
					<SvgCanvasContext.Provider value={stateProvider.current}>
						<Svg
							width={width}
							height={height}
							viewBox={`${minX} ${minY} ${width} ${height}`}
							tabIndex={0}
							ref={svgRef}
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
	},
);

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
