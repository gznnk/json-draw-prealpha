// Import registry
import { DiagramRegistry } from "../registry";

// Import Atlas objects
import { ConnectLineAtlas } from "../atlas/shapes/ConnectLineAtlas";
import { ConnectPointAtlas } from "../atlas/shapes/ConnectPointAtlas";
import { EllipseAtlas } from "../atlas/shapes/EllipseAtlas";
import { GroupAtlas } from "../atlas/shapes/GroupAtlas";
import { ImageAtlas } from "../atlas/shapes/ImageAtlas";
import { PathAtlas } from "../atlas/shapes/PathAtlas";
import { PathPointAtlas } from "../atlas/shapes/PathPointAtlas";
import { RectangleAtlas } from "../atlas/shapes/RectangleAtlas";
import { SvgAtlas } from "../atlas/shapes/SvgAtlas";
import { TextAtlas } from "../atlas/shapes/TextAtlas";

// Import Diagram Atlas objects
import { ButtonAtlas } from "../atlas/diagrams/ButtonAtlas";

// Import Node Atlas objects
import { AgentNodeAtlas } from "../atlas/nodes/AgentNodeAtlas";
import { HubNodeAtlas } from "../atlas/nodes/HubNodeAtlas";
import { ImageGenNodeAtlas } from "../atlas/nodes/ImageGenNodeAtlas";
import { LLMNodeAtlas } from "../atlas/nodes/LLMNodeAtlas";
import { PageDesignNodeAtlas } from "../atlas/nodes/PageDesignNodeAtlas";
import { SvgToDiagramNodeAtlas } from "../atlas/nodes/SvgToDiagramNodeAtlas";
import { TextAreaNodeAtlas } from "../atlas/nodes/TextAreaNodeAtlas";
import { VectorStoreNodeAtlas } from "../atlas/nodes/VectorStoreNodeAtlas";
import { WebSearchNodeAtlas } from "../atlas/nodes/WebSearchNodeAtlas";

/**
 * Initialize all diagram registrations for the SvgCanvas.
 * This function must be called before using any diagram components.
 */
export const initializeSvgCanvasDiagrams = (): void => {
	// Clear existing registrations to avoid duplicates
	DiagramRegistry.clear();

	// ============================================================================
	// Shape Atlas Registration
	// ============================================================================
	DiagramRegistry.register(ConnectLineAtlas);
	DiagramRegistry.register(ConnectPointAtlas);
	DiagramRegistry.register(EllipseAtlas);
	DiagramRegistry.register(GroupAtlas);
	DiagramRegistry.register(ImageAtlas);
	DiagramRegistry.register(PathAtlas);
	DiagramRegistry.register(PathPointAtlas);
	DiagramRegistry.register(RectangleAtlas);
	DiagramRegistry.register(SvgAtlas);
	DiagramRegistry.register(TextAtlas);

	// ============================================================================
	// Diagram Atlas Registration
	// ============================================================================
	DiagramRegistry.register(ButtonAtlas);

	// ============================================================================
	// Node Atlas Registration
	// ============================================================================
	DiagramRegistry.register(AgentNodeAtlas);
	DiagramRegistry.register(HubNodeAtlas);
	DiagramRegistry.register(ImageGenNodeAtlas);
	DiagramRegistry.register(LLMNodeAtlas);
	DiagramRegistry.register(PageDesignNodeAtlas);
	DiagramRegistry.register(SvgToDiagramNodeAtlas);
	DiagramRegistry.register(TextAreaNodeAtlas);
	DiagramRegistry.register(VectorStoreNodeAtlas);
	DiagramRegistry.register(WebSearchNodeAtlas);
};
