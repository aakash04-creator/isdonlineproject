/**
 * BoxCrafter 3D - Levels & Procedural Generator
 * Contains puzzle levels for Sokoban Mode, procedural track generator for Runner Mode,
 * and tower mechanics for Stacker Mode.
 */
const GAME_LEVELS = [
    {
        id: 1,
        name: "Stage 01: Neon Awakening",
        hint: "Roll with WASD/Arrows. Push the amber crate onto the red pressure plate!",
        width: 7,
        height: 7,
        playerStart: { x: 2, z: 2 },
        tiles: [
            // 7x7 grid: 1 = normal floor, 0 = void/wall
            [0, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 0]
        ],
        crates: [
            { id: 'c1', x: 3, z: 3 }
        ],
        plates: [
            { id: 'p1', x: 5, z: 3 }
        ],
        gems: [
            { id: 'g1', x: 3, z: 5 }
        ],
        lasers: []
    },
    {
        id: 2,
        name: "Stage 02: Bridge of Circuits",
        hint: "Two crates must be pushed onto the two target plates. Avoid corner traps!",
        width: 8,
        height: 7,
        playerStart: { x: 1, z: 3 },
        tiles: [
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0]
        ],
        crates: [
            { id: 'c1', x: 2, z: 2 },
            { id: 'c2', x: 2, z: 4 }
        ],
        plates: [
            { id: 'p1', x: 6, z: 2 },
            { id: 'p2', x: 6, z: 4 }
        ],
        gems: [
            { id: 'g1', x: 4, z: 1 },
            { id: 'g2', x: 4, z: 5 }
        ],
        lasers: []
    },
    {
        id: 3,
        name: "Stage 03: Laser Grid",
        hint: "A pulsing laser guards the central corridor. Time your roll or push a crate to block it!",
        width: 8,
        height: 8,
        playerStart: { x: 1, z: 1 },
        tiles: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 0, 1, 1, 0, 1, 1],
            [1, 1, 0, 1, 1, 0, 1, 1],
            [1, 1, 0, 1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ],
        crates: [
            { id: 'c1', x: 3, z: 2 },
            { id: 'c2', x: 4, z: 5 }
        ],
        plates: [
            { id: 'p1', x: 6, z: 2 },
            { id: 'p2', x: 6, z: 5 }
        ],
        gems: [
            { id: 'g1', x: 3, z: 4 }
        ],
        lasers: [
            { x1: 0.5, z1: 3.5, x2: 7.5, z2: 3.5, cycle: 3, offset: 0 }
        ]
    },
    {
        id: 4,
        name: "Stage 04: Twin Chambers",
        hint: "Navigate the narrow choke-point. Plan moves ahead to avoid trapping crates against walls.",
        width: 9,
        height: 7,
        playerStart: { x: 1, z: 2 },
        tiles: [
            [1, 1, 1, 1, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 1, 1, 1, 1],
            [0, 1, 1, 0, 0, 0, 1, 1, 0]
        ],
        crates: [
            { id: 'c1', x: 2, z: 1 },
            { id: 'c2', x: 2, z: 3 },
            { id: 'c3', x: 3, z: 2 }
        ],
        plates: [
            { id: 'p1', x: 7, z: 1 },
            { id: 'p2', x: 7, z: 2 },
            { id: 'p3', x: 7, z: 3 }
        ],
        gems: [
            { id: 'g1', x: 4, z: 2 },
            { id: 'g2', x: 6, z: 4 }
        ],
        lasers: []
    },
    {
        id: 5,
        name: "Stage 05: Quantum Matrix",
        hint: "Dual laser barriers and three crates. Coordinate your pushes carefully!",
        width: 9,
        height: 9,
        playerStart: { x: 1, z: 1 },
        tiles: [
            [0, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 0, 1, 1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 0, 1, 1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 1, 0]
        ],
        crates: [
            { id: 'c1', x: 3, z: 3 },
            { id: 'c2', x: 5, z: 3 },
            { id: 'c3', x: 4, z: 5 }
        ],
        plates: [
            { id: 'p1', x: 4, z: 1 },
            { id: 'p2', x: 2, z: 7 },
            { id: 'p3', x: 6, z: 7 }
        ],
        gems: [
            { id: 'g1', x: 4, z: 3 },
            { id: 'g2', x: 4, z: 7 }
        ],
        lasers: [
            { x1: 1.5, z1: 4.5, x2: 7.5, z2: 4.5, cycle: 4, offset: 0 }
        ]
    },
    {
        id: 6,
        name: "Stage 06: The Master Chamber",
        hint: "The ultimate challenge! Push all four power cubes to activate the central beacon.",
        width: 10,
        height: 10,
        playerStart: { x: 1, z: 1 },
        tiles: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        crates: [
            { id: 'c1', x: 3, z: 2 },
            { id: 'c2', x: 6, z: 2 },
            { id: 'c3', x: 3, z: 7 },
            { id: 'c4', x: 6, z: 7 }
        ],
        plates: [
            { id: 'p1', x: 2, z: 4 },
            { id: 'p2', x: 7, z: 4 },
            { id: 'p3', x: 4, z: 8 },
            { id: 'p4', x: 5, z: 8 }
        ],
        gems: [
            { id: 'g1', x: 4, z: 4 },
            { id: 'g2', x: 5, z: 4 },
            { id: 'g3', x: 4, z: 5 },
            { id: 'g4', x: 5, z: 5 }
        ],
        lasers: [
            { x1: 1.5, z1: 3.5, x2: 8.5, z2: 3.5, cycle: 3, offset: 0 },
            { x1: 1.5, z1: 6.5, x2: 8.5, z2: 6.5, cycle: 3, offset: 1.5 }
        ]
    }
];

window.GAME_LEVELS = GAME_LEVELS;
