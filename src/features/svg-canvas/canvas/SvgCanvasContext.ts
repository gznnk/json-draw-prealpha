// Import React.
import { createContext } from "react";

// SvgCanvas関連型定義をインポート
import type { Diagram } from "../catalog/DiagramTypes";

// SvgCanvas関連関数をインポート
import { getDiagramById } from "./utils/getDiagramById";

// Imports related to this component.
import type { SvgCanvasState } from "./SvgCanvasTypes";

/**
 * 階層を跨いでSvgCanvasの状態を提供するクラス.
 */
export class SvgCanvasStateProvider {
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

// SvgCanvasの状態を階層を跨いで提供するためにSvgCanvasStateProviderを保持するコンテキストを作成
export const SvgCanvasContext = createContext<SvgCanvasStateProvider | null>(
	null,
);
