import type { DiagramConnectEvent } from "../events";

/**
 * Props for connectable component.
 *
 * @property {boolean} showConnectPoints - Visibility of owned ConnectPoint components.
 *                                         When false, the connectable component must not render ConnectPoint components.
 * @property {function} onConnect        - Event handler for diagram connection.
 *                                         The connectable component must trigger this event when a connection is made.
 */
export type ConnectableProps = {
	showConnectPoints?: boolean;
	onConnect?: (e: DiagramConnectEvent) => void;
};
