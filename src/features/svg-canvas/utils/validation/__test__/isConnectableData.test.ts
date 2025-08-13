import type { ConnectableState } from "../../../types/diagrams/shapes/ConnectableTypes";
import type { ConnectPointState } from "../../../types/diagrams/shapes/ConnectTypes";
import { isConnectableState } from "../isConnectableState";

describe("isConnectableState", () => {
	// Valid ConnectableState object for testing
	const validConnectPointState: ConnectPointState = {
		id: "point1",
		type: "Rectangle",
		x: 0,
		y: 0,
		name: "connection-point",
	};

	const validConnectableState: ConnectableState = {
		showConnectPoints: true,
		connectPoints: [validConnectPointState],
	};

	describe("Valid ConnectableState", () => {
		it("should return true for valid ConnectableState with showConnectPoints true", () => {
			expect(isConnectableState(validConnectableState)).toBe(true);
		});

		it("should return true for valid ConnectableState with showConnectPoints false", () => {
			const data: ConnectableState = {
				showConnectPoints: false,
				connectPoints: [validConnectPointState],
			};
			expect(isConnectableState(data)).toBe(true);
		});

		it("should return true for valid ConnectableState with empty connectPoints array", () => {
			const data: ConnectableState = {
				showConnectPoints: true,
				connectPoints: [],
			};
			expect(isConnectableState(data)).toBe(true);
		});

		it("should return true for valid ConnectableState with multiple connectPoints", () => {
			const data: ConnectableState = {
				showConnectPoints: true,
				connectPoints: [
					validConnectPointState,
					{
						id: "point2",
						type: "Ellipse",
						x: 10,
						y: 10,
						name: "another-point",
					},
				],
			};
			expect(isConnectableState(data)).toBe(true);
		});
	});

	describe("Invalid data types", () => {
		it("should return false for null", () => {
			expect(isConnectableState(null)).toBe(false);
		});

		it("should return false for undefined", () => {
			expect(isConnectableState(undefined)).toBe(false);
		});

		it("should return false for string", () => {
			expect(isConnectableState("not an object")).toBe(false);
		});

		it("should return false for number", () => {
			expect(isConnectableState(123)).toBe(false);
		});

		it("should return false for boolean", () => {
			expect(isConnectableState(true)).toBe(false);
		});

		it("should return false for array", () => {
			expect(isConnectableState([])).toBe(false);
		});
	});

	describe("Missing required properties", () => {
		it("should return false for object without connectPoints property", () => {
			const data = {
				showConnectPoints: true,
			};
			expect(isConnectableState(data)).toBe(false);
		});

		it("should return false for object without showConnectPoints property", () => {
			const data = {
				connectPoints: [],
			};
			expect(isConnectableState(data)).toBe(false);
		});

		it("should return false for object with connectPoints that is not an array", () => {
			const data = {
				showConnectPoints: true,
				connectPoints: "not an array",
			};
			expect(isConnectableState(data)).toBe(false);
		});

		it("should return false for object with connectPoints as null", () => {
			const data = {
				showConnectPoints: true,
				connectPoints: null,
			};
			expect(isConnectableState(data)).toBe(false);
		});

		it("should return false for object with connectPoints as undefined", () => {
			const data = {
				showConnectPoints: true,
				connectPoints: undefined,
			};
			expect(isConnectableState(data)).toBe(false);
		});

		it("should return false for object with showConnectPoints that is not a boolean", () => {
			const data = {
				showConnectPoints: "true",
				connectPoints: [],
			};
			expect(isConnectableState(data)).toBe(false);
		});

		it("should return false for object with showConnectPoints as null", () => {
			const data = {
				showConnectPoints: null,
				connectPoints: [],
			};
			expect(isConnectableState(data)).toBe(false);
		});

		it("should return false for object with showConnectPoints as undefined", () => {
			const data = {
				showConnectPoints: undefined,
				connectPoints: [],
			};
			expect(isConnectableState(data)).toBe(false);
		});
	});

	describe("Edge cases", () => {
		it("should return true for object with additional properties", () => {
			const data = {
				showConnectPoints: true,
				connectPoints: [],
				extraProperty: "should be ignored",
			};
			expect(isConnectableState(data)).toBe(true);
		});

		it("should return false for object missing showConnectPoints", () => {
			// Current implementation now checks showConnectPoints property
			const data = {
				connectPoints: [],
			};
			expect(isConnectableState(data)).toBe(false);
		});
	});

	/**
	 * Validation completeness test.
	 * This test ensures that if ConnectableState type definition changes,
	 * the validation function needs to be updated accordingly.
	 *
	 * If this test fails, it means:
	 * 1. ConnectableState type has been modified
	 * 2. isConnectableState validation function needs to be updated
	 * 3. This test suite needs to be updated to include new properties
	 */
	describe("Validation completeness", () => {
		it("should validate all required properties of ConnectableState type", () => {
			// This test creates an object that should match ConnectableState exactly
			const completeValidData: ConnectableState = {
				showConnectPoints: true,
				connectPoints: [validConnectPointState],
			} as const satisfies ConnectableState;

			// Test that our validator accepts the complete valid data
			expect(isConnectableState(completeValidData)).toBe(true);

			// Test missing each required property one by one
			// If ConnectableState gains new required properties, add tests here

			// Missing showConnectPoints - now properly validated, should fail
			const missingShowConnectPoints = {
				connectPoints: [validConnectPointState],
			};
			expect(isConnectableState(missingShowConnectPoints)).toBe(false);

			// Missing connectPoints - should fail
			const missingConnectPoints = {
				showConnectPoints: true,
			};
			expect(isConnectableState(missingConnectPoints)).toBe(false);
		});

		/**
		 * Property coverage test.
		 * This test documents which properties are currently being validated.
		 * When ConnectableState type changes, update this test to maintain coverage.
		 */
		it("should document current validation coverage", () => {
			// Current implementation validates:
			// 1. Object is not null
			// 2. Object is an object type
			// 3. Has 'showConnectPoints' property
			// 4. showConnectPoints is a boolean
			// 5. Has 'connectPoints' property
			// 6. connectPoints is an array

			// Properties NOT currently validated:
			// - connectPoints array contents/structure
			// - connectPoints array element types

			const minimalValidObject = {
				showConnectPoints: true,
				connectPoints: [], // Both properties are now validated
			};

			expect(isConnectableState(minimalValidObject)).toBe(true);

			// This test serves as documentation of current behavior
			// and will need updates when validation logic is enhanced
		});

		/**
		 * Future-proofing test.
		 * If ConnectableState type definition is extended with new required properties,
		 * this test will help identify that the validator needs updating.
		 */
		it("should handle future ConnectableState extensions", () => {
			// Create a type-safe object that satisfies current ConnectableState
			const currentValidData: ConnectableState = {
				showConnectPoints: false,
				connectPoints: [],
			};

			// This should always pass for current valid data
			expect(isConnectableState(currentValidData)).toBe(true);

			// When new required properties are added to ConnectableState:
			// 1. TypeScript will error on the above object creation
			// 2. Add the new properties to make it compile
			// 3. Update isConnectableState function to validate new properties
			// 4. Add specific tests for the new properties
		});
	});
});
