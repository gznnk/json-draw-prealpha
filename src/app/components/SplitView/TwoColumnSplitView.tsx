import type React from "react";
import { useRef, useState, memo } from "react";

import { Container, Pane, Divider, DividerHitArea } from "./SplitViewStyled";

// 最小ペインサイズの定数
const MIN_PANE_SIZE = 0.1; // 10%

type TwoColumnSplitViewProps = {
	initialRatio?: number; // 左ペインの比率（0-1）
	left: React.ReactNode;
	right: React.ReactNode;
};

/**
 * 2分割可能なビューを提供するコンポーネント。
 * ドラッグできるディバイダーで分割比率を調整できる。
 *
 * @param initialRatio - 左ペインの初期比率 (デフォルト: 0.5)
 * @param left - 左側に表示するコンテンツ
 * @param right - 右側に表示するコンテンツ
 */
const TwoColumnSplitViewComponent = ({
	initialRatio = 0.5,
	left,
	right,
}: TwoColumnSplitViewProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const dividerRef = useRef<HTMLDivElement>(null);

	// 比率を0.1-0.9の範囲に制限
	const clampedInitialRatio = Math.max(
		MIN_PANE_SIZE,
		Math.min(1 - MIN_PANE_SIZE, initialRatio),
	);
	const [leftRatio, setLeftRatio] = useState<number>(clampedInitialRatio);

	const handlePointerDown = (e: React.PointerEvent) => {
		e.preventDefault();
		const startX = e.clientX;
		const container = containerRef.current;
		const divider = dividerRef.current;

		if (!container || !divider) return;

		// ポインタキャプチャを設定
		divider.setPointerCapture(e.pointerId);

		const initialRatio = leftRatio;
		const containerWidth = container.offsetWidth;

		const handlePointerMove = (moveEvent: PointerEvent) => {
			const dx = moveEvent.clientX - startX;
			const ratioChange = dx / containerWidth;

			// 新しい比率を計算（最小・最大サイズを考慮）
			const newLeftRatio = Math.max(
				MIN_PANE_SIZE,
				Math.min(1 - MIN_PANE_SIZE, initialRatio + ratioChange),
			);

			setLeftRatio(newLeftRatio);
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
			<Pane style={{ flex: leftRatio }}>{left}</Pane>
			<Divider>
				<DividerHitArea ref={dividerRef} onPointerDown={handlePointerDown} />
			</Divider>
			<Pane style={{ flex: 1 - leftRatio }}>{right}</Pane>
		</Container>
	);
};

export const TwoColumnSplitView = memo(TwoColumnSplitViewComponent);
