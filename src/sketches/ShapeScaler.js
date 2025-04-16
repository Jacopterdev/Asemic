class ShapeScaler {
    /**
     * Calculates the total scale and translated coordinates.
     *
     * @param {number} localScale - The local scaling factor.
     * @param {number} localX - The local x-coordinate.
     * @param {number} localY - The local y-coordinate.
     * @param {number} localSize - The size of the local element (e.g., cell size).
     * @param {Object} layout - The layout object containing SHAPE_SCALE.
     * @param {Function} getShapeScale - Function to retrieve the shape scale.
     * @param {Function} getShapeOffset - Function to retrieve the shape offset.
     * @returns {{ totalScale: number, newX: number, newY: number }} - An object containing the total scale and translated coordinates.
     */
    static findScale(localScale, localX, localY, localSize, layout, getShapeScale, getShapeOffset) {
        // Retrieve the shapeScale and shapeOffset using the provided functions.
        const shapeScale = getShapeScale(); // Scale based on outermost points.
        const shapeOffset = getShapeOffset(); // Offset from center.
        const spacedShapeScale = shapeScale * layout.SHAPE_SCALE;

        // Compute the total scale relative to the cell size.
        const totalScale = localScale * spacedShapeScale;

        // Calculate the translated coordinates based on scale and offset.
        const newX = localX - (1 - layout.SHAPE_SCALE) * ((shapeScale) - (1 / layout.SHAPE_SCALE)) * (localSize / 2)
            + (localSize * (1 - layout.SHAPE_SCALE) / 2)
            - (totalScale * shapeOffset.x);

        const newY = localY - (1 - layout.SHAPE_SCALE) * ((shapeScale) - (1 / layout.SHAPE_SCALE)) * (localSize / 2)
            + (localSize * (1 - layout.SHAPE_SCALE) / 2)
            - (totalScale * shapeOffset.y);

        return { totalScale, newX, newY };
    }
}

export default ShapeScaler;