// Import React.
import type { ReactElement } from "react";

// Import components.
import { Page } from "./components/Page";
import { CanvasView } from "./components/CanvasView";

// Import types.
import type { SvgCanvasData } from "../features/svg-canvas/canvas/SvgCanvasTypes";

/**
 * Appコンポーネント
 * アプリケーションのメインレイアウトを定義します
 */
const App = (): ReactElement => {
	// デフォルトのキャンバスデータを作成
	const defaultCanvasData: SvgCanvasData = {
		id: "default-canvas",
		minX: 0,
		minY: 0,
		width: 1000,
		height: 1000,
		items: [],
	};

	return (
		<div className="App">
			<Page>
				<CanvasView content={defaultCanvasData} />
			</Page>
		</div>
	);
};

export default App;
