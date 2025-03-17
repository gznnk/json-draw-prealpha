import { radiansToDegrees, degreesToRadians, calcRadians } from "../Math";

test("Math radiansToDegrees", () => {
	expect(radiansToDegrees(0)).toBe(0);
	expect(radiansToDegrees(Math.PI / 2)).toBe(90);
	expect(radiansToDegrees(Math.PI)).toBe(180);
	expect(radiansToDegrees((Math.PI / 2) * 3)).toBe(270);
	expect(radiansToDegrees(Math.PI * 2)).toBe(360);
	expect(radiansToDegrees(-Math.PI / 2)).toBe(-90);
	expect(radiansToDegrees(-Math.PI)).toBe(-180);
	expect(radiansToDegrees(-(Math.PI / 2) * 3)).toBe(-270);
	expect(radiansToDegrees(-Math.PI * 2)).toBe(-360);
});

test("Math degreesToRadians", () => {
	expect(degreesToRadians(0)).toBe(0);
	expect(degreesToRadians(90)).toBe(Math.PI / 2);
	expect(degreesToRadians(180)).toBe(Math.PI);
	expect(degreesToRadians(270)).toBe((Math.PI / 2) * 3);
	expect(degreesToRadians(360)).toBe(Math.PI * 2);
	expect(degreesToRadians(-90)).toBe(-Math.PI / 2);
	expect(degreesToRadians(-180)).toBe(-Math.PI);
	expect(degreesToRadians(-270)).toBe(-(Math.PI / 2) * 3);
	expect(degreesToRadians(-360)).toBe(-Math.PI * 2);
});

test("Math calcRadian", () => {
	expect(calcRadians(0, 0, 0, -10)).toBe(degreesToRadians(0));
	expect(calcRadians(0, 0, 10, -10)).toBe(degreesToRadians(45));
	expect(calcRadians(0, 0, 10, 0)).toBe(degreesToRadians(90));
	expect(calcRadians(0, 0, 10, 10)).toBe(degreesToRadians(135));
	expect(calcRadians(0, 0, 0, 10)).toBe(degreesToRadians(180));
	expect(calcRadians(0, 0, -10, 10)).toBe(degreesToRadians(225));
	expect(calcRadians(0, 0, -10, 0)).toBe(degreesToRadians(270));
	expect(calcRadians(0, 0, -10, -10)).toBe(degreesToRadians(315));
});
