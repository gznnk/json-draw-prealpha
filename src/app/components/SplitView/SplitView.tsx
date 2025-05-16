// SplitView.tsx
import type React from "react";
import { useRef, useState, memo } from "react";

import { Container, Pane, Divider } from "./SplitViewStyled";

type SplitViewProps = {
	initialRatio?: number; // 左右の幅比率（0〜1）
	left: React.ReactNode;
	right: React.ReactNode;
};

/**
 * 左右に分割可能なビューを提供するコンポーネント。
 * 真ん中のドラッグできるディバイダーで分割比率を調整できる。
 *
 * @param initialRatio - 初期の分割比率 (0〜1)
 * @param left - 左側に表示するコンテンツ
 * @param right - 右側に表示するコンテンツ
 */
const SplitViewComponent = ({
	initialRatio = 0.5,
	left,
	right,
}: SplitViewProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const dividerRef = useRef<HTMLDivElement>(null);
	const [ratio, setRatio] = useState(initialRatio);

	const handlePointerDown = (e: React.PointerEvent) => {
		e.preventDefault();
		const startX = e.clientX;
		const container = containerRef.current;
		const divider = dividerRef.current;

		if (!container || !divider) return;

		// ポインタキャプチャを設定
		divider.setPointerCapture(e.pointerId);

		const handlePointerMove = (moveEvent: PointerEvent) => {
			const dx = moveEvent.clientX - startX;
			const newRatio =
				(container.offsetWidth * ratio + dx) / container.offsetWidth;
			setRatio(Math.max(0.1, Math.min(0.9, newRatio))); // 最小0.1、最大0.9に制限
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
			<Pane style={{ flex: ratio }}>{left}</Pane>
			<Divider ref={dividerRef} onPointerDown={handlePointerDown} />
			<Pane style={{ flex: 1 - ratio }}>{right}</Pane>
		</Container>
	);
};

export const SplitView = memo(SplitViewComponent);
