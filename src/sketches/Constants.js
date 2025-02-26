// Constants
export const LINE_MODE = {
    RANDOM: 0,
    BRANCHING: 1,
    SEQUENTIAL: 2
};

export const LINE_TYPE = {
    STRAIGHT: 0,
    CURVED: 1,
    BOTH: 2
};

// Example config with points and connections included
export const defaultConfig = {
    // Points array with connections
    points: [
        {x: 100, y: 100, connections: [1, 3]},       // Point 0 connects to points 1 and 3
        {x: 300, y: 100, connections: [0, 2, 4]},    // Point 1 connects to points 0, 2, and 4
        {x: 500, y: 100, connections: [1, 5]},       // Point 2 connects to points 1 and 5
        {x: 100, y: 300, connections: [0, 4, 6]},    // Point 3 connects to points 0, 4, and 6
        {x: 300, y: 300, connections: [1, 3, 5, 7]}, // Point 4 connects to points 1, 3, 5, and 7
        {x: 500, y: 300, connections: [2, 4, 8]},    // Point 5 connects to points 2, 4, and 8
        {x: 100, y: 500, connections: [3, 7]},       // Point 6 connects to points 3 and 7
        {x: 300, y: 500, connections: [4, 6, 8]},    // Point 7 connects to points 4, 6, and 8
        {x: 500, y: 500, connections: [5, 7]},       // Point 8 connects to points 5 and 7
        {x: 200, y: 200, connections: [0, 1, 3, 4]}, // Point 9 connects to points 0, 1, 3, 4
        {x: 400, y: 200, connections: [1, 2, 4, 5]}, // Point 10 connects to points 1, 2, 4, 5
        {x: 200, y: 400, connections: [3, 4, 6, 7]}, // Point 11 connects to points 3, 4, 6, 7
        {x: 400, y: 400, connections: [4, 5, 7, 8]}  // Point 12 connects to points 4, 5, 7, 8
    ],
    amount: {min: 100, max: 100},
    angle: {min: 0, max: 360},
    connection: "Along",
    distort: {min: 0, max: 0},
    rotationType: "relative",
    size: {min: 10, max: 10},
    subShape: "Triangle",
    lineComposition: "Branched", // Changed default to Branched
    lineType: "straight",
    lineWidth: 80,
    missArea: 10,
    numberOfLines: 9,
    blur: 30
};

export const exampleConfig ={
    amount: {min: 100, max: 100},
    angle: {min: 0, max: 360},
    connection: "Along",
    distort: {min: 0, max: 0},
    rotationType: "relative",
    size: {min: 10, max: 10},
    subShape: "Triangle",
    missArea: 10,
    "numberOfLines": 15,
    "smoothAmount": 5,
    "lineWidth": 2,
    "lineType": "straight",
    "lineComposition": "Branched",
    "lines": [
        {
            "start": {
                "x": 407.5,
                "y": 230
            },
            "end": {
                "x": 245.5,
                "y": 326
            }
        },
        {
            "start": {
                "x": 407.5,
                "y": 230
            },
            "end": {
                "x": 511.5,
                "y": 566
            }
        },
        {
            "start": {
                "x": 407.5,
                "y": 230
            },
            "end": {
                "x": 601.5,
                "y": 322
            }
        },
        {
            "start": {
                "x": 245.5,
                "y": 326
            },
            "end": {
                "x": 601.5,
                "y": 322
            }
        },
        {
            "start": {
                "x": 511.5,
                "y": 566
            },
            "end": {
                "x": 601.5,
                "y": 322
            }
        }
    ],
    "points": [
        {
            "x": 407.5,
            "y": 230
        },
        {
            "x": 245.5,
            "y": 326
        },
        {
            "x": 511.5,
            "y": 566
        },
        {
            "x": 601.5,
            "y": 322
        }
    ]
}