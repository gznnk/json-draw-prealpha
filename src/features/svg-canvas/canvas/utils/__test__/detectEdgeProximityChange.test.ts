import { detectEdgeProximityChange } from "../detectEdgeProximityChange";
import type { EdgeProximityResult } from "../detectEdgeProximity";
import type { ScrollDirection } from "../detectEdgeProximityChange";

describe("detectEdgeProximityChange", () => {
  it("should return false when direction has not changed", () => {
    const prev: ScrollDirection = { horizontal: "left", vertical: "top" };
    const curr: EdgeProximityResult = {
      isNearEdge: true,
      horizontal: "left",
      vertical: "top",
    };
    expect(detectEdgeProximityChange(prev, curr)).toBe(false);
  });

  it("should return true when horizontal changes", () => {
    const prev: ScrollDirection = { horizontal: "left", vertical: null };
    const curr: EdgeProximityResult = {
      isNearEdge: true,
      horizontal: "right",
      vertical: null,
    };
    expect(detectEdgeProximityChange(prev, curr)).toBe(true);
  });

  it("should return true when vertical changes", () => {
    const prev: ScrollDirection = { horizontal: null, vertical: "top" };
    const curr: EdgeProximityResult = {
      isNearEdge: true,
      horizontal: null,
      vertical: "bottom",
    };
    expect(detectEdgeProximityChange(prev, curr)).toBe(true);
  });

  it("should return true when both directions change", () => {
    const prev: ScrollDirection = { horizontal: "left", vertical: "top" };
    const curr: EdgeProximityResult = {
      isNearEdge: true,
      horizontal: "right",
      vertical: "bottom",
    };
    expect(detectEdgeProximityChange(prev, curr)).toBe(true);
  });
});
