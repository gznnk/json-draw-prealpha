// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { FileDropEvent } from "../types";

// Import utils.
import { newEventId } from "../utils";

/**
 * useFileDropフックの引数型定義
 */
export type UseFileDropOptions = {
	id: string;
	onFileDrop?: (e: FileDropEvent) => void;
};

/**
 * ファイルドロップイベントを処理するためのカスタムフック
 *
 * @param options - フックのオプション
 * @param options.id - 対象要素のID
 * @param options.onFileDrop - ファイルがドロップされたときに呼び出されるコールバック関数
 */
export const useFileDrop = ({ id, onFileDrop }: UseFileDropOptions) => {
	// すべての参照値をオブジェクトとしてまとめてuseRefに保持
	const refBusVal = {
		id,
		onFileDrop,
	};
	const refBus = useRef(refBusVal);
	// 参照値を最新に更新
	refBus.current = refBusVal;

	const onDragOver = useCallback<React.DragEventHandler>((event) => {
		// ドラッグされているアイテムにファイルが含まれている場合のみpreventDefaultを呼び出す
		if (event.dataTransfer.types.includes("Files")) {
			event.preventDefault();
		}
	}, []);

	const onDrop = useCallback<React.DragEventHandler>((event) => {
		// ドラッグされているアイテムにファイルが含まれている場合のみpreventDefaultを呼び出す
		if (event.dataTransfer.types.includes("Files")) {
			event.preventDefault();
			const files = event.dataTransfer.files;
			if (files && files.length > 0) {
				// refBusを介して常に最新のコールバック関数を参照
				if (refBus.current.onFileDrop) {
					refBus.current.onFileDrop({
						eventId: newEventId(),
						id: refBus.current.id,
						files,
					});
				}
			}
		}
	}, []); // 依存配列を空にして不要な再作成を防止

	return { onDragOver, onDrop };
};
