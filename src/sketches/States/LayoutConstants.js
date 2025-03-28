export const SPACING = (() => {
    const MARGIN = 24;
    const PADDING = 8;
    const SHAPE_SCALE = 0.65;
    const GRID_SIZE = 800;
    const BUTTON_SIZE = 32;
    const CANVAS_WIDTH = 1200;
    const CANVAS_HEIGHT = 800;

    // Now we can use previously defined constants to compute others
    return {
        MARGIN,
        PADDING,
        SHAPE_SCALE,
        GRID_SIZE,
        BUTTON_SIZE,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        BUTTON_PADDING: PADDING / 2,
        NEXT_STATE_BUTTON_X: CANVAS_WIDTH-MARGIN+PADDING/2,
        NEXT_STATE_BUTTON_Y: CANVAS_HEIGHT/2-BUTTON_SIZE/2,
    };
})();