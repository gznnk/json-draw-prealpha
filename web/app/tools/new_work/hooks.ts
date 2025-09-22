/**
 * Custom hook to listen for events from the new_work tool
 */
import { useEffect, useMemo } from "react";

import { NEW_WORK_EVENT } from "./constants";
import { EventBus } from "../../../shared/event-bus/EventBus";
import type { Work } from "../../models/Work";

/**
 * useTool hook - listens for new_work events and executes the callback
 *
 * @param callback - Callback invoked when a new_work event occurs
 * @returns EventBus instance used to dispatch new_work events
 */
export const useTool = (callback: (work: Work) => Promise<void>): EventBus => {
	// Memoize EventBus instance
	const eventBus = useMemo(() => new EventBus(), []);

	useEffect(() => {
		// Define event listener
		const handleNewWork = (event: CustomEvent) => {
			const workData = event.detail as Work;
			// Execute the provided callback
			callback(workData).catch((error) => {
				console.error("Error in new_work callback:", error);
			});
		};

		// Register listener with the EventBus
		eventBus.addEventListener(NEW_WORK_EVENT, handleNewWork);

		// Cleanup function
		return () => {
			eventBus.removeEventListener(NEW_WORK_EVENT, handleNewWork);
		};
	}, [callback, eventBus]);

	// Return EventBus instance
	return eventBus;
};
