// SplitView.tsx
import type React from "react";
import { useRef, useState, memo } from "react";

import { Container, Pane, Divider, DividerHitArea } from "./SplitViewStyled";

// 最小ペインサイズの定数
const MIN_PANE_SIZE = {
	SIDE: 0.1, // 左右ペインの最小サイズ (10%)
	CENTER: 0.2, // 中央ペインの最小サイズ (20%)
};

type SplitViewProps = {
	initialRatio?: number[]; // 分割比率の配列（合計1になるように調整）
	left: React.ReactNode;
	center?: React.ReactNode; // 中央のコンテンツ（オプション）
	right: React.ReactNode;
};

/**
 * 分割可能なビューを提供するコンポーネント。
 * ドラッグできるディバイダーで分割比率を調整できる。
 * 2分割または3分割に対応している。
 *
 * @param initialRatio - 初期の分割比率の配列 (合計が1になるよう調整される)
 * @param left - 左側に表示するコンテンツ
 * @param center - 中央に表示するコンテンツ（指定した場合は3分割、指定しない場合は2分割）
 * @param right - 右側に表示するコンテンツ
 */
const SplitViewComponent = ({
	initialRatio = [0.2, 0.6, 0.2], // 3つの場合のデフォルト比率
	left,
	center,
	right,
}: SplitViewProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const firstDividerRef = useRef<HTMLDivElement>(null);
	const secondDividerRef = useRef<HTMLDivElement>(null);

	// centerが指定されていない場合は2分割モード
	const is2PaneMode = center === undefined;

	// 初期比率の調整
	let initialRatios: number[];
	if (is2PaneMode) {
		// 2分割の場合
		initialRatios =
			initialRatio.length >= 2
				? [initialRatio[0], 1 - initialRatio[0]]
				: [0.5, 0.5];
	} else {
		// 3分割の場合
		initialRatios =
			initialRatio.length >= 3 ? [...initialRatio] : [0.2, 0.6, 0.2];

		// 合計が1になるように調整
		const sum = initialRatios.reduce((a, b) => a + b, 0);
		if (Math.abs(sum - 1) > 0.001) {
			initialRatios = initialRatios.map((r) => r / sum);
		}
	}

	const [ratios, setRatios] = useState<number[]>(initialRatios);

	const handlePointerDown = (index: number) => (e: React.PointerEvent) => {
		e.preventDefault();
		const startX = e.clientX;
		const container = containerRef.current;
		const divider =
			index === 0 ? firstDividerRef.current : secondDividerRef.current;

		if (!container || !divider) return;

		// ポインタキャプチャを設定
		divider.setPointerCapture(e.pointerId);

		const initialRatios = [...ratios];
		const containerWidth = container.offsetWidth;

		const handlePointerMove = (moveEvent: PointerEvent) => {
			const dx = moveEvent.clientX - startX;
			const ratioChange = dx / containerWidth;

			// 新しい比率を計算
			const newRatios = [...initialRatios];
			if (is2PaneMode) {
				// 2分割の場合のシンプルな計算
				newRatios[0] = Math.max(
					MIN_PANE_SIZE.SIDE,
					Math.min(1 - MIN_PANE_SIZE.SIDE, initialRatios[0] + ratioChange),
				);
				newRatios[1] = 1 - newRatios[0];
			} else {
				// 3分割の場合の計算
				if (index === 0) {
					// 左のディバイダーを動かす場合
					// 左ペインが最小サイズを下回らず、中央ペインが最小サイズを下回らないように調整
					const maxMoveLeft = initialRatios[1] - MIN_PANE_SIZE.CENTER; // 中央ペインが最小サイズを確保
					const minMoveLeft = -(initialRatios[0] - MIN_PANE_SIZE.SIDE); // 左ペインが最小サイズを確保

					const adjustedChangeLeft = Math.max(
						minMoveLeft,
						Math.min(maxMoveLeft, ratioChange),
					);

					newRatios[0] = initialRatios[0] + adjustedChangeLeft;
					newRatios[1] = initialRatios[1] - adjustedChangeLeft;
					// newRatios[2]はそのまま
				} else {
					// 右のディバイダーを動かす場合
					// 右ペインが最小サイズを下回らず、中央ペインが最小サイズを下回らないように調整
					const maxMoveRight = initialRatios[2] - MIN_PANE_SIZE.SIDE; // 右ペインが最小サイズを確保
					const minMoveRight = -(initialRatios[1] - MIN_PANE_SIZE.CENTER); // 中央ペインが最小サイズを確保

					const adjustedChangeRight = Math.max(
						minMoveRight,
						Math.min(maxMoveRight, ratioChange),
					);

					// newRatios[0]はそのまま
					newRatios[1] = initialRatios[1] + adjustedChangeRight;
					newRatios[2] = initialRatios[2] - adjustedChangeRight;
				}
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

	// ビューをレンダリング
	if (is2PaneMode) {
		// 2分割モード
		return (
			<Container ref={containerRef}>
				<Pane style={{ flex: ratios[0] }}>{left}</Pane>
				<Divider>
					<DividerHitArea
						ref={firstDividerRef}
						onPointerDown={handlePointerDown(0)}
					/>
				</Divider>
				<Pane style={{ flex: ratios[1] }}>{right}</Pane>
			</Container>
		);
	}
	// 3分割モード
	return (
		<Container ref={containerRef}>
			<Pane style={{ flex: ratios[0] }}>{left}</Pane>
			<Divider>
				<DividerHitArea
					ref={firstDividerRef}
					onPointerDown={handlePointerDown(0)}
				/>
			</Divider>
			<Pane style={{ flex: ratios[1] }}>{center}</Pane>
			<Divider>
				<DividerHitArea
					ref={secondDividerRef}
					onPointerDown={handlePointerDown(1)}
				/>
			</Divider>
			<Pane style={{ flex: ratios[2] }}>{right}</Pane>
		</Container>
	);
};

export const SplitView = memo(SplitViewComponent);
