import { DesktopMenuPlugin } from "./DesktopMenuPlugin";
import type { MenuPlugin } from "./MenuPlugin";
import { WebMenuPlugin } from "./WebMenuPlugin";

/**
 * Plugin manager that automatically selects the appropriate menu plugin
 * based on the current environment (Web or Desktop).
 */
export class MenuPluginManager {
	private static instance: MenuPluginManager;
	private currentPlugin: MenuPlugin | null = null;
	private availablePlugins: MenuPlugin[] = [];

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
	 * Execute new file action using current plugin
	 */
	public async onNew(): Promise<void> {
		if (this.currentPlugin) {
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