// Export all plugin-related types and classes
export type { MenuPlugin } from "./MenuPlugin";
export { BaseMenuPlugin } from "./MenuPlugin";
export { WebMenuPlugin } from "./WebMenuPlugin";
export { DesktopMenuPlugin } from "./DesktopMenuPlugin";
export { MenuPluginManager } from "./MenuPluginManager";

// Convenience function to get the plugin manager instance
export const getMenuPluginManager = async () => {
	const { MenuPluginManager: PluginManager } = await import("./MenuPluginManager");
	return PluginManager.getInstance();
};