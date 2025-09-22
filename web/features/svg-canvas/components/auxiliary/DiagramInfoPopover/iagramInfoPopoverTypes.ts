import type { Point } from "../../../types/core/Point";
import type { Diagram } from "../../../types/state/core/Diagram";

export type DiagramInfoPopoverProps = {
	display: boolean;
	diagram?: Diagram;
	position: Point;
	onNameChange: (value: string) => void;
	onDescriptionChange: (value: string) => void;
};
