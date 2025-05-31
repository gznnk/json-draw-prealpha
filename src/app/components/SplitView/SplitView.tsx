// SplitView.tsx (Legacy wrapper for backward compatibility)
import type React from "react";
import { memo } from "react";

import { TwoColumnSplitView } from "./TwoColumnSplitView";
import { ThreeColumnSplitView } from "./ThreeColumnSplitView";

type SplitViewProps = {
	initialRatio?: number[]; // 分割比率の配列（合計1になるように調整）
	left: React.ReactNode;
	center?: React.ReactNode; // 中央のコンテンツ（オプション）
	right: React.ReactNode;
};

/**
 * @deprecated Use TwoColumnSplitView or ThreeColumnSplitView instead for better type safety and simpler implementation.
 * 分割可能なビューを提供するコンポーネント（レガシー互換性のためのラッパー）。
 * ドラッグできるディバイダーで分割比率を調整できる。
 * 2分割または3分割に対応している。
 *
 * @param initialRatio - 初期の分割比率の配列 (合計が1になるよう調整される)
 * @param left - 左側に表示するコンテンツ
 * @param center - 中央に表示するコンテンツ（指定した場合は3分割、指定しない場合は2分割）
 * @param right - 右側に表示するコンテンツ
 */
const SplitViewComponent = ({
	initialRatio = [0.2, 0.6, 0.2],
	left,
	center,
	right,
}: SplitViewProps) => {
	// centerが指定されていない場合は2分割モード
	const is2PaneMode = center === undefined;

	if (is2PaneMode) {
		// 2分割モード
		const leftRatio = initialRatio.length >= 2 ? initialRatio[0] : 0.5;
		return (
			<TwoColumnSplitView initialRatio={leftRatio} left={left} right={right} />
		);
	}

	// 3分割モード
	const ratios: [number, number, number] =
		initialRatio.length >= 3
			? [initialRatio[0], initialRatio[1], initialRatio[2]]
			: [0.2, 0.6, 0.2];

	return (
		<ThreeColumnSplitView
			initialRatio={ratios}
			left={left}
			center={center}
			right={right}
		/>
	);
};

export const SplitView = memo(SplitViewComponent);
