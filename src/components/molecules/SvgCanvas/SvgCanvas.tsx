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
import type {
	ConnectPointsMoveEvent,
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramSelectEvent,
	DiagramTextChangeEvent,
	DiagramTextEditEvent,
	DiagramTransformEvent,
	DiagramChangeEvent,
} from "./types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import { TextEditor, type TextEditorProps } from "./components/core/Textable";
import Group from "./components/diagram/Group";
import ContextMenu, {
	type ContextMenuType,
} from "./components/operation/ContextMenu";

// SvgCanvas関連関数をインポート
import { isItemableData } from "./functions/Diagram";
import { newEventId } from "./functions/Util";

// SvgCanvasの状態を階層を跨いで提供するためにSvgCanvasStateProviderを保持するコンテキストを作成
export const SvgCanvasContext = createContext<SvgCanvasStateProvider | null>(
	null,
);

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
}) => {
	// SVG要素のコンテナの参照
	const containerRef = useRef<HTMLDivElement>(null);

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
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<SVGSVGElement>) => {
			// Deleteキー押下の検知のみを行い、処理はHooksに委譲
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

	// Ctrlキーの押下状態を監視
	useEffect(() => {
		const onDocumentKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Control") {
				isCtrlDown.current = true;
			}
		};
		const onDocumentKeyUp = (e: KeyboardEvent) => {
			if (e.key === "Control") {
				isCtrlDown.current = false;
			}
		};
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
			onDrag,
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
			<ContainerDiv ref={containerRef}>
				<SvgCanvasContext.Provider value={stateProvider.current}>
					<Svg
						width="120vw"
						height="120vh"
						tabIndex={0}
						onPointerDown={handlePointerDown}
						onPointerMove={handlePointerMove}
						onPointerUp={handlePointerUp}
						onKeyDown={handleKeyDown}
						onContextMenu={handleContextMenu}
					>
						<title>{title}</title>
						{renderedItems}
						{/* 複数選択時の一時グループ */}
						{multiSelectGroup && (
							<Group
								{...multiSelectGroup}
								id="MultiSelectGroup"
								syncWithSameId
								onSelect={handleSelect}
								onTransform={onTransform}
								onDiagramChange={onDiagramChange}
								onDrag={onDrag} // TODO: 必要か精査
								onDrop={onDrop} // TODO: 必要か精査
								onConnectPointsMove={onConnectPointsMove}
							/>
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

/**
 * IDに対応する図形データを取得する
 *
 * @param diagrams - 図形データ配列
 * @param id - ID
 * @returns - 図形データ
 */
const getDiagramById = (
	diagrams: Diagram[],
	id: string,
): Diagram | undefined => {
	for (const diagram of diagrams) {
		if (diagram.id === id) {
			return diagram;
		}
		// グループデータの場合は再帰的に探索
		if (isItemableData(diagram)) {
			const ret = getDiagramById(diagram.items || [], id);
			if (ret) {
				return ret;
			}
		}
	}
};
