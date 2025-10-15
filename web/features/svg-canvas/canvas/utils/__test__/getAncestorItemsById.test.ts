import type { DiagramType } from "../../../types/core/DiagramType";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { GroupState } from "../../../types/state/shapes/GroupState";
import { InteractionState } from "../../types/InteractionState";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import { getAncestorItemsById } from "../getAncestorItemsById";

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
const createMockGroup = (id: string, items: Diagram[]): GroupState => ({
	id,
	type: "Group",
	x: 100,
	y: 100,
	width: 200,
	height: 200,
	rotation: 0,
	scaleX: 1,
	scaleY: 1,
	keepProportion: false,
	rotateEnabled: true,
	inversionEnabled: true,
	isSelected: false,
	showTransformControls: false,
	showOutline: false,
	isTransforming: false,
	itemableType: "group",
	items,
});

/**
 * Create a mock canvas state for testing
 * @param items - The items in the canvas
 * @returns Mock canvas state
 */
const createMockCanvasState = (items: Diagram[] = []): SvgCanvasState => ({
	id: "test-canvas",
	minX: 0,
	minY: 0,
	zoom: 1,
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
	interactionState: InteractionState.Idle,
	suppressContextMenu: false,
	areaSelectionState: {
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0,
	},
	items,
});

describe("getAncestorItemsById", () => {
	it("should return empty array when item is at root level", () => {
		const targetItem = createMockDiagram("item1");
		const canvasState = createMockCanvasState([
			targetItem,
			createMockDiagram("item2"),
		]);

		const result = getAncestorItemsById(targetItem.id, canvasState);

		expect(result).toEqual([]);
	});
	it("should return single ancestor when item is in one group", () => {
		const targetItem = createMockDiagram("item1");
		const group1 = createMockGroup("group1", [targetItem]);
		const canvasState = createMockCanvasState([
			group1,
			createMockDiagram("item2"),
		]);

		const result = getAncestorItemsById(targetItem.id, canvasState);

		expect(result).toEqual([group1]);
	});
	it("should return multiple ancestors in correct order when item is nested", () => {
		const targetItem = createMockDiagram("item1");
		const innerGroup = createMockGroup("innerGroup", [targetItem]);
		const outerGroup = createMockGroup("outerGroup", [innerGroup]);
		const canvasState = createMockCanvasState([
			outerGroup,
			createMockDiagram("item2"),
		]);

		const result = getAncestorItemsById(targetItem.id, canvasState);

		expect(result).toEqual([outerGroup, innerGroup]);
	});
	it("should return empty array when item is not found", () => {
		const targetItem = createMockDiagram("nonExistentItem");
		const group1 = createMockGroup("group1", [createMockDiagram("item1")]);
		const canvasState = createMockCanvasState([
			group1,
			createMockDiagram("item2"),
		]);

		const result = getAncestorItemsById(targetItem.id, canvasState);

		expect(result).toEqual([]);
	});
	it("should handle deeply nested structure", () => {
		const targetItem = createMockDiagram("deepItem");
		const level3Group = createMockGroup("level3", [targetItem]);
		const level2Group = createMockGroup("level2", [level3Group]);
		const level1Group = createMockGroup("level1", [level2Group]);
		const canvasState = createMockCanvasState([
			level1Group,
			createMockDiagram("rootItem"),
		]);

		const result = getAncestorItemsById(targetItem.id, canvasState);

		expect(result).toEqual([level1Group, level2Group, level3Group]);
	});

	it("should handle multiple groups with same nested item", () => {
		const targetItem = createMockDiagram("item1");
		const group1 = createMockGroup("group1", [targetItem]);
		const group2 = createMockGroup("group2", [createMockDiagram("item2")]);
		const canvasState = createMockCanvasState([group1, group2]);

		const result = getAncestorItemsById(targetItem.id, canvasState);

		expect(result).toEqual([group1]);
	});

	it("should handle empty canvas", () => {
		const targetItem = createMockDiagram("item1");
		const canvasState = createMockCanvasState([]);

		const result = getAncestorItemsById(targetItem.id, canvasState);

		expect(result).toEqual([]);
	});
	it("should handle group with mixed items", () => {
		const targetItem = createMockDiagram("targetItem");
		const siblingItem = createMockDiagram("siblingItem");
		const parentGroup = createMockGroup("parentGroup", [
			siblingItem,
			targetItem,
		]);
		const canvasState = createMockCanvasState([
			parentGroup,
			createMockDiagram("rootItem"),
		]);

		const result = getAncestorItemsById(targetItem.id, canvasState);

		expect(result).toEqual([parentGroup]);
	});

	it("should handle complex nested structure with multiple branches", () => {
		const targetItem = createMockDiagram("target");
		const targetGroup = createMockGroup("targetGroup", [targetItem]);
		const siblingGroup = createMockGroup("siblingGroup", [
			createMockDiagram("sibling"),
		]);
		const parentGroup = createMockGroup("parentGroup", [
			targetGroup,
			siblingGroup,
		]);
		const canvasState = createMockCanvasState([
			parentGroup,
			createMockDiagram("rootItem"),
		]);

		const result = getAncestorItemsById(targetItem.id, canvasState);

		expect(result).toEqual([parentGroup, targetGroup]);
	});

	it("should handle item in group alongside other groups", () => {
		const targetItem = createMockDiagram("target");
		const emptyGroup = createMockGroup("emptyGroup", []);
		const targetGroup = createMockGroup("targetGroup", [
			targetItem,
			createMockDiagram("sibling"),
		]);
		const canvasState = createMockCanvasState([
			emptyGroup,
			targetGroup,
			createMockDiagram("rootItem"),
		]);

		const result = getAncestorItemsById(targetItem.id, canvasState);

		expect(result).toEqual([targetGroup]);
	});
	it("should find all groups when item appears in multiple groups", () => {
		// Note: This is an edge case - items shouldn't normally appear in multiple groups
		const targetItem = createMockDiagram("duplicateItem");
		const firstGroup = createMockGroup("firstGroup", [targetItem]);
		const secondGroup = createMockGroup("secondGroup", [targetItem]);
		const canvasState = createMockCanvasState([firstGroup, secondGroup]);

		const result = getAncestorItemsById(targetItem.id, canvasState);

		// Should find all groups that contain the item
		expect(result).toEqual([firstGroup, secondGroup]);
	});
});
