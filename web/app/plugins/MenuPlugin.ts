/**
 * Interface for menu action plugins.
 * Allows different implementations for Web and Desktop environments.
 */
export interface MenuPlugin {
	/**
	 * Handle new file creation
	 */
	onNew(): Promise<void> | void;

	/**
	 * Handle file opening
	 */
	onOpen(): Promise<void> | void;

	/**
	 * Handle file saving
	 */
	onSave(): Promise<void> | void;

	/**
	 * Handle help display
	 */
	onHelp(): Promise<void> | void;

	/**
	 * Get the plugin name for identification
	 */
	getName(): string;

	/**
	 * Check if the plugin is available in the current environment
	 */
	isAvailable(): boolean;
}

/**
 * Abstract base class for menu plugins
 */
import type { SvgCanvasData } from "../../features/svg-canvas/canvas/types/SvgCanvasData";

/**
 * Canvas data context type for plugins
 */
export type CanvasDataContext = {
	canvas: { id: string; name: string; content: SvgCanvasData } | null;
	hasUnsavedChanges: boolean;
	updateCanvas: (data: SvgCanvasData) => void;
	saveCanvas: () => Promise<void>;
	loadCanvas: (id: string) => Promise<void>;
	createNewCanvas: (name?: string) => void;
	exportCanvasData: () => string;
	importCanvasData: (jsonData: string) => Promise<void>;
	getCurrentFileName: () => string;
};

export abstract class BaseMenuPlugin implements MenuPlugin {
	protected canvasDataContext: CanvasDataContext | null = null;

	abstract onNew(): Promise<void> | void;
	abstract onOpen(): Promise<void> | void;
	abstract onSave(): Promise<void> | void;
	abstract onHelp(): Promise<void> | void;
	abstract getName(): string;
	abstract isAvailable(): boolean;

	/**
	 * Set canvas data context for the plugin
	 */
	public setCanvasDataContext(context: CanvasDataContext): void {
		this.canvasDataContext = context;
	}

	/**
	 * Show a notification to the user
	 */
	protected showNotification(message: string, type: "info" | "success" | "warning" | "error" = "info"): void {
		// Default implementation using console
		console.log(`[${type.toUpperCase()}] ${message}`);
	}
}