/**
 * BoxCrafter 3D - Main Game Engine
 * Coordinates game modes, input, physics, animations, state persistence, and UI.
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new IsometricRenderer(this.canvas);

        // Game State
        this.currentMode = 'puzzle'; // 'puzzle', 'runner', 'stacker'
        this.currentLevelIndex = 0;
        this.score = 0;
        this.moves = 0;
        this.gemsCollected = 0;
        this.totalGemsInLevel = 0;
        this.startTime = Date.now();
        this.isPaused = false;
        this.isGameOver = false;
        this.isLevelWon = false;

        // Undo History Stack for Puzzle Mode
        this.history = [];

        // Player State
        this.player = {
            x: 2,
            y: 0,
            z: 2,
            targetX: 2,
            targetZ: 2,
            isRolling: false,
            rollAnim: { active: false, progress: 0, dir: { x: 0, z: 0 }, duration: 180, startTime: 0 },
            isJumping: false,
            jumpProgress: 0,
            squash: 0
        };

        // Current level objects
        this.level = null;
        this.crates = [];
        this.plates = [];
        this.gems = [];
        this.lasers = [];

        // Runner Mode State
        this.runner = {
            playerX: 0,
            playerZ: 0,
            playerY: 0,
            speed: 0.12,
            trackSegments: [],
            obstacles: [],
            gems: [],
            distance: 0,
            multiplier: 1,
            isGrounded: true,
            vy: 0
        };

        // Stacker Mode State
        this.stacker = {
            currentBlock: { x: 0, z: 0, width: 2, depth: 2, dir: 1, speed: 0.06 },
            tower: [],
            height: 0,
            maxHeight: 0
        };

        this.initDOM();
        this.initInput();
        this.loadLevel(0);
        this.startLoop();
    }

    initDOM() {
        this.dom = {
            levelName: document.getElementById('levelName'),
            levelHint: document.getElementById('levelHint'),
            movesCount: document.getElementById('movesCount'),
            gemsCount: document.getElementById('gemsCount'),
            timer: document.getElementById('gameTimer'),
            scoreDisplay: document.getElementById('scoreDisplay'),
            btnUndo: document.getElementById('btnUndo'),
            btnRestart: document.getElementById('btnRestart'),
            btnMute: document.getElementById('btnMute'),
            btnHelp: document.getElementById('btnHelp'),
            modalHelp: document.getElementById('modalHelp'),
            modalVictory: document.getElementById('modalVictory'),
            btnCloseHelp: document.getElementById('btnCloseHelp'),
            btnNextLevel: document.getElementById('btnNextLevel'),
            btnPlayAgain: document.getElementById('btnPlayAgain'),
            themeSelect: document.getElementById('themeSelect'),
            modeTabs: document.querySelectorAll('.mode-tab')
        };

        // Mode Switching
        this.dom.modeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.dom.modeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.switchMode(tab.dataset.mode);
            });
        });

        // UI Buttons
        this.dom.btnUndo?.addEventListener('click', () => this.undoMove());
        this.dom.btnRestart?.addEventListener('click', () => this.restartLevel());
        this.dom.btnMute?.addEventListener('click', () => {
            const muted = window.soundEngine.toggleMute();
            this.dom.btnMute.textContent = muted ? '🔇' : '🔊';
        });

        this.dom.btnHelp?.addEventListener('click', () => {
            this.dom.modalHelp.classList.add('show');
        });
        this.dom.btnCloseHelp?.addEventListener('click', () => {
            this.dom.modalHelp.classList.remove('show');
        });

        this.dom.btnNextLevel?.addEventListener('click', () => {
            this.dom.modalVictory.classList.remove('show');
            this.loadLevel((this.currentLevelIndex + 1) % GAME_LEVELS.length);
        });
        this.dom.btnPlayAgain?.addEventListener('click', () => {
            this.dom.modalVictory.classList.remove('show');
            this.restartLevel();
        });

        this.dom.themeSelect?.addEventListener('change', (e) => {
            this.renderer.setTheme(e.target.value);
            localStorage.setItem('boxcrafter_theme', e.target.value);
        });

        const savedTheme = localStorage.getItem('boxcrafter_theme') || 'cyber';
        if (this.dom.themeSelect) this.dom.themeSelect.value = savedTheme;
        this.renderer.setTheme(savedTheme);

        // Mobile Controls
        document.getElementById('dpadUp')?.addEventListener('click', () => this.handleDirectionInput(0, -1));
        document.getElementById('dpadDown')?.addEventListener('click', () => this.handleDirectionInput(0, 1));
        document.getElementById('dpadLeft')?.addEventListener('click', () => this.handleDirectionInput(-1, 0));
        document.getElementById('dpadRight')?.addEventListener('click', () => this.handleDirectionInput(1, 0));
        document.getElementById('btnAction')?.addEventListener('click', () => this.handleActionInput());
    }

    initInput() {
        window.addEventListener('keydown', (e) => {
            if (this.isLevelWon && e.code === 'Enter') {
                this.dom.btnNextLevel?.click();
                return;
            }

            if (e.code === 'KeyW' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleDirectionInput(0, -1);
            } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
                e.preventDefault();
                this.handleDirectionInput(0, 1);
            } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
                e.preventDefault();
                this.handleDirectionInput(-1, 0);
            } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
                e.preventDefault();
                this.handleDirectionInput(1, 0);
            } else if (e.code === 'Space') {
                e.preventDefault();
                this.handleActionInput();
            } else if (e.code === 'KeyU' || (e.ctrlKey && e.code === 'KeyZ')) {
                e.preventDefault();
                this.undoMove();
            } else if (e.code === 'KeyR') {
                e.preventDefault();
                this.restartLevel();
            } else if (e.code === 'KeyM') {
                this.dom.btnMute?.click();
            }
        });
    }

    switchMode(mode) {
        this.currentMode = mode;
        this.isGameOver = false;
        this.isLevelWon = false;
        this.score = 0;
        this.history = [];

        if (mode === 'puzzle') {
            this.loadLevel(this.currentLevelIndex);
        } else if (mode === 'runner') {
            this.initRunnerMode();
        } else if (mode === 'stacker') {
            this.initStackerMode();
        }
    }

    loadLevel(index) {
        this.currentLevelIndex = index;
        this.level = GAME_LEVELS[index];
        this.isGameOver = false;
        this.isLevelWon = false;
        this.moves = 0;
        this.startTime = Date.now();
        this.history = [];

        // Clone dynamic objects
        this.player.x = this.level.playerStart.x;
        this.player.y = 0;
        this.player.z = this.level.playerStart.z;
        this.player.targetX = this.player.x;
        this.player.targetZ = this.player.z;
        this.player.isRolling = false;
        this.player.rollAnim.active = false;

        this.crates = this.level.crates.map(c => ({ ...c, isMoving: false, slideProgress: 0 }));
        this.plates = this.level.plates.map(p => ({ ...p, isPressed: false }));
        this.gems = this.level.gems.map(g => ({ ...g, collected: false }));
        this.lasers = this.level.lasers.map(l => ({ ...l }));

        this.gemsCollected = 0;
        this.totalGemsInLevel = this.gems.length;

        // Update Camera
        this.renderer.setCameraTarget(this.level.width / 2, 0, this.level.height / 2);

        // Update UI
        if (this.dom.levelName) this.dom.levelName.textContent = this.level.name;
        if (this.dom.levelHint) this.dom.levelHint.textContent = this.level.hint;
        this.updateHUD();

        window.particleSystem.clear();
        this.checkPlates();
    }

    updateHUD() {
        if (this.dom.movesCount) this.dom.movesCount.textContent = this.moves;
        if (this.dom.gemsCount) this.dom.gemsCount.textContent = `${this.gemsCollected}/${this.totalGemsInLevel}`;
        if (this.dom.scoreDisplay) this.dom.scoreDisplay.textContent = this.score;
    }

    handleDirectionInput(dx, dz) {
        if (this.isLevelWon || this.isGameOver) return;

        if (this.currentMode === 'puzzle') {
            if (this.player.isRolling) return;
            this.tryRollPlayer(dx, dz);
        } else if (this.currentMode === 'runner') {
            // Lane shift
            this.runner.playerX = Math.max(-2, Math.min(2, this.runner.playerX + dx));
            window.soundEngine.playRoll();
        }
    }

    handleActionInput() {
        if (this.currentMode === 'puzzle') {
            // Jump
            if (!this.player.isJumping && !this.player.isRolling) {
                this.player.isJumping = true;
                this.player.jumpProgress = 0;
                window.soundEngine.playJump();
                window.particleSystem.emitDust(this.player.x + 0.5, 0, this.player.z + 0.5, 8);
            }
        } else if (this.currentMode === 'runner') {
            if (this.runner.isGrounded) {
                this.runner.vy = 0.22;
                this.runner.isGrounded = false;
                window.soundEngine.playJump();
            }
        } else if (this.currentMode === 'stacker') {
            this.dropStackerBlock();
        }
    }

    tryRollPlayer(dx, dz) {
        const targetX = this.player.x + dx;
        const targetZ = this.player.z + dz;

        // Check level bounds & walls
        if (
            targetZ < 0 || targetZ >= this.level.height ||
            targetX < 0 || targetX >= this.level.width ||
            this.level.tiles[targetZ][targetX] === 0
        ) {
            // Blocked bump
            this.renderer.applyCameraShake(3);
            return;
        }

        // Check if there is a crate at target location
        const crate = this.crates.find(c => c.x === targetX && c.z === targetZ);
        if (crate) {
            // Try pushing crate
            const crateTargetX = targetX + dx;
            const crateTargetZ = targetZ + dz;

            // Check if crate target is valid
            if (
                crateTargetZ < 0 || crateTargetZ >= this.level.height ||
                crateTargetX < 0 || crateTargetX >= this.level.width ||
                this.level.tiles[crateTargetZ][crateTargetX] === 0 ||
                this.crates.some(c => c.x === crateTargetX && c.z === crateTargetZ)
            ) {
                // Crate blocked!
                this.renderer.applyCameraShake(3);
                return;
            }

            // Save state for Undo
            this.recordHistory();

            // Push crate!
            crate.x = crateTargetX;
            crate.z = crateTargetZ;
            window.soundEngine.playRoll();
            window.particleSystem.emitDust(crateTargetX + 0.5, 0, crateTargetZ + 0.5, 6);
        } else {
            // Normal move: Save state for Undo
            this.recordHistory();
        }

        // Execute kinematic roll
        this.player.isRolling = true;
        this.player.targetX = targetX;
        this.player.targetZ = targetZ;
        this.player.rollAnim = {
            active: true,
            progress: 0,
            dir: { x: dx, z: dz },
            duration: 180,
            startTime: performance.now()
        };

        this.moves++;
        window.soundEngine.playRoll();
        window.particleSystem.emitDust(this.player.x + 0.5, 0, this.player.z + 0.5, 5);
        this.updateHUD();
    }

    recordHistory() {
        this.history.push({
            playerX: this.player.x,
            playerZ: this.player.z,
            crates: this.crates.map(c => ({ x: c.x, z: c.z })),
            moves: this.moves,
            score: this.score,
            gemsCollected: this.gemsCollected,
            gemsState: this.gems.map(g => g.collected)
        });
        if (this.history.length > 50) this.history.shift();
    }

    undoMove() {
        if (this.history.length === 0 || this.player.isRolling || this.isLevelWon) return;

        const prev = this.history.pop();
        this.player.x = prev.playerX;
        this.player.z = prev.playerZ;
        this.player.targetX = prev.playerX;
        this.player.targetZ = prev.playerZ;
        this.player.rollAnim.active = false;
        this.player.isRolling = false;

        this.crates.forEach((c, i) => {
            c.x = prev.crates[i].x;
            c.z = prev.crates[i].z;
        });

        this.gems.forEach((g, i) => {
            g.collected = prev.gemsState[i];
        });

        this.moves = prev.moves;
        this.score = prev.score;
        this.gemsCollected = prev.gemsCollected;

        window.soundEngine.playRoll();
        this.updateHUD();
        this.checkPlates();
    }

    restartLevel() {
        this.loadLevel(this.currentLevelIndex);
    }

    checkPlates() {
        let allPressed = true;

        this.plates.forEach(plate => {
            const hasCrate = this.crates.some(c => c.x === plate.x && c.z === plate.z);
            const hasPlayer = this.player.x === plate.x && this.player.z === plate.z;
            const wasPressed = plate.isPressed;
            plate.isPressed = hasCrate || hasPlayer;

            if (plate.isPressed && !wasPressed) {
                window.soundEngine.playSwitch();
                window.particleSystem.emitShockwave(plate.x + 0.5, 0, plate.z + 0.5, '#00ff88');
            }

            if (!plate.isPressed) {
                allPressed = false;
            }
        });

        if (this.plates.length > 0 && allPressed && !this.isLevelWon) {
            this.handleLevelVictory();
        }
    }

    checkGems() {
        this.gems.forEach(gem => {
            if (!gem.collected && this.player.x === gem.x && this.player.z === gem.z) {
                gem.collected = true;
                this.gemsCollected++;
                this.score += 150;
                window.soundEngine.playGem();
                window.particleSystem.emitSparks(gem.x + 0.5, 0.5, gem.z + 0.5, 16, '#ffe600');
                this.updateHUD();
            }
        });
    }

    checkHazards() {
        const now = (Date.now() - this.startTime) / 1000;

        for (const laser of this.lasers) {
            const cycleTime = (now + laser.offset) % laser.cycle;
            const isActive = cycleTime < (laser.cycle * 0.6); // Active 60% of time

            if (isActive) {
                // Check if player collides with laser segment
                const px = this.player.x + 0.5;
                const pz = this.player.z + 0.5;

                // Simple point to segment collision check
                const isHit = (Math.abs(pz - laser.z1) < 0.4 && px >= Math.min(laser.x1, laser.x2) && px <= Math.max(laser.x1, laser.x2));
                if (isHit && !this.player.isJumping) {
                    window.soundEngine.playDefeat();
                    this.renderer.applyCameraShake(12);
                    window.particleSystem.emitSparks(px, 0.5, pz, 20, '#ff0055');
                    this.restartLevel();
                    return;
                }
            }
        }
    }

    handleLevelVictory() {
        this.isLevelWon = true;
        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const timeBonus = Math.max(0, 300 - timeElapsed * 5);
        const moveBonus = Math.max(0, 200 - this.moves * 10);
        const levelScore = 500 + timeBonus + moveBonus + this.gemsCollected * 100;
        this.score += levelScore;

        window.soundEngine.playVictory();
        window.particleSystem.emitConfetti(this.player.x + 0.5, 0, this.player.z + 0.5, 50);

        setTimeout(() => {
            if (this.dom.modalVictory) {
                document.getElementById('victoryMoves').textContent = this.moves;
                document.getElementById('victoryTime').textContent = `${timeElapsed}s`;
                document.getElementById('victoryScore').textContent = levelScore;
                this.dom.modalVictory.classList.add('show');
            }
        }, 600);
    }

    // ================= Runner Mode =================
    initRunnerMode() {
        this.runner = {
            playerX: 0,
            playerZ: 0,
            playerY: 0,
            speed: 0.14,
            trackSegments: [],
            obstacles: [],
            gems: [],
            distance: 0,
            multiplier: 1,
            isGrounded: true,
            vy: 0
        };

        // Generate initial track
        for (let z = -5; z < 40; z++) {
            this.runner.trackSegments.push({ z: z });
        }
        if (this.dom.levelName) this.dom.levelName.textContent = "Cyber Dash (Infinite)";
        if (this.dom.levelHint) this.dom.levelHint.textContent = "Steer with A/D or Left/Right. Jump over spikes with Space / Up!";
    }

    updateRunner() {
        this.runner.distance += this.runner.speed;
        this.runner.playerZ += this.runner.speed;
        this.score = Math.floor(this.runner.distance * 10);

        // Jump physics
        this.runner.playerY += this.runner.vy;
        this.runner.vy -= 0.012; // gravity

        if (this.runner.playerY <= 0) {
            this.runner.playerY = 0;
            this.runner.vy = 0;
            if (!this.runner.isGrounded) {
                this.runner.isGrounded = true;
                window.soundEngine.playLand();
                window.particleSystem.emitDust(this.runner.playerX + 0.5, 0, this.runner.playerZ + 0.5, 6);
            }
        }

        // Spawn track ahead
        const lastZ = this.runner.trackSegments[this.runner.trackSegments.length - 1].z;
        if (lastZ - this.runner.playerZ < 35) {
            const newZ = lastZ + 1;
            this.runner.trackSegments.push({ z: newZ });

            // Random obstacles
            if (Math.random() < 0.35 && newZ > 10) {
                const obsX = Math.floor((Math.random() - 0.5) * 4);
                this.runner.obstacles.push({ x: obsX, z: newZ, size: 0.8 });
            }

            // Random gems
            if (Math.random() < 0.25) {
                const gemX = Math.floor((Math.random() - 0.5) * 4);
                this.runner.gems.push({ x: gemX, z: newZ, collected: false });
            }
        }

        // Clean passed track
        this.runner.trackSegments = this.runner.trackSegments.filter(s => s.z > this.runner.playerZ - 8);
        this.runner.obstacles = this.runner.obstacles.filter(o => o.z > this.runner.playerZ - 8);
        this.runner.gems = this.runner.gems.filter(g => g.z > this.runner.playerZ - 8);

        // Check collision with obstacles
        for (const obs of this.runner.obstacles) {
            if (Math.abs(obs.x - this.runner.playerX) < 0.7 && Math.abs(obs.z - this.runner.playerZ) < 0.7) {
                if (this.runner.playerY < 0.6) {
                    // Hit obstacle!
                    window.soundEngine.playDefeat();
                    this.renderer.applyCameraShake(15);
                    this.isGameOver = true;
                    setTimeout(() => this.initRunnerMode(), 1200);
                    return;
                }
            }
        }

        // Check gem pickups
        for (const gem of this.runner.gems) {
            if (!gem.collected && Math.abs(gem.x - this.runner.playerX) < 0.8 && Math.abs(gem.z - this.runner.playerZ) < 0.8) {
                gem.collected = true;
                this.score += 200;
                window.soundEngine.playGem();
                window.particleSystem.emitSparks(gem.x + 0.5, 0.5, gem.z + 0.5, 12, '#ffe600');
            }
        }

        this.renderer.setCameraTarget(this.runner.playerX, this.runner.playerY, this.runner.playerZ + 4);
        this.updateHUD();
    }

    // ================= Stacker Mode =================
    initStackerMode() {
        this.stacker = {
            currentBlock: { x: 0, z: 0, width: 2.2, depth: 2.2, dir: 1, speed: 0.05 },
            tower: [
                { x: 0, z: 0, y: 0, width: 2.2, depth: 2.2, color: '#38bdf8' }
            ],
            height: 0,
            maxHeight: 0
        };
        if (this.dom.levelName) this.dom.levelName.textContent = "Tower Stacker (Kinetic)";
        if (this.dom.levelHint) this.dom.levelHint.textContent = "Tap Space or Screen when the moving block aligns with the tower!";
    }

    dropStackerBlock() {
        const top = this.stacker.tower[this.stacker.tower.length - 1];
        const cur = this.stacker.currentBlock;
        const diffX = cur.x - top.x;
        const diffZ = cur.z - top.z;

        const tolerance = 0.15;
        if (Math.abs(diffX) < tolerance && Math.abs(diffZ) < tolerance) {
            // Perfect drop!
            cur.x = top.x;
            cur.z = top.z;
            window.soundEngine.playGem();
            window.particleSystem.emitSparks(cur.x, this.stacker.height + 1, cur.z, 20, '#00ff88');
            this.score += 300;
        } else if (Math.abs(diffX) > top.width || Math.abs(diffZ) > top.depth) {
            // Missed completely!
            window.soundEngine.playDefeat();
            this.isGameOver = true;
            setTimeout(() => this.initStackerMode(), 1200);
            return;
        } else {
            // Partial slice
            window.soundEngine.playLand();
            window.particleSystem.emitDust(cur.x, this.stacker.height + 1, cur.z, 10);
            this.score += 100;
        }

        this.stacker.height++;
        this.stacker.tower.push({
            x: cur.x,
            z: cur.z,
            y: this.stacker.height,
            width: cur.width,
            depth: cur.depth,
            color: `hsl(${(this.stacker.height * 25) % 360}, 85%, 60%)`
        });

        // Setup next block oscillating
        cur.x = -3;
        cur.dir = 1;
        this.renderer.setCameraTarget(0, this.stacker.height * 0.8, 0);
        this.updateHUD();
    }

    updateStacker() {
        const cur = this.stacker.currentBlock;
        cur.x += cur.speed * cur.dir;
        if (cur.x > 3.5) cur.dir = -1;
        if (cur.x < -3.5) cur.dir = 1;
    }

    // ================= Main Loop =================
    startLoop() {
        const loop = (timestamp) => {
            this.update(timestamp);
            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    update(timestamp) {
        window.particleSystem.update();
        this.renderer.updateCamera();

        // Update Timer in HUD
        if (!this.isLevelWon && !this.isGameOver) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const s = (elapsed % 60).toString().padStart(2, '0');
            if (this.dom.timer) this.dom.timer.textContent = `${m}:${s}`;
        }

        if (this.currentMode === 'puzzle') {
            // Update roll animation
            if (this.player.rollAnim.active) {
                const elapsed = performance.now() - this.player.rollAnim.startTime;
                const progress = Math.min(1, elapsed / this.player.rollAnim.duration);
                this.player.rollAnim.progress = progress;

                if (progress >= 1) {
                    this.player.x = this.player.targetX;
                    this.player.z = this.player.targetZ;
                    this.player.isRolling = false;
                    this.player.rollAnim.active = false;

                    this.checkGems();
                    this.checkPlates();
                    this.checkHazards();
                }
            }

            // Update jump animation
            if (this.player.isJumping) {
                this.player.jumpProgress += 0.08;
                this.player.y = Math.sin(this.player.jumpProgress * Math.PI) * 0.85;
                if (this.player.jumpProgress >= 1) {
                    this.player.isJumping = false;
                    this.player.y = 0;
                    window.soundEngine.playLand();
                    window.particleSystem.emitDust(this.player.x + 0.5, 0, this.player.z + 0.5, 6);
                }
            }

            // Smooth camera follow player
            this.renderer.setCameraTarget(this.player.x + 0.5, 0, this.player.z + 0.5);

        } else if (this.currentMode === 'runner' && !this.isGameOver) {
            this.updateRunner();
        } else if (this.currentMode === 'stacker' && !this.isGameOver) {
            this.updateStacker();
        }
    }

    render() {
        this.renderer.clear();

        if (this.currentMode === 'puzzle' && this.level) {
            // 1. Render Floor Grid
            for (let z = 0; z < this.level.height; z++) {
                for (let x = 0; x < this.level.width; x++) {
                    if (this.level.tiles[z][x] === 1) {
                        const isPlate = this.plates.some(p => p.x === x && p.z === z);
                        const plateObj = this.plates.find(p => p.x === x && p.z === z);
                        this.renderer.renderFloorTile(x, z, 'normal', false, isPlate, plateObj?.isPressed);
                    }
                }
            }

            // 2. Render Lasers
            const now = (Date.now() - this.startTime) / 1000;
            this.lasers.forEach(laser => {
                const cycleTime = (now + laser.offset) % laser.cycle;
                const isActive = cycleTime < (laser.cycle * 0.6);
                this.renderer.renderLaser(laser.x1, laser.z1, laser.x2, laser.z2, isActive);
            });

            // 3. Render Gems
            this.gems.forEach(gem => {
                if (!gem.collected) {
                    this.renderer.renderGem(gem.x + 0.5, 0, gem.z + 0.5);
                }
            });

            // 4. Render Drop Shadows
            this.renderer.renderDropShadow(this.player.x, this.player.z, 0.9, 0.4);
            this.crates.forEach(c => {
                this.renderer.renderDropShadow(c.x, c.z, 0.85, 0.35);
            });

            // 5. Render Crates
            this.crates.forEach(c => {
                this.renderer.renderCube(c.x + 0.5, 0, c.z + 0.5, 0.9, {
                    top: this.renderer.theme.crateTop,
                    left: this.renderer.theme.crateLeft,
                    right: this.renderer.theme.crateRight
                });
            });

            // 6. Render Player Cube
            this.renderer.renderCube(
                this.player.x + 0.5,
                this.player.y,
                this.player.z + 0.5,
                0.9,
                null,
                this.player.rollAnim,
                this.player.squash
            );

        } else if (this.currentMode === 'runner') {
            // Render Runner track
            this.runner.trackSegments.forEach(seg => {
                for (let x = -2; x <= 2; x++) {
                    this.renderer.renderFloorTile(x, seg.z, 'normal');
                }
            });

            // Obstacles
            this.runner.obstacles.forEach(obs => {
                this.renderer.renderCube(obs.x + 0.5, 0, obs.z + 0.5, obs.size, {
                    top: '#ff0055',
                    left: '#cc0044',
                    right: '#990033'
                });
            });

            // Gems
            this.runner.gems.forEach(gem => {
                if (!gem.collected) {
                    this.renderer.renderGem(gem.x + 0.5, 0, gem.z + 0.5);
                }
            });

            // Player Runner
            this.renderer.renderDropShadow(this.runner.playerX, this.runner.playerZ, 0.9, 0.4);
            this.renderer.renderCube(
                this.runner.playerX + 0.5,
                this.runner.playerY,
                this.runner.playerZ + 0.5,
                0.9
            );

        } else if (this.currentMode === 'stacker') {
            // Ground base
            for (let x = -3; x <= 3; x++) {
                for (let z = -3; z <= 3; z++) {
                    this.renderer.renderFloorTile(x, z, 'normal');
                }
            }

            // Tower
            this.stacker.tower.forEach(b => {
                this.renderer.renderCube(b.x, b.y, b.z, b.width * 0.5, {
                    top: b.color,
                    left: b.color,
                    right: b.color
                });
            });

            // Moving Block
            const cur = this.stacker.currentBlock;
            this.renderer.renderCube(cur.x, this.stacker.height + 1, cur.z, cur.width * 0.5);
        }

        // 7. Render Particles
        this.renderer.renderParticles(window.particleSystem.particles);
    }
}

// Initialize on DOM ready
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});

