/**
 * @deprecated このファイルは後方互換性のためだけに存在します。新しいコードでは `src/features/svg-canvas/catalog` を使用してください。
 */

// Re-export everything from the new catalog module
export {
	DiagramComponentCatalog,
	DiagramConnectPointCalculators,
	DiagramCreateFunctions,
	DiagramExportFunctions,
} from "../catalog";
export type { Diagram, DiagramType } from "../catalog";
