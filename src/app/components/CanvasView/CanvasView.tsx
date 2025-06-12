import { memo, useRef } from "react";
import type { ReactElement } from "react";

// Import SvgCanvas component and hooks
import { SvgCanvas, useSvgCanvas } from "../../../features/svg-canvas";
import type { SvgCanvasRef } from "../../../features/svg-canvas/canvas/SvgCanvasTypes";

// Import types
import type { CanvasViewProps } from "./CanvasViewTypes";

/**
 * 親コンポーネントから渡されたSvgCanvasDataを使用してSVGキャンバスを表示するコンポーネント
 * ローカルストレージからデータを取得せず、親コンポーネントから直接データを受け取ります
 */
const CanvasViewComponent = ({
	content,
	id,
	onDataChange,
}: CanvasViewProps): ReactElement => {
	// キャンバスへの参照を作成
	const canvasRef = useRef<SvgCanvasRef | null>(null);

	// contentからキャンバスデータを抽出
	const canvasId = id || content.id;
	const { items, minX, minY } = content;

	// useSvgCanvasフックを使用して必要な状態を初期化
	const { canvasProps } = useSvgCanvas({
		id: canvasId,
		items,
		minX: minX || 0,
		minY: minY || 0,
		zoom: 1,
		canvasRef,
		onDataChange,
	});

	// SvgCanvas コンポーネントに全ての必要なプロパティを展開して渡す
	return <SvgCanvas {...canvasProps} ref={canvasRef} />;
};

export const CanvasView = memo(CanvasViewComponent);
