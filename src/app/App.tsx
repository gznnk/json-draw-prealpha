// Import React.
import type { ReactElement } from "react";
import { useEffect, useState } from "react";

// Import components.
import { Page } from "./components/Page";
import { CanvasView } from "./components/CanvasView";

// Import repository and factory.
import {
	createSvgCanvasRepository,
	type SvgCanvasRepository,
} from "./repository/svg-canvas";
import type { SvgCanvas } from "./models/SvgCanvas";

const svgCanvasRepository: SvgCanvasRepository = createSvgCanvasRepository();

/**
 * Appコンポーネント
 * アプリケーションのメインレイアウトを定義します
 */
const App = (): ReactElement => {
	const [initialCanvasState, setInitialCanvasState] =
		useState<SvgCanvas | null>(null);

	useEffect(() => {
		// 初期状態のキャンバスデータを取得
		const fetchInitialCanvasData = async () => {
			try {
				const canvasData =
					await svgCanvasRepository.getCanvasById("default-canvas");
				if (canvasData) {
					setInitialCanvasState(canvasData);
				} else {
					// デフォルトのキャンバスデータが存在しない場合は、空のデータを設定
					setInitialCanvasState({
						id: "default-canvas",
						name: "Default Canvas",
						content: {
							id: "default-canvas",
							items: [],
							minX: 0,
							minY: 0,
						},
					});
				}
			} catch (error) {
				console.error("Failed to fetch initial canvas data:", error);
			}
		};
		fetchInitialCanvasData();
	}, []);

	return (
		<div className="App">
			<Page>
				{initialCanvasState?.content && (
					<CanvasView
						content={initialCanvasState?.content}
						onDataChange={async (data) => {
							// キャンバスデータが変更されたときにリポジトリに保存
							await svgCanvasRepository.updateCanvas({
								...initialCanvasState,
								content: data,
							});
						}}
					/>
				)}
			</Page>
		</div>
	);
};

export default App;
