import type { DiagramSelectEvent } from "../events";

/**
 * 選択可能な図形のプロパティ
 */
export type SelectableProps = {
	onSelect?: (e: DiagramSelectEvent) => void;
};
