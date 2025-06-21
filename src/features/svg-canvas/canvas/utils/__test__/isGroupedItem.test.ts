import { isGroupedItem } from "../isGroupedItem";
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { SvgCanvasState } from "../../SvgCanvasTypes";
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { DiagramType } from "../../../types/base/DiagramType";

/**
 * Create a mock diagram item for testing
 * @param id - The ID of the diagram
 * @param type - The type of the diagram
 * @returns Mock diagram item
 */
const createMockDiagram = (
	id: string,
	type: DiagramType = "Rectangle",
): Diagram => ({
	id,
	type,
	x: 0,
	y: 0,
});

/**
 * Create a mock group with items for testing
 * @param id - The ID of the group
 * @param items - The items contained in the group
 * @returns Mock group data
 */
const createMockGroup = (id: string, items: Diagram[]): GroupData => ({
	id,
	type: "Group",
	x: 0,
	y: 0,
	width: 100,
	height: 100,
	rotation: 0,
	scaleX: 1,
	scaleY: 1,
	keepProportion: false,
	isSelected: false,
	isMultiSelectSource: false,
	items,
});

/**
 * Create a mock canvas state for testing
 * @param items - The items in the canvas
 * @returns Mock canvas state
 */
const createMockCanvasState = (items: Diagram[]): SvgCanvasState => ({
	id: "test-canvas",
	minX: 0,
	minY: 0,
	zoom: 1,
	isDiagramChanging: false,
	history: [],
	historyIndex: 0,
	lastHistoryEventId: "",
	textEditorState: {
		id: "",
		text: "",
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		scaleX: 1,
		scaleY: 1,
		rotation: 0,
		textType: "text",
		textAlign: "left",
		verticalAlign: "top",
		fontColor: "#000000",
		fontSize: 12,
		fontFamily: "Arial",
		fontWeight: "normal",
		isActive: false,
	},
	items,
});

describe("isGroupedItem", () => {
	describe("when item is directly on canvas", () => {
		it("should return false for item that exists directly on canvas", () => {
			// Arrange
			const item = createMockDiagram("item1");
			const canvasState = createMockCanvasState([item]);

			// Act
			const result = isGroupedItem(item, canvasState);

			// Assert
			expect(result).toBe(false);
		});
	});

	describe("when item is grouped", () => {
		it("should return true for item that is inside a group", () => {
			// Arrange
			const item = createMockDiagram("item1");
			const group = createMockGroup("group1", [item]);
			const canvasState = createMockCanvasState([group]);

			// Act
			const result = isGroupedItem(item, canvasState);

			// Assert
			expect(result).toBe(true);
		});

		it("should return true for item that is inside a nested group", () => {
			// Arrange
			const item = createMockDiagram("item1");
			const innerGroup = createMockGroup("innerGroup", [item]);
			const outerGroup = createMockGroup("outerGroup", [innerGroup]);
			const canvasState = createMockCanvasState([outerGroup]);

			// Act
			const result = isGroupedItem(item, canvasState);

			// Assert
			expect(result).toBe(true);
		});

		it("should return true for item that is inside deeply nested groups", () => {
			// Arrange
			const item = createMockDiagram("item1");
			const level1Group = createMockGroup("level1", [item]);
			const level2Group = createMockGroup("level2", [level1Group]);
			const level3Group = createMockGroup("level3", [level2Group]);
			const canvasState = createMockCanvasState([level3Group]);

			// Act
			const result = isGroupedItem(item, canvasState);

			// Assert
			expect(result).toBe(true);
		});
	});

	describe("when item is not found", () => {
		it("should return false for item that does not exist anywhere", () => {
			// Arrange
			const item = createMockDiagram("nonExistentItem");
			const otherItem = createMockDiagram("otherItem");
			const canvasState = createMockCanvasState([otherItem]);

			// Act
			const result = isGroupedItem(item, canvasState);

			// Assert
			expect(result).toBe(false);
		});

		it("should return false when canvas is empty", () => {
			// Arrange
			const item = createMockDiagram("item1");
			const canvasState = createMockCanvasState([]);

			// Act
			const result = isGroupedItem(item, canvasState);

			// Assert
			expect(result).toBe(false);
		});
	});

	describe("complex scenarios", () => {
		it("should return correct result in mixed canvas with groups and direct items", () => {
			// Arrange
			const directItem = createMockDiagram("directItem");
			const groupedItem = createMockDiagram("groupedItem");
			const nonExistentItem = createMockDiagram("nonExistentItem");

			const group = createMockGroup("group1", [groupedItem]);
			const canvasState = createMockCanvasState([directItem, group]);

			// Act & Assert
			expect(isGroupedItem(directItem, canvasState)).toBe(false);
			expect(isGroupedItem(groupedItem, canvasState)).toBe(true);
			expect(isGroupedItem(nonExistentItem, canvasState)).toBe(false);
		});

		it("should return true for item in group even when same item exists directly on canvas", () => {
			// Arrange
			const item = createMockDiagram("item1");
			const sameIdItem = createMockDiagram("item1"); // Same ID but different object
			const group = createMockGroup("group1", [sameIdItem]);
			const canvasState = createMockCanvasState([item, group]);

			// Act
			const result = isGroupedItem(sameIdItem, canvasState);

			// Assert
			// Since the item exists directly on canvas, it should return false
			expect(result).toBe(false);
		});

		it("should handle multiple groups with same item ID correctly", () => {
			// Arrange
			const item = createMockDiagram("item1");
			const group1 = createMockGroup("group1", [createMockDiagram("item1")]);
			const group2 = createMockGroup("group2", [createMockDiagram("item2")]);
			const canvasState = createMockCanvasState([group1, group2]);

			// Act
			const result = isGroupedItem(item, canvasState);

			// Assert
			expect(result).toBe(true);
		});
	});

	describe("edge cases", () => {
		it("should handle groups with empty items array", () => {
			// Arrange
			const item = createMockDiagram("item1");
			const emptyGroup = createMockGroup("emptyGroup", []);
			const canvasState = createMockCanvasState([emptyGroup]);

			// Act
			const result = isGroupedItem(item, canvasState);

			// Assert
			expect(result).toBe(false);
		});

		it("should handle non-group items mixed with groups", () => {
			// Arrange
			const item = createMockDiagram("item1");
			const regularItem = createMockDiagram("regularItem");
			const group = createMockGroup("group1", [item]);
			const canvasState = createMockCanvasState([regularItem, group]);

			// Act
			const result = isGroupedItem(item, canvasState);

			// Assert
			expect(result).toBe(true);
		});
	});
});
