import { DesktopMenuPlugin } from "./DesktopMenuPlugin";
import type { MenuPlugin } from "./MenuPlugin";
import { WebMenuPlugin } from "./WebMenuPlugin";
import type { SvgCanvasData } from "../../features/svg-canvas/canvas/types/SvgCanvasData";

// Forward declare the context type to avoid circular dependency
type CanvasDataContextType = {
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

/**
 * Plugin manager that automatically selects the appropriate menu plugin
 * based on the current environment (Web or Desktop).
 */
export class MenuPluginManager {
	private static instance: MenuPluginManager;
	private currentPlugin: MenuPlugin | null = null;
	private availablePlugins: MenuPlugin[] = [];
	private canvasDataContext: CanvasDataContextType | null = null;

	private constructor() {
		this.initializePlugins();
	}

	/**
	 * Get the singleton instance of MenuPluginManager
	 */
	public static getInstance(): MenuPluginManager {
		if (!MenuPluginManager.instance) {
			MenuPluginManager.instance = new MenuPluginManager();
		}
		return MenuPluginManager.instance;
	}

	/**
	 * Initialize and register available plugins
	 */
	private initializePlugins(): void {
		this.availablePlugins = [
			new DesktopMenuPlugin(),
			new WebMenuPlugin(), // Web as fallback
		];

		// Select the first available plugin
		this.selectPlugin();
	}

	/**
	 * Select the appropriate plugin based on environment
	 */
	private selectPlugin(): void {
		for (const plugin of this.availablePlugins) {
			if (plugin.isAvailable()) {
				this.currentPlugin = plugin;
				console.log(`MenuPluginManager: Selected plugin: ${plugin.getName()}`);
				return;
			}
		}

		console.warn("MenuPluginManager: No available plugins found");
	}

	/**
	 * Get the currently active plugin
	 */
	public getCurrentPlugin(): MenuPlugin | null {
		return this.currentPlugin;
	}

	/**
	 * Get all available plugins
	 */
	public getAvailablePlugins(): MenuPlugin[] {
		return this.availablePlugins.filter(plugin => plugin.isAvailable());
	}

	/**
	 * Manually set a specific plugin (for testing or special cases)
	 */
	public setPlugin(plugin: MenuPlugin): void {
		if (plugin.isAvailable()) {
			this.currentPlugin = plugin;
			console.log(`MenuPluginManager: Manually set plugin: ${plugin.getName()}`);
		} else {
			console.error(`MenuPluginManager: Plugin ${plugin.getName()} is not available`);
		}
	}

	/**
	 * Set the canvas data context for plugins to use
	 */
	public setCanvasDataContext(context: CanvasDataContextType): void {
		this.canvasDataContext = context;
		
		// Update plugins with the canvas context
		this.availablePlugins.forEach(plugin => {
			if ('setCanvasDataContext' in plugin && typeof (plugin as MenuPlugin & { setCanvasDataContext?: (ctx: CanvasDataContextType) => void }).setCanvasDataContext === 'function') {
				(plugin as MenuPlugin & { setCanvasDataContext: (ctx: CanvasDataContextType) => void }).setCanvasDataContext(context);
			}
		});
	}

	/**
	 * Execute new file action using current plugin
	 */
	public async onNew(): Promise<void> {
		if (this.currentPlugin) {
			if (this.canvasDataContext) {
				// Use canvas data context to create new canvas
				this.canvasDataContext.createNewCanvas();
			}
			return this.currentPlugin.onNew();
		}
		console.error("MenuPluginManager: No plugin available for onNew");
	}

	/**
	 * Execute open file action using current plugin
	 */
	public async onOpen(): Promise<void> {
		if (this.currentPlugin) {
			return this.currentPlugin.onOpen();
		}
		console.error("MenuPluginManager: No plugin available for onOpen");
	}

	/**
	 * Execute save file action using current plugin
	 */
	public async onSave(): Promise<void> {
		if (this.currentPlugin) {
			if (this.canvasDataContext) {
				// Use canvas data context to save
				await this.canvasDataContext.saveCanvas();
			}
			return this.currentPlugin.onSave();
		}
		console.error("MenuPluginManager: No plugin available for onSave");
	}

	/**
	 * Execute help action using current plugin
	 */
	public onHelp(): void {
		if (this.currentPlugin) {
			this.currentPlugin.onHelp();
		} else {
			console.error("MenuPluginManager: No plugin available for onHelp");
		}
	}

	/**
	 * Check if a plugin is currently active
	 */
	public hasActivePlugin(): boolean {
		return this.currentPlugin !== null;
	}

	/**
	 * Get information about the current environment and selected plugin
	 */
	public getEnvironmentInfo(): {
		isDesktop: boolean;
		isWeb: boolean;
		activePlugin: string | null;
		availablePlugins: string[];
	} {
		return {
			isDesktop: typeof window !== "undefined" && (window as unknown as { electronAPI?: unknown }).electronAPI !== undefined,
			isWeb: typeof window !== "undefined" && typeof document !== "undefined",
			activePlugin: this.currentPlugin?.getName() || null,
			availablePlugins: this.getAvailablePlugins().map(p => p.getName()),
		};
	}
}