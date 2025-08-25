import type { Bounds } from "../../../types/core/Bounds";
import type { Diagram } from "../../../types/state/catalog/Diagram";
import type { ItemableState } from "../../../types/state/core/ItemableState";
import type { Shape } from "../../../types/core/Shape";
import { calcItemableOrientedBox } from "../calcItemableOrientedBox";

describe("calcItemableOrientedBox", () => {
	// Mock shape state for testing
	const createMockShape = (
		x: number,
		y: number,
		width: number,
		height: number,
		rotation = 0,
		items: Diagram[] = [],
	): ItemableState<Diagram> =>
		({
			id: "test-shape",
			type: "Group",
			x,
			y,
			width,
			height,
			rotation,
			scaleX: 1,
			scaleY: 1,
			itemableType: "abstract",
			items,
		}) as Shape & ItemableState<Diagram>;

	// Mock point state for testing
	const createMockPoint = (
		x: number,
		y: number,
		items: Diagram[] = [],
	): ItemableState<Diagram> =>
		({
			id: "test-point",
			type: "Group",
			x,
			y,
			itemableType: "abstract",
			items,
			name: "Test Point",
		}) as ItemableState<Diagram>;

	describe("Valid input cases", () => {
		describe("Shape with no rotation and no items", () => {
			it("should calculate correct bounds for shape at origin", () => {
				const shape = createMockShape(0, 0, 100, 50);
				const result = calcItemableOrientedBox(shape);

				expect(result).toEqual<Bounds>({
					x: 0,
					y: 0,
					width: 100,
					height: 50,
				});
			});

			it("should calculate correct bounds for shape at positive coordinates", () => {
				const shape = createMockShape(100, 200, 80, 60);
				const result = calcItemableOrientedBox(shape);

				expect(result).toEqual<Bounds>({
					x: 100,
					y: 200,
					width: 80,
					height: 60,
				});
			});

			it("should calculate correct bounds for shape at negative coordinates", () => {
				const shape = createMockShape(-50, -30, 40, 20);
				const result = calcItemableOrientedBox(shape);

				expect(result).toEqual<Bounds>({
					x: -50,
					y: -30,
					width: 40,
					height: 20,
				});
			});
		});

		describe("Point with no items", () => {
			it("should calculate correct bounds for point at origin", () => {
				const point = createMockPoint(0, 0);
				const result = calcItemableOrientedBox(point);

				expect(result).toEqual<Bounds>({
					x: 0,
					y: 0,
					width: 0,
					height: 0,
				});
			});

			it("should calculate correct bounds for point at positive coordinates", () => {
				const point = createMockPoint(150, 75);
				const result = calcItemableOrientedBox(point);

				expect(result).toEqual<Bounds>({
					x: 150,
					y: 75,
					width: 0,
					height: 0,
				});
			});

			it("should calculate correct bounds for point at negative coordinates", () => {
				const point = createMockPoint(-25, -40);
				const result = calcItemableOrientedBox(point);

				expect(result).toEqual<Bounds>({
					x: -25,
					y: -40,
					width: 0,
					height: 0,
				});
			});
		});

		describe("Shape with rotation and no items", () => {
			it("should calculate correct bounds for 90 degree rotated square", () => {
				const shape = createMockShape(0, 0, 100, 100, 90);
				const result = calcItemableOrientedBox(shape);

				// For a square, rotation shouldn't change the center or dimensions
				expect(result.x).toBeCloseTo(0, 10);
				expect(result.y).toBeCloseTo(0, 10);
				expect(result.width).toBe(100);
				expect(result.height).toBe(100);
			});

			it("should calculate correct bounds for 45 degree rotated rectangle", () => {
				const shape = createMockShape(0, 0, 100, 50, 45);
				const result = calcItemableOrientedBox(shape);

				// The center should remain at origin
				expect(result.x).toBeCloseTo(0, 10);
				expect(result.y).toBeCloseTo(0, 10);
				// Dimensions remain the same (original width/height)
				expect(result.width).toBe(100);
				expect(result.height).toBe(50);
			});

			it("should calculate correct bounds for 180 degree rotated rectangle", () => {
				const shape = createMockShape(50, 25, 80, 40, 180);
				const result = calcItemableOrientedBox(shape);

				expect(result.x).toBeCloseTo(50, 10);
				expect(result.y).toBeCloseTo(25, 10);
				expect(result.width).toBe(80);
				expect(result.height).toBe(40);
			});
		});
	});

	describe("Edge cases", () => {
		it("should handle shape with zero width", () => {
			const shape = createMockShape(0, 0, 0, 100);
			const result = calcItemableOrientedBox(shape);

			expect(result).toEqual<Bounds>({
				x: 0,
				y: 0,
				width: 0,
				height: 100,
			});
		});

		it("should handle shape with zero height", () => {
			const shape = createMockShape(0, 0, 100, 0);
			const result = calcItemableOrientedBox(shape);

			expect(result).toEqual<Bounds>({
				x: 0,
				y: 0,
				width: 100,
				height: 0,
			});
		});

		it("should handle shape with zero width and height", () => {
			const shape = createMockShape(50, 25, 0, 0);
			const result = calcItemableOrientedBox(shape);

			expect(result).toEqual<Bounds>({
				x: 50,
				y: 25,
				width: 0,
				height: 0,
			});
		});

		it("should handle very small dimensions", () => {
			const shape = createMockShape(0, 0, 0.1, 0.1);
			const result = calcItemableOrientedBox(shape);

			expect(result.x).toBeCloseTo(0, 10);
			expect(result.y).toBeCloseTo(0, 10);
			expect(result.width).toBeCloseTo(0.1, 10);
			expect(result.height).toBeCloseTo(0.1, 10);
		});

		it("should handle very large dimensions", () => {
			const shape = createMockShape(0, 0, 10000, 5000);
			const result = calcItemableOrientedBox(shape);

			expect(result).toEqual<Bounds>({
				x: 0,
				y: 0,
				width: 10000,
				height: 5000,
			});
		});

		it("should handle 360 degree rotation (equivalent to 0)", () => {
			const shape = createMockShape(0, 0, 100, 50, 360);
			const result = calcItemableOrientedBox(shape);

			expect(result.x).toBeCloseTo(0, 10);
			expect(result.y).toBeCloseTo(0, 10);
			expect(result.width).toBe(100);
			expect(result.height).toBe(50);
		});

		it("should handle negative rotation", () => {
			const shape = createMockShape(0, 0, 100, 50, -90);
			const result = calcItemableOrientedBox(shape);

			expect(result.x).toBeCloseTo(0, 10);
			expect(result.y).toBeCloseTo(0, 10);
			expect(result.width).toBe(100);
			expect(result.height).toBe(50);
		});
	});

	describe("Invalid input cases", () => {
		it("should throw error for non-point itemable", () => {
			const invalidItemable = {
				id: "invalid",
				type: "Invalid",
				// Missing x, y properties that would make it a point
			} as unknown as ItemableState<Diagram>;

			expect(() => calcItemableOrientedBox(invalidItemable)).toThrow(
				"Unsupported itemable state",
			);
		});
	});

	describe("Shapes with items (groups)", () => {
		it("should calculate bounds for group with single rectangle item", () => {
			// Create a rectangle item at (50, 30) with 40x20 dimensions
			const mockItems: Diagram[] = [createMockShape(50, 30, 40, 20) as Diagram];

			// Group center at origin
			const shape = createMockShape(0, 0, 100, 100, 0, mockItems);
			const result = calcItemableOrientedBox(shape);

			// Rectangle at (50,30) with 40x20 dimensions should return its bounds
			expect(result.x).toBeCloseTo(50, 5);
			expect(result.y).toBeCloseTo(30, 5);
			expect(result.width).toBe(40);
			expect(result.height).toBe(20);
		});

		it("should calculate bounds for group with multiple rectangle items", () => {
			const mockItems: Diagram[] = [
				createMockShape(0, 0, 20, 20) as Diagram, // bounds: left=-10, right=10, top=-10, bottom=10
				createMockShape(50, 50, 20, 20) as Diagram, // bounds: left=40, right=60, top=40, bottom=60
				createMockShape(-30, -30, 20, 20) as Diagram, // bounds: left=-40, right=-20, top=-40, bottom=-20
			];

			const shape = createMockShape(0, 0, 100, 100, 0, mockItems);
			const result = calcItemableOrientedBox(shape);

			// Combined bounds: left=-40, right=60, top=-40, bottom=60
			// So width=100, height=100, center at (10, 10)
			expect(result.x).toBeCloseTo(10, 5);
			expect(result.y).toBeCloseTo(10, 5);
			expect(result.width).toBe(100);
			expect(result.height).toBe(100);
		});

		it("should handle rotated group with items", () => {
			const mockItems: Diagram[] = [createMockShape(20, 0, 40, 20) as Diagram];

			// 90-degree rotated group
			const shape = createMockShape(0, 0, 100, 100, 90, mockItems);
			const result = calcItemableOrientedBox(shape);

			// With 90 degree rotation, dimensions and position are affected by the rotation
			expect(result.x).toBeCloseTo(20, 5);
			expect(result.y).toBeCloseTo(0, 5);
			expect(result.width).toBeCloseTo(20, 5);
			expect(result.height).toBeCloseTo(40, 5);
		});

		it("should handle group with nested groups", () => {
			// Create nested structure: group containing another group
			const nestedItems: Diagram[] = [
				createMockShape(10, 10, 20, 20) as Diagram,
			];
			const nestedGroup = createMockShape(
				25,
				25,
				50,
				50,
				0,
				nestedItems,
			) as Diagram;

			const mainItems: Diagram[] = [
				nestedGroup,
				createMockShape(-25, -25, 30, 30) as Diagram,
			];

			const shape = createMockShape(0, 0, 100, 100, 0, mainItems);
			const result = calcItemableOrientedBox(shape);

			// Should calculate bounds that encompass both the nested group and the standalone item
			expect(result.x).toBeCloseTo(-10, 5);
			expect(result.y).toBeCloseTo(-10, 5);
			expect(result.width).toBeCloseTo(60, 5);
			expect(result.height).toBeCloseTo(60, 5);
		});

		it("should handle group with horizontally aligned items", () => {
			const mockItems: Diagram[] = [
				createMockShape(-20, 0, 20, 10) as Diagram, // bounds: left=-30, right=-10, top=-5, bottom=5
				createMockShape(20, 0, 20, 10) as Diagram, // bounds: left=10, right=30, top=-5, bottom=5
			];

			const shape = createMockShape(0, 0, 100, 50, 0, mockItems);
			const result = calcItemableOrientedBox(shape);

			// Combined bounds: left=-30, right=30, top=-5, bottom=5
			// So width=60, height=10, center at (0, 0)
			expect(result.x).toBeCloseTo(0, 5);
			expect(result.y).toBeCloseTo(0, 5);
			expect(result.width).toBe(60);
			expect(result.height).toBe(10);
		});

		it("should handle group with vertically aligned items", () => {
			const mockItems: Diagram[] = [
				createMockShape(0, -20, 10, 20) as Diagram, // bounds: left=-5, right=5, top=-30, bottom=-10
				createMockShape(0, 20, 10, 20) as Diagram, // bounds: left=-5, right=5, top=10, bottom=30
			];

			const shape = createMockShape(0, 0, 50, 100, 0, mockItems);
			const result = calcItemableOrientedBox(shape);

			// Combined bounds: left=-5, right=5, top=-30, bottom=30
			// So width=10, height=60, center at (0, 0)
			expect(result.x).toBeCloseTo(0, 5);
			expect(result.y).toBeCloseTo(0, 5);
			expect(result.width).toBe(10);
			expect(result.height).toBe(60);
		});

		it("should handle empty items array", () => {
			const shape = createMockShape(50, 25, 80, 40, 0, []);
			const result = calcItemableOrientedBox(shape);

			// Should fall back to shape's own dimensions when items array is empty
			expect(result).toEqual({
				x: 50,
				y: 25,
				width: 80,
				height: 40,
			});
		});

		it("should handle complex rotated group with mixed rotations", () => {
			// Create child items with different rotations
			const mockItems: Diagram[] = [
				createMockShape(20, 10, 30, 20, 0) as Diagram, // Child 1: no rotation (0°)
				createMockShape(-15, -5, 25, 15, 45) as Diagram, // Child 2: 45° rotation
			];

			// Parent group rotated 45 degrees
			const shape = createMockShape(0, 0, 100, 80, 45, mockItems);
			const result = calcItemableOrientedBox(shape);

			// Complex scenario: parent rotation + child rotations
			// The function calculates bounds considering both parent and child transformations
			expect(result.x).toBeCloseTo(7.93, 2);
			expect(result.y).toBeCloseTo(0.73, 2);
			expect(result.width).toBeCloseTo(65.53, 2);
			expect(result.height).toBeCloseTo(39.32, 2);
		});
	});

	describe("Type compatibility", () => {
		it("should accept ItemableState<Diagram> and return Bounds", () => {
			const shape = createMockShape(0, 0, 100, 50);
			const result: Bounds = calcItemableOrientedBox(shape);

			expect(result).toBeDefined();
			expect(typeof result.x).toBe("number");
			expect(typeof result.y).toBe("number");
			expect(typeof result.width).toBe("number");
			expect(typeof result.height).toBe("number");
		});
	});

	describe("Mathematical precision", () => {
		it("should handle floating point coordinates", () => {
			const shape = createMockShape(1.5, 2.7, 10.3, 5.9);
			const result = calcItemableOrientedBox(shape);

			expect(result.x).toBeCloseTo(1.5, 10);
			expect(result.y).toBeCloseTo(2.7, 10);
			expect(result.width).toBeCloseTo(10.3, 10);
			expect(result.height).toBeCloseTo(5.9, 10);
		});

		it("should handle rotation with floating point angles", () => {
			const shape = createMockShape(0, 0, 100, 50, 22.5);
			const result = calcItemableOrientedBox(shape);

			// Center should remain the same
			expect(result.x).toBeCloseTo(0, 10);
			expect(result.y).toBeCloseTo(0, 10);
			// Dimensions should remain unchanged
			expect(result.width).toBe(100);
			expect(result.height).toBe(50);
		});
	});
});
