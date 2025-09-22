import type React from "react";
import { useRef, useState, memo } from "react";

import { Container, Pane, Divider, DividerHitArea } from "./SplitViewStyled";

// 最小ペインサイズの定数
const MIN_PANE_SIZE = {
	SIDE: 0.1, // 左右ペインの最小サイズ (10%)
	CENTER: 0.2, // 中央ペインの最小サイズ (20%)
};

type ThreeColumnSplitViewProps = {
	initialRatio?: [number, number, number]; // 左、中央、右の比率（合計1になるように調整）
	left: React.ReactNode;
	center: React.ReactNode;
	right: React.ReactNode;
};

/**
 * 3分割可能なビューを提供するコンポーネント。
 * ドラッグできるディバイダーで分割比率を調整できる。
 *
 * @param initialRatio - 初期の分割比率の配列 [左, 中央, 右] (デフォルト: [0.2, 0.6, 0.2])
 * @param left - 左側に表示するコンテンツ
 * @param center - 中央に表示するコンテンツ
 * @param right - 右側に表示するコンテンツ
 */
const ThreeColumnSplitViewComponent = ({
	initialRatio = [0.2, 0.6, 0.2],
	left,
	center,
	right,
}: ThreeColumnSplitViewProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const leftDividerRef = useRef<HTMLDivElement>(null);
	const rightDividerRef = useRef<HTMLDivElement>(null);

	// 初期比率の正規化
	const normalizeRatios = (
		ratios: [number, number, number],
	): [number, number, number] => {
		const sum = ratios.reduce((a, b) => a + b, 0);
		if (Math.abs(sum - 1) > 0.001) {
			return ratios.map((r) => r / sum) as [number, number, number];
		}
		return ratios;
	};

	const [ratios, setRatios] = useState<[number, number, number]>(
		normalizeRatios(initialRatio),
	);

	const handlePointerDown =
		(dividerIndex: 0 | 1) => (e: React.PointerEvent) => {
			e.preventDefault();
			const startX = e.clientX;
			const container = containerRef.current;
			const divider =
				dividerIndex === 0 ? leftDividerRef.current : rightDividerRef.current;

			if (!container || !divider) return;

			// ポインタキャプチャを設定
			divider.setPointerCapture(e.pointerId);

			const initialRatios = [...ratios] as [number, number, number];
			const containerWidth = container.offsetWidth;

			const handlePointerMove = (moveEvent: PointerEvent) => {
				const dx = moveEvent.clientX - startX;
				const ratioChange = dx / containerWidth;

				const newRatios = [...initialRatios] as [number, number, number];

				if (dividerIndex === 0) {
					// 左のディバイダーを動かす場合
					const maxMoveLeft = initialRatios[1] - MIN_PANE_SIZE.CENTER; // 中央ペインが最小サイズを確保
					const minMoveLeft = -(initialRatios[0] - MIN_PANE_SIZE.SIDE); // 左ペインが最小サイズを確保

					const adjustedChange = Math.max(
						minMoveLeft,
						Math.min(maxMoveLeft, ratioChange),
					);

					newRatios[0] = initialRatios[0] + adjustedChange;
					newRatios[1] = initialRatios[1] - adjustedChange;
					// newRatios[2]はそのまま
				} else {
					// 右のディバイダーを動かす場合
					const maxMoveRight = initialRatios[2] - MIN_PANE_SIZE.SIDE; // 右ペインが最小サイズを確保
					const minMoveRight = -(initialRatios[1] - MIN_PANE_SIZE.CENTER); // 中央ペインが最小サイズを確保

					const adjustedChange = Math.max(
						minMoveRight,
						Math.min(maxMoveRight, ratioChange),
					);

					// newRatios[0]はそのまま
					newRatios[1] = initialRatios[1] + adjustedChange;
					newRatios[2] = initialRatios[2] - adjustedChange;
				}

				setRatios(newRatios);
			};

			const handlePointerUp = (upEvent: PointerEvent) => {
				// ポインタキャプチャを解除
				divider.releasePointerCapture(upEvent.pointerId);
				divider.removeEventListener("pointermove", handlePointerMove);
				divider.removeEventListener("pointerup", handlePointerUp);
				divider.removeEventListener("pointercancel", handlePointerUp);
			};

			divider.addEventListener("pointermove", handlePointerMove);
			divider.addEventListener("pointerup", handlePointerUp);
			divider.addEventListener("pointercancel", handlePointerUp);
		};

	return (
		<Container ref={containerRef}>
			<Pane style={{ flex: ratios[0] }}>{left}</Pane>
			<Divider>
				<DividerHitArea
					ref={leftDividerRef}
					onPointerDown={handlePointerDown(0)}
				/>
			</Divider>
			<Pane style={{ flex: ratios[1] }}>{center}</Pane>
			<Divider>
				<DividerHitArea
					ref={rightDividerRef}
					onPointerDown={handlePointerDown(1)}
				/>
			</Divider>
			<Pane style={{ flex: ratios[2] }}>{right}</Pane>
		</Container>
	);
};

export const ThreeColumnSplitView = memo(ThreeColumnSplitViewComponent);
