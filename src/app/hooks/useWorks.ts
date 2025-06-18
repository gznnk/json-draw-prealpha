import { useState, useEffect, useCallback } from "react";
import type { Work } from "../models/Work";
import { createWorkRepository } from "../repository/work/factory";
import type { WorkRepository } from "../repository/work/interface";

// Create repository instance
const workRepository: WorkRepository = createWorkRepository();

/**
 * Custom hook for managing and persisting works
 *
 * @returns Object containing the works array and operations
 */
export const useWorks = () => {
	// Manage works array state
	const [works, setWorks] = useState<Work[]>([]);

	// Load works from the repository on initial render
	useEffect(() => {
		const loadWorks = async () => {
			try {
				const loadedWorks = await workRepository.getWorks();
				setWorks(loadedWorks);
			} catch (error) {
				console.error("Failed to load works:", error);
			}
		};

		loadWorks();
	}, []);

	/**
	 * Add a new work to the works array
	 *
	 * @param newWork - Work to add
	 */
	const addWork = useCallback(
		async (newWork: Work) => {
			// Backup the current state
			const originalWorks = [...works];

			try {
				// Create a new works array
				const updatedWorks = [...works, newWork];

				// Update state
				setWorks(updatedWorks);

				// Persist using the repository
				await workRepository.saveWorks(updatedWorks);
			} catch (error) {
				console.error("Failed to add work:", error);
				// Revert to the backed up state on error
				setWorks(originalWorks);
				throw error; // Propagate error to caller
			}
		},
		[works],
	);

	/**
	 * Update the works array in bulk
	 *
	 * @param updatedWorks - Updated works array
	 */
	const updateWorks = useCallback(
		async (updatedWorks: Work[]) => {
			// Backup the current state
			const originalWorks = [...works];

			try {
				// Update state
				setWorks(updatedWorks);

				// Persist using the repository
				await workRepository.saveWorks(updatedWorks);
			} catch (error) {
				console.error("Failed to update works:", error);
				// Revert to the backed up state on error
				setWorks(originalWorks);
				throw error; // Propagate error to caller
			}
		},
		[works],
	);

	/**
	 * Remove a specific work
	 *
	 * @param workId - ID of the work to delete
	 */
	const removeWork = useCallback(
		async (workId: string) => {
			// Backup the current state
			const originalWorks = [...works];

			try {
				// Keep only works whose ID does not match
				const updatedWorks = works.filter((work) => work.id !== workId);

				// Update state
				setWorks(updatedWorks);

				// Persist using the repository
				await workRepository.saveWorks(updatedWorks);
			} catch (error) {
				console.error("Failed to remove work:", error);
				// Revert to the backed up state on error
				setWorks(originalWorks);
				throw error; // Propagate error to caller
			}
		},
		[works],
	);

	return {
		works,
		addWork,
		updateWorks,
		removeWork,
	};
};
