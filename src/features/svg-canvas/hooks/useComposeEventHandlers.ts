import { useCallback, useMemo, useRef } from "react";

/**
 * Composes multiple event handlers into a single handler using useCallback for memoization.
 * Each handler will be called in the order they are provided.
 * The memoization is based on the individual function references, not the array reference.
 *
 * @param listeners - Array of event handler functions to compose
 * @returns Memoized composed event handler function
 */
export const useComposeEventHandlers = <T>(
	listeners: Array<(event: T) => void>,
): ((event: T) => void) => {
	const prevListenersRef = useRef<Array<(event: T) => void>>([]);
	const memoizedListenersRef = useRef<Array<(event: T) => void>>([]);

	// Check if individual function references have changed
	const memoizedListeners = useMemo(() => {
		const prev = prevListenersRef.current;

		// Check if length or individual references changed
		let hasChanged = prev.length !== listeners.length;
		if (!hasChanged) {
			for (let i = 0; i < listeners.length; i++) {
				if (prev[i] !== listeners[i]) {
					hasChanged = true;
					break;
				}
			}
		}

		if (hasChanged) {
			const validListeners = [];
			for (const listener of listeners) {
				if (listener) {
					validListeners.push(listener);
				}
			}
			memoizedListenersRef.current = validListeners;
			prevListenersRef.current = [...listeners];
		}

		return memoizedListenersRef.current;
	}, [listeners]);

	return useCallback(
		(event: T) => {
			for (const listener of memoizedListeners) {
				listener(event);
			}
		},
		[memoizedListeners],
	);
};
