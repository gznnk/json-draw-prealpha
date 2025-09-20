import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

import type { SvgCanvasData } from "../../features/svg-canvas/canvas/types/SvgCanvasData";
import type { SvgCanvas } from "../models/SvgCanvas";
import {
	createSvgCanvasRepository,
	type SvgCanvasRepository,
} from "../repository/svg-canvas";

/**
 * Canvas data context type definition
 */
type CanvasDataContextType = {
	/**
	 * Current canvas data
	 */
	canvas: SvgCanvas | null;
	
	/**
	 * Whether the canvas has unsaved changes
	 */
	hasUnsavedChanges: boolean;
	
	/**
	 * Update canvas data
	 */
	updateCanvas: (data: SvgCanvasData) => void;
	
	/**
	 * Save canvas data to storage
	 */
	saveCanvas: () => Promise<void>;
	
	/**
	 * Load canvas data from storage
	 */
	loadCanvas: (id: string) => Promise<void>;
	
	/**
	 * Create a new canvas
	 */
	createNewCanvas: (name?: string) => void;
	
	/**
	 * Export canvas data as JSON string
	 */
	exportCanvasData: () => string;
	
	/**
	 * Import canvas data from JSON string
	 */
	importCanvasData: (jsonData: string) => Promise<void>;
	
	/**
	 * Get current file name for saving
	 */
	getCurrentFileName: () => string;
};

/**
 * Canvas data context
 */
const CanvasDataContext = createContext<CanvasDataContextType | null>(null);

/**
 * Props for CanvasDataProvider
 */
type CanvasDataProviderProps = {
	children: React.ReactNode;
	/**
	 * Initial canvas ID to load
	 */
	initialCanvasId?: string;
};

/**
 * Canvas data provider component
 */
export const CanvasDataProvider = ({ 
	children, 
	initialCanvasId = "default-canvas" 
}: CanvasDataProviderProps) => {
	const [canvas, setCanvas] = useState<SvgCanvas | null>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [repository] = useState<SvgCanvasRepository>(() => createSvgCanvasRepository());

	// Load initial canvas data
	useEffect(() => {
		const loadInitialCanvas = async () => {
			try {
				const canvasData = await repository.getCanvasById(initialCanvasId);
				if (canvasData) {
					setCanvas(canvasData);
				} else {
					// Create default canvas if none exists
					const defaultCanvas: SvgCanvas = {
						id: initialCanvasId,
						name: "新しい図",
						content: {
							id: initialCanvasId,
							items: [],
							minX: 0,
							minY: 0,
							zoom: 1,
						},
					};
					setCanvas(defaultCanvas);
				}
			} catch (error) {
				console.error("Failed to load initial canvas:", error);
			}
		};

		loadInitialCanvas();
	}, [initialCanvasId, repository]);

	// Update canvas data
	const updateCanvas = useCallback((data: SvgCanvasData) => {
		if (!canvas) return;

		const updatedCanvas: SvgCanvas = {
			...canvas,
			content: data,
		};
		
		setCanvas(updatedCanvas);
		setHasUnsavedChanges(true);
	}, [canvas]);

	// Save canvas to storage
	const saveCanvas = useCallback(async () => {
		if (!canvas) {
			throw new Error("No canvas data to save");
		}

		try {
			await repository.updateCanvas(canvas);
			setHasUnsavedChanges(false);
			console.log("Canvas saved successfully");
		} catch (error) {
			console.error("Failed to save canvas:", error);
			throw error;
		}
	}, [canvas, repository]);

	// Load canvas from storage
	const loadCanvas = useCallback(async (id: string) => {
		try {
			const canvasData = await repository.getCanvasById(id);
			if (canvasData) {
				setCanvas(canvasData);
				setHasUnsavedChanges(false);
			} else {
				throw new Error(`Canvas with ID "${id}" not found`);
			}
		} catch (error) {
			console.error("Failed to load canvas:", error);
			throw error;
		}
	}, [repository]);

	// Create new canvas
	const createNewCanvas = useCallback((name: string = "新しい図") => {
		const newId = `canvas-${Date.now()}`;
		const newCanvas: SvgCanvas = {
			id: newId,
			name,
			content: {
				id: newId,
				items: [],
				minX: 0,
				minY: 0,
				zoom: 1,
			},
		};
		
		setCanvas(newCanvas);
		setHasUnsavedChanges(true);
	}, []);

	// Export canvas data as JSON
	const exportCanvasData = useCallback(() => {
		if (!canvas) {
			throw new Error("No canvas data to export");
		}

		return JSON.stringify(canvas, null, 2);
	}, [canvas]);

	// Import canvas data from JSON
	const importCanvasData = useCallback(async (jsonData: string) => {
		try {
			const importedCanvas = JSON.parse(jsonData) as SvgCanvas;
			
			// Validate imported data structure
			if (!importedCanvas.id || !importedCanvas.name || !importedCanvas.content) {
				throw new Error("Invalid canvas data format");
			}

			// Generate new ID to avoid conflicts
			const newCanvas: SvgCanvas = {
				...importedCanvas,
				id: `canvas-${Date.now()}`,
				content: {
					...importedCanvas.content,
					id: `canvas-${Date.now()}`,
				},
			};

			setCanvas(newCanvas);
			setHasUnsavedChanges(true);
		} catch (error) {
			console.error("Failed to import canvas data:", error);
			throw new Error("Invalid JSON format or canvas data structure");
		}
	}, []);

	// Get current file name for saving
	const getCurrentFileName = useCallback(() => {
		if (!canvas) return "diagram.json";
		
		// Sanitize file name
		const sanitizedName = canvas.name
			.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\-_]/g, "_")
			.substring(0, 50);
		
		return `${sanitizedName}.json`;
	}, [canvas]);

	const contextValue: CanvasDataContextType = {
		canvas,
		hasUnsavedChanges,
		updateCanvas,
		saveCanvas,
		loadCanvas,
		createNewCanvas,
		exportCanvasData,
		importCanvasData,
		getCurrentFileName,
	};

	return (
		<CanvasDataContext.Provider value={contextValue}>
			{children}
		</CanvasDataContext.Provider>
	);
};

/**
 * Hook to use canvas data context
 */
export const useCanvasData = (): CanvasDataContextType => {
	const context = useContext(CanvasDataContext);
	if (!context) {
		throw new Error("useCanvasData must be used within a CanvasDataProvider");
	}
	return context;
};