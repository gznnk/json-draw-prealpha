/**
 * Decompose an SVG/DOM affine matrix into translation (tx, ty),
 * scales (sx, sy), and rotation (theta in radians).
 *
 * - Works even if skew is present; sy keeps its sign (reflection allowed).
 * - If the first column is degenerate (sx === 0), falls back to the second.
 */
export type DecomposedTransform = {
	tx: number;
	ty: number;
	sx: number;
	sy: number;
	theta: number; // radians
};

export const decomposeMatrix = (
	m: DOMMatrix | DOMMatrixReadOnly,
): DecomposedTransform => {
	const { a, b, c, d, e, f } = m;

	const tx = e;
	const ty = f;

	// X-scale = length of the first column
	const sx = Math.hypot(a, b);

	// Degenerate first column: use the second column to infer angle/scale
	if (sx === 0) {
		const det = a * d - b * c;
		const sy = Math.hypot(c, d) * Math.sign(det || 1);
		const theta = Math.atan2(-c, d);
		return { tx, ty, sx, sy, theta };
	}

	// Rotation = angle of the first column
	const theta = Math.atan2(b, a);

	// Y-scale from determinant (keeps sign; negative => reflection included)
	const det = a * d - b * c;
	const sy = det / sx;

	return { tx, ty, sx, sy, theta };
};
