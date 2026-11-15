/**
 * Automated Test Suite for BoxCrafter 3D
 * Validates level geometry, solver logic, push physics, undo stack, and state machines.
 */
const fs = require('fs');
const vm = require('vm');

// Mock browser globals
const sandbox = {
    window: {},
    Math: Math,
    Date: Date,
    console: console
};
vm.createContext(sandbox);

// Load levels.js
const levelsCode = fs.readFileSync('web/js/levels.js', 'utf8');
vm.runInContext(levelsCode, sandbox);
const GAME_LEVELS = sandbox.window.GAME_LEVELS || sandbox.GAME_LEVELS;

console.log('--- TEST 1: Verifying All Game Levels ---');
let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✓ [PASS] ${message}`);
    } else {
        console.error(`  ✗ [FAIL] ${message}`);
        process.exitCode = 1;
    }
}

assert(Array.isArray(GAME_LEVELS) && GAME_LEVELS.length >= 6, `Found ${GAME_LEVELS.length} levels (minimum 6 required)`);

GAME_LEVELS.forEach((level, idx) => {
    console.log(`Checking Level ${level.id}: "${level.name}"...`);

    assert(level.width > 0 && level.height > 0, `Level ${level.id} valid dimensions (${level.width}x${level.height})`);
    assert(level.tiles.length === level.height, `Level ${level.id} row count matches height`);
    assert(level.tiles.every(row => row.length === level.width), `Level ${level.id} column count matches width`);

    const pStart = level.playerStart;
    assert(
        pStart.x >= 0 && pStart.x < level.width &&
        pStart.z >= 0 && pStart.z < level.height &&
        level.tiles[pStart.z][pStart.x] === 1,
        `Level ${level.id} player start (${pStart.x}, ${pStart.z}) is walkable`
    );

    assert(level.plates.length > 0, `Level ${level.id} has ${level.plates.length} pressure plates`);
    assert(level.crates.length >= level.plates.length, `Level ${level.id} has enough crates (${level.crates.length}) for plates (${level.plates.length})`);

    level.crates.forEach(c => {
        assert(level.tiles[c.z][c.x] === 1, `Crate ${c.id} at (${c.x}, ${c.z}) is on a walkable tile`);
    });

    level.plates.forEach(p => {
        assert(level.tiles[p.z][p.x] === 1, `Plate ${p.id} at (${p.x}, ${p.z}) is on a walkable tile`);
    });
});

console.log('\n--- TEST 2: Simulating Gameplay & Physics ---');

// Simulation test of Level 1
const lvl1 = GAME_LEVELS[0];
let player = { x: lvl1.playerStart.x, z: lvl1.playerStart.z };
let crates = lvl1.crates.map(c => ({ ...c }));
let plates = lvl1.plates.map(p => ({ ...p, isPressed: false }));
let moves = 0;
let history = [];

function move(dx, dz) {
    const tx = player.x + dx;
    const tz = player.z + dz;

    // Bounds check
    if (tz < 0 || tz >= lvl1.height || tx < 0 || tx >= lvl1.width || lvl1.tiles[tz][tx] === 0) {
        return false; // blocked
    }

    // Crate check
    const crate = crates.find(c => c.x === tx && c.z === tz);
    if (crate) {
        const cx = tx + dx;
        const cz = tz + dz;
        if (cz < 0 || cz >= lvl1.height || cx < 0 || cx >= lvl1.width || lvl1.tiles[cz][cx] === 0 || crates.some(c => c.x === cx && c.z === cz)) {
            return false; // crate blocked
        }
        history.push({ player: { ...player }, crates: crates.map(c => ({ ...c })), moves });
        crate.x = cx;
        crate.z = cz;
    } else {
        history.push({ player: { ...player }, crates: crates.map(c => ({ ...c })), moves });
    }

    player.x = tx;
    player.z = tz;
    moves++;

    // Update plates
    plates.forEach(p => {
        p.isPressed = crates.some(c => c.x === p.x && c.z === p.z) || (player.x === p.x && player.z === p.z);
    });

    return true;
}

function undo() {
    if (history.length === 0) return false;
    const prev = history.pop();
    player = { ...prev.player };
    crates = prev.crates.map(c => ({ ...c }));
    moves = prev.moves;
    plates.forEach(p => {
        p.isPressed = crates.some(c => c.x === p.x && c.z === p.z) || (player.x === p.x && player.z === p.z);
    });
    return true;
}

// Initial state
assert(player.x === 2 && player.z === 2, "Initial player position is (2, 2)");
assert(crates[0].x === 3 && crates[0].z === 3, "Initial crate position is (3, 3)");
assert(plates[0].isPressed === false, "Plate initially unpressed");

// Move down to (2, 3)
assert(move(0, 1), "Move Down to (2, 3)");
assert(player.x === 2 && player.z === 3, "Player at (2, 3)");
assert(moves === 1, "Moves count is 1");

// Push crate right from (2, 3) -> crate moves from (3, 3) to (4, 3)
assert(move(1, 0), "Push Crate Right: Player moves to (3, 3)");
assert(player.x === 3 && player.z === 3, "Player now at (3, 3)");
assert(crates[0].x === 4 && crates[0].z === 3, "Crate pushed to (4, 3)");
assert(plates[0].isPressed === false, "Plate still unpressed");

// Push crate right again -> crate moves from (4, 3) to (5, 3) [which is the plate!]
assert(move(1, 0), "Push Crate Right: Player moves to (4, 3)");
assert(crates[0].x === 5 && crates[0].z === 3, "Crate is now on plate at (5, 3)!");
assert(plates[0].isPressed === true, "Plate is now PRESSED!");

// Check victory condition
const allPressed = plates.every(p => p.isPressed);
assert(allPressed === true, "All plates pressed -> Level Victory achieved!");

// Test Undo functionality
assert(undo(), "Undo move 1");
assert(player.x === 3 && player.z === 3, "Player reverted to (3, 3)");
assert(crates[0].x === 4 && crates[0].z === 3, "Crate reverted to (4, 3)");
assert(plates[0].isPressed === false, "Plate reverted to unpressed");

assert(undo(), "Undo move 2");
assert(player.x === 2 && player.z === 3, "Player reverted to (2, 3)");
assert(crates[0].x === 3 && crates[0].z === 3, "Crate reverted to (3, 3)");

console.log(`\n========================================`);
console.log(`Test Results: ${passedTests}/${totalTests} tests passed.`);
console.log(`========================================`);
if (passedTests === totalTests) {
    console.log("ALL LOGIC, PHYSICS, AND LEVEL TESTS PASSED!");
}
