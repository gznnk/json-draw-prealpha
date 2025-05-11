import type { ExecuteEvent } from "../events";

/**
 * Props for executable component.
 */
export type ExecutableProps = {
	onExecute?: (e: ExecuteEvent) => void;
};
