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
export let defaultConfig = {
    "1": {
        "subShape": "Square",
        "connection": "atEnd",
        "rotationType": "relative",
        "angle": {
            "min": 0,
            "max": 360
        },
        "amount": {
            "min": 0,
            "max": 3
        },
        "size": {
            "min": 0,
            "max": 100
        },
        "distort": {
            "min": 0,
            "max": 100
        }
    },
    "2": {
        "subShape": "Triangle",
        "connection": "Along",
        "rotationType": "absolute",
        "angle": {
            "min": 0,
            "max": 360
        },
        "amount": {
            "min": 1,
            "max": 2
        },
        "size": {
            "min": 20,
            "max": 80
        },
        "distort": {
            "min": 5,
            "max": 50
        }
    },
    "3": {
        "subShape": "Circle",
        "connection": "atEnd",
        "rotationType": "absolute",
        "angle": {
            "min": 0,
            "max": 360
        },
        "amount": {
            "min": 10,
            "max": 10
        },
        "size": {
            "min": 10,
            "max": 30
        },
        "distort": {
            "min": 0,
            "max": 5
        }
    },
    "missArea": 1,
    "numberOfLines": {min: 5, max: 5}, // Using more lines
    "smoothAmount": 6,
    "lineWidth": {min: 15, max: 15},
    "lineType": "straight", // Set to both to test that functionality
    "lineComposition": "Random",
    "points": [
        { "x": 225.5, "y": 290 },    // Point 0
        { "x": 252.5, "y": 506 },    // Point 1
        { "x": 540.5, "y": 317 },    // Point 2
        { "x": 525.5, "y": 569 },    // Point 3
        { "x": 100.0, "y": 350 },    // Point 4 (new)
        { "x": 400.0, "y": 120 },    // Point 5 (new)
        { "x": 450.0, "y": 400 },    // Point 6 (new)
        { "x": 150.0, "y": 150 },    // Point 7 (new)
        { "x": 350.0, "y": 250 },    // Point 8 (new)
        { "x": 300.0, "y": 400 },    // Point 9 (new)
        { "x": 200.0, "y": 200 },    // Point 10 (new)
        { "x": 480.0, "y": 220 },    // Point 11 (new)
        { "x": 175.0, "y": 450 },    // Point 12 (new)
        { "x": 425.0, "y": 500 },    // Point 13 (new)
        { "x": 75.0,  "y": 250 }     // Point 14 (new)
    ],
    "lines": [
        // Original lines
        {
            "start": { "x": 225.5, "y": 290 },
            "end": { "x": 252.5, "y": 506 }
        },
        {
            "start": { "x": 225.5, "y": 290 },
            "end": { "x": 540.5, "y": 317 }
        },
        {
            "start": { "x": 252.5, "y": 506 },
            "end": { "x": 540.5, "y": 317 }
        },
        {
            "start": { "x": 225.5, "y": 290 },
            "end": { "x": 525.5, "y": 569 }
        },
        {
            "start": { "x": 252.5, "y": 506 },
            "end": { "x": 525.5, "y": 569 }
        },
        {
            "start": { "x": 540.5, "y": 317 },
            "end": { "x": 525.5, "y": 569 }
        },
        // New lines
        {
            "start": { "x": 100.0, "y": 350 },
            "end": { "x": 225.5, "y": 290 }
        },
        {
            "start": { "x": 100.0, "y": 350 },
            "end": { "x": 252.5, "y": 506 }
        },
        {
            "start": { "x": 400.0, "y": 120 },
            "end": { "x": 225.5, "y": 290 }
        },
        {
            "start": { "x": 400.0, "y": 120 },
            "end": { "x": 540.5, "y": 317 }
        },
        {
            "start": { "x": 450.0, "y": 400 },
            "end": { "x": 540.5, "y": 317 }
        },
        {
            "start": { "x": 450.0, "y": 400 },
            "end": { "x": 525.5, "y": 569 }
        },
        {
            "start": { "x": 150.0, "y": 150 },
            "end": { "x": 225.5, "y": 290 }
        },
        {
            "start": { "x": 150.0, "y": 150 },
            "end": { "x": 400.0, "y": 120 }
        },
        {
            "start": { "x": 350.0, "y": 250 },
            "end": { "x": 225.5, "y": 290 }
        },
        {
            "start": { "x": 350.0, "y": 250 },
            "end": { "x": 540.5, "y": 317 }
        },
        {
            "start": { "x": 350.0, "y": 250 },
            "end": { "x": 400.0, "y": 120 }
        },
        {
            "start": { "x": 150.0, "y": 150 },
            "end": { "x": 100.0, "y": 350 }
        },
        // New lines with the new points
        {
            "start": { "x": 300.0, "y": 400 },
            "end": { "x": 252.5, "y": 506 }
        },
        {
            "start": { "x": 300.0, "y": 400 },
            "end": { "x": 450.0, "y": 400 }
        },
        {
            "start": { "x": 300.0, "y": 400 },
            "end": { "x": 350.0, "y": 250 }
        },
        {
            "start": { "x": 200.0, "y": 200 },
            "end": { "x": 150.0, "y": 150 }
        },
        {
            "start": { "x": 200.0, "y": 200 },
            "end": { "x": 225.5, "y": 290 }
        },
        {
            "start": { "x": 200.0, "y": 200 },
            "end": { "x": 350.0, "y": 250 }
        },
        {
            "start": { "x": 480.0, "y": 220 },
            "end": { "x": 400.0, "y": 120 }
        },
        {
            "start": { "x": 480.0, "y": 220 },
            "end": { "x": 540.5, "y": 317 }
        },
        {
            "start": { "x": 175.0, "y": 450 },
            "end": { "x": 100.0, "y": 350 }
        },
        {
            "start": { "x": 175.0, "y": 450 },
            "end": { "x": 252.5, "y": 506 }
        },
        {
            "start": { "x": 175.0, "y": 450 },
            "end": { "x": 300.0, "y": 400 }
        },
        {
            "start": { "x": 425.0, "y": 500 },
            "end": { "x": 450.0, "y": 400 }
        },
        {
            "start": { "x": 425.0, "y": 500 },
            "end": { "x": 525.5, "y": 569 }
        },
        {
            "start": { "x": 425.0, "y": 500 },
            "end": { "x": 252.5, "y": 506 }
        },
        {
            "start": { "x": 75.0, "y": 250 },
            "end": { "x": 100.0, "y": 350 }
        },
        {
            "start": { "x": 75.0, "y": 250 },
            "end": { "x": 150.0, "y": 150 }
        }
    ]
};
export const exampleConfig ={
    "1": {
        "subShape": "Triangle",
        "connection": "atEnd",
        "rotationType": "relative",
        "angle": {
            "min": 0,
            "max": 360
        },
        "amount": {
            "min": 0,
            "max": 50
        },
        "size": {
            "min": 0,
            "max": 100
        },
        "distort": {
            "min": 0,
            "max": 100
        }
    },
    "2": {
        "subShape": "Triangle",
        "connection": "Along",
        "rotationType": "absolute",
        "angle": {
            "min": 0,
            "max": 360
        },
        "amount": {
            "min": 10,
            "max": 30
        },
        "size": {
            "min": 20,
            "max": 80
        },
        "distort": {
            "min": 5,
            "max": 50
        }
    },
    "missArea": 10,
    "numberOfLines": 15,
    "smoothAmount": 5,
    "lineWidth": {min: 30, max: 50},
    "lineType": "straight",
    "lineComposition": "Branched",
    "lines": [
        {
            "start": {
                "x": 225.5,
                "y": 290
            },
            "end": {
                "x": 252.5,
                "y": 506
            }
        },
        {
            "start": {
                "x": 225.5,
                "y": 290
            },
            "end": {
                "x": 540.5,
                "y": 317
            }
        },
        {
            "start": {
                "x": 252.5,
                "y": 506
            },
            "end": {
                "x": 540.5,
                "y": 317
            }
        },
        {
            "start": {
                "x": 225.5,
                "y": 290
            },
            "end": {
                "x": 525.5,
                "y": 569
            }
        },
        {
            "start": {
                "x": 252.5,
                "y": 506
            },
            "end": {
                "x": 525.5,
                "y": 569
            }
        },
        {
            "start": {
                "x": 540.5,
                "y": 317
            },
            "end": {
                "x": 525.5,
                "y": 569
            }
        }
    ],
    "points": [
        {
            "x": 225.5,
            "y": 290
        },
        {
            "x": 252.5,
            "y": 506
        },
        {
            "x": 540.5,
            "y": 317
        },
        {
            "x": 525.5,
            "y": 569
        }
    ]
}