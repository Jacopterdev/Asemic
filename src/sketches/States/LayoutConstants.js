export const SPACING = (() => {
    const MARGIN = 24;
    const PADDING = 8;
    const SHAPE_SCALE = 0.7;
    const GRID_SIZE = 800;
    const BUTTON_SIZE = 32;

    // Now we can use previously defined constants to compute others
    return {
        MARGIN,
        PADDING,
        SHAPE_SCALE,
        GRID_SIZE,
        BUTTON_SIZE,
        BUTTON_PADDING: PADDING / 2,
    };
})();