/**
 * BoxCrafter 3D - High-Fidelity Isometric 3D Canvas Renderer
 * Performs true 3D coordinate transformations, depth sorting, dynamic face shading,
 * and particle rendering in real-time.
 */
class IsometricRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Camera & Projection
        this.camera = {
            x: 0,
            y: 0,
            z: 0,
            targetX: 0,
            targetY: 0,
            targetZ: 0,
            zoom: 46,
            angle: Math.PI / 6, // 30 degrees
            pitch: Math.atan(1 / Math.sqrt(2)), // standard true isometric pitch (~35.26°)
            smoothSpeed: 0.12,
            shakeX: 0,
            shakeY: 0
        };

        // Theme palette
        this.theme = {
            backgroundTop: '#0d111a',
            backgroundBottom: '#181e2b',
            gridColor: 'rgba(255, 255, 255, 0.06)',
            tileTop: '#222938',
            tileLeft: '#1a202d',
            tileRight: '#141924',
            playerTop: '#00f0ff',
            playerLeft: '#00b8cc',
            playerRight: '#008599',
            playerGlow: '#00f0ff',
            crateTop: '#ff9d00',
            crateLeft: '#cc7d00',
            crateRight: '#995e00',
            plateActive: '#00ff88',
            plateInactive: '#ff2d55',
            gemColor: '#ff007f'
        };

        this.setupResize();
    }

    setupResize() {
        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.width = rect.width;
            this.height = rect.height;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    setTheme(themeName) {
        if (themeName === 'cyber') {
            this.theme = {
                backgroundTop: '#0a0d18',
                backgroundBottom: '#141829',
                gridColor: 'rgba(0, 240, 255, 0.08)',
                tileTop: '#1b2234',
                tileLeft: '#141926',
                tileRight: '#0f131f',
                playerTop: '#00f0ff',
                playerLeft: '#00b8cc',
                playerRight: '#008599',
                playerGlow: '#00f0ff',
                crateTop: '#ff007f',
                crateLeft: '#cc0066',
                crateRight: '#99004d',
                plateActive: '#00ff88',
                plateInactive: '#ff0055',
                gemColor: '#ffe600'
            };
        } else if (themeName === 'solar') {
            this.theme = {
                backgroundTop: '#1f132b',
                backgroundBottom: '#38162e',
                gridColor: 'rgba(255, 140, 0, 0.1)',
                tileTop: '#3b253b',
                tileLeft: '#2f1d2f',
                tileRight: '#241624',
                playerTop: '#ffaa00',
                playerLeft: '#cc8800',
                playerRight: '#996600',
                playerGlow: '#ffbb33',
                crateTop: '#00d2ff',
                crateLeft: '#00a8cc',
                crateRight: '#007e99',
                plateActive: '#ffd700',
                plateInactive: '#8844aa',
                gemColor: '#ff3366'
            };
        } else if (themeName === 'matrix') {
            this.theme = {
                backgroundTop: '#051109',
                backgroundBottom: '#0a2213',
                gridColor: 'rgba(0, 255, 100, 0.1)',
                tileTop: '#13281b',
                tileLeft: '#0e1f15',
                tileRight: '#0a170f',
                playerTop: '#00ff66',
                playerLeft: '#00cc52',
                playerRight: '#00993d',
                playerGlow: '#00ff66',
                crateTop: '#00e5ff',
                crateLeft: '#00b7cc',
                crateRight: '#008a99',
                plateActive: '#39ff14',
                plateInactive: '#ff1493',
                gemColor: '#ffffff'
            };
        } else {
            // Minimalist Dark
            this.theme = {
                backgroundTop: '#121214',
                backgroundBottom: '#1c1c20',
                gridColor: 'rgba(255, 255, 255, 0.05)',
                tileTop: '#2a2a30',
                tileLeft: '#222227',
                tileRight: '#1b1b1f',
                playerTop: '#ffffff',
                playerLeft: '#d6d6db',
                playerRight: '#b0b0b8',
                playerGlow: '#ffffff',
                crateTop: '#64748b',
                crateLeft: '#475569',
                crateRight: '#334155',
                plateActive: '#38bdf8',
                plateInactive: '#f43f5e',
                gemColor: '#fbbf24'
            };
        }
    }

    setCameraTarget(x, y, z) {
        this.camera.targetX = x;
        this.camera.targetY = y;
        this.camera.targetZ = z;
    }

    applyCameraShake(intensity = 6) {
        this.camera.shakeX = (Math.random() - 0.5) * intensity;
        this.camera.shakeY = (Math.random() - 0.5) * intensity;
    }

    updateCamera() {
        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothSpeed;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothSpeed;
        this.camera.z += (this.camera.targetZ - this.camera.z) * this.camera.smoothSpeed;

        this.camera.shakeX *= 0.85;
        this.camera.shakeY *= 0.85;
    }

    project(wx, wy, wz) {
        // Translate relative to camera
        const relX = wx - this.camera.x;
        const relY = wy - this.camera.y;
        const relZ = wz - this.camera.z;

        // Isometric projection formulas:
        // Screen X = (X - Z) * cos(30°)
        // Screen Y = (X + Z) * sin(30°) - Y
        const cos30 = Math.cos(Math.PI / 6);
        const sin30 = Math.sin(Math.PI / 6);

        const screenX = this.width / 2 + (relX - relZ) * cos30 * this.camera.zoom + this.camera.shakeX;
        const screenY = this.height / 2 + (relX + relZ) * sin30 * this.camera.zoom - (relY * this.camera.zoom) + this.camera.shakeY;
        const depth = relX + relZ + relY * 0.1;

        return { x: screenX, y: screenY, depth: depth };
    }

    clear() {
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0, this.theme.backgroundTop);
        grad.addColorStop(1, this.theme.backgroundBottom);
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    renderFloorTile(x, z, type = 'normal', isGoal = false, isPlate = false, plateActive = false) {
        const p0 = this.project(x, 0, z);
        const p1 = this.project(x + 1, 0, z);
        const p2 = this.project(x + 1, 0, z + 1);
        const p3 = this.project(x, 0, z + 1);

        // Tile Top Face
        this.ctx.beginPath();
        this.ctx.moveTo(p0.x, p0.y);
        this.ctx.lineTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.lineTo(p3.x, p3.y);
        this.ctx.closePath();

        if (isPlate) {
            this.ctx.fillStyle = plateActive ? this.theme.plateActive : this.theme.plateInactive;
            this.ctx.fill();

            // Plate inner border
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            return;
        }

        if (isGoal) {
            this.ctx.fillStyle = '#1e382b';
            this.ctx.fill();
            this.ctx.strokeStyle = this.theme.plateActive;
            this.ctx.lineWidth = 2.5;
            this.ctx.stroke();

            // Goal beacon rune
            const center = this.project(x + 0.5, 0.05, z + 0.5);
            this.ctx.beginPath();
            this.ctx.arc(center.x, center.y, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = this.theme.plateActive;
            this.ctx.fill();
            return;
        }

        this.ctx.fillStyle = this.theme.tileTop;
        this.ctx.fill();
        this.ctx.strokeStyle = this.theme.gridColor;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // 3D Slab Thickness (Sides)
        const b0 = this.project(x, -0.3, z);
        const b2 = this.project(x + 1, -0.3, z + 1);
        const b3 = this.project(x, -0.3, z + 1);

        // Left Side
        this.ctx.beginPath();
        this.ctx.moveTo(p3.x, p3.y);
        this.ctx.lineTo(p0.x, p0.y);
        this.ctx.lineTo(b0.x, b0.y);
        this.ctx.lineTo(b3.x, b3.y);
        this.ctx.closePath();
        this.ctx.fillStyle = this.theme.tileLeft;
        this.ctx.fill();

        // Right Side
        this.ctx.beginPath();
        this.ctx.moveTo(p3.x, p3.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.lineTo(b2.x, b2.y);
        this.ctx.lineTo(b3.x, b3.y);
        this.ctx.closePath();
        this.ctx.fillStyle = this.theme.tileRight;
        this.ctx.fill();
    }

    renderDropShadow(x, z, scale = 1, alpha = 0.35) {
        const center = this.project(x + 0.5, 0.01, z + 0.5);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.ellipse(center.x, center.y, this.camera.zoom * 0.45 * scale, this.camera.zoom * 0.22 * scale, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        this.ctx.fill();
        this.ctx.restore();
    }

    renderCube(x, y, z, size = 1, colors = null, rollAnim = null, squash = 0) {
        let vertices = [
            [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5],
            [-0.5, -0.5, 0.5],  [0.5, -0.5, 0.5],  [0.5, 0.5, 0.5],  [-0.5, 0.5, 0.5]
        ];

        // Apply squash & stretch
        if (squash !== 0) {
            vertices = vertices.map(([vx, vy, vz]) => [
                vx * (1 + squash * 0.5),
                vy * (1 - squash),
                vz * (1 + squash * 0.5)
            ]);
        }

        // Apply Kinematic Edge Roll Transformation if currently animating
        let worldVertices;
        if (rollAnim && rollAnim.active) {
            const t = rollAnim.progress;
            const dir = rollAnim.dir;
            const angle = t * (Math.PI / 2);

            // Pivot anchor is on the bottom contact edge
            const anchor = [
                dir.x !== 0 ? (dir.x * 0.5) : 0,
                -0.5,
                dir.z !== 0 ? (dir.z * 0.5) : 0
            ];

            worldVertices = vertices.map(([vx, vy, vz]) => {
                // Shift to anchor
                let rx = vx - anchor[0];
                let ry = vy - anchor[1];
                let rz = vz - anchor[2];

                // Rotate around perpendicular axis
                if (dir.z > 0) { // Roll forward (+Z)
                    const cos = Math.cos(angle), sin = Math.sin(angle);
                    const newY = ry * cos - rz * sin;
                    const newZ = ry * sin + rz * cos;
                    ry = newY; rz = newZ;
                } else if (dir.z < 0) { // Roll backward (-Z)
                    const cos = Math.cos(-angle), sin = Math.sin(-angle);
                    const newY = ry * cos - rz * sin;
                    const newZ = ry * sin + rz * cos;
                    ry = newY; rz = newZ;
                } else if (dir.x > 0) { // Roll right (+X)
                    const cos = Math.cos(-angle), sin = Math.sin(-angle);
                    const newX = rx * cos - ry * sin;
                    const newY = rx * sin + ry * cos;
                    rx = newX; ry = newY;
                } else if (dir.x < 0) { // Roll left (-X)
                    const cos = Math.cos(angle), sin = Math.sin(angle);
                    const newX = rx * cos - ry * sin;
                    const newY = rx * sin + ry * cos;
                    rx = newX; ry = newY;
                }

                return [
                    x + rx + anchor[0],
                    y + ry + anchor[1] + 0.5,
                    z + rz + anchor[2]
                ];
            });
        } else {
            worldVertices = vertices.map(([vx, vy, vz]) => [
                x + vx * size,
                y + vy * size + 0.5 * size,
                z + vz * size
            ]);
        }

        const faces = [
            { indices: [3, 2, 6, 7], normal: [0, 1, 0], name: 'top', color: colors?.top || this.theme.playerTop },
            { indices: [0, 3, 7, 4], normal: [-1, 0, 0], name: 'left', color: colors?.left || this.theme.playerLeft },
            { indices: [4, 7, 6, 5], normal: [0, 0, 1], name: 'right', color: colors?.right || this.theme.playerRight },
            { indices: [1, 5, 6, 2], normal: [1, 0, 0], name: 'backRight', color: colors?.left || this.theme.playerLeft },
            { indices: [0, 1, 2, 3], normal: [0, 0, -1], name: 'backLeft', color: colors?.right || this.theme.playerRight },
            { indices: [0, 4, 5, 1], normal: [0, -1, 0], name: 'bottom', color: '#000000' }
        ];

        // Project all vertices
        const projected = worldVertices.map(v => this.project(v[0], v[1], v[2]));

        // Calculate face depths and sort
        const renderedFaces = faces.map(face => {
            let avgDepth = 0;
            face.indices.forEach(idx => avgDepth += projected[idx].depth);
            avgDepth /= face.indices.length;

            // Compute screen cross product to cull backfaces
            const pA = projected[face.indices[0]];
            const pB = projected[face.indices[1]];
            const pC = projected[face.indices[2]];
            const cross = (pB.x - pA.x) * (pC.y - pA.y) - (pB.y - pA.y) * (pC.x - pA.x);

            return { ...face, depth: avgDepth, visible: cross < 0 };
        }).filter(f => f.visible);

        renderedFaces.sort((a, b) => a.depth - b.depth);

        // Draw visible faces
        renderedFaces.forEach(face => {
            this.ctx.beginPath();
            const startP = projected[face.indices[0]];
            this.ctx.moveTo(startP.x, startP.y);
            for (let i = 1; i < face.indices.length; i++) {
                const pt = projected[face.indices[i]];
                this.ctx.lineTo(pt.x, pt.y);
            }
            this.ctx.closePath();
            this.ctx.fillStyle = face.color;
            this.ctx.fill();

            // Bevel edge highlight
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Decorative circuit / core symbol on top face
            if (face.name === 'top') {
                const center = projected[face.indices[0]];
                this.ctx.save();
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                this.ctx.lineWidth = 1.5;
                this.ctx.restore();
            }
        });
    }

    renderGem(x, y, z, rotation) {
        const bob = Math.sin(Date.now() * 0.004) * 0.12;
        const p = this.project(x, y + 0.4 + bob, z);
        const radius = this.camera.zoom * 0.28;

        this.ctx.save();
        this.ctx.translate(p.x, p.y);

        // Rotating diamond
        this.ctx.beginPath();
        this.ctx.moveTo(0, -radius);
        this.ctx.lineTo(radius * 0.7, 0);
        this.ctx.lineTo(0, radius);
        this.ctx.lineTo(-radius * 0.7, 0);
        this.ctx.closePath();

        this.ctx.fillStyle = this.theme.gemColor;
        this.ctx.fill();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Inner shine
        this.ctx.beginPath();
        this.ctx.arc(0, -radius * 0.3, radius * 0.2, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fill();

        this.ctx.restore();
    }

    renderLaser(x1, z1, x2, z2, active = true) {
        if (!active) return;
        const p1 = this.project(x1, 0.3, z1);
        const p2 = this.project(x2, 0.3, z2);

        this.ctx.save();
        // Pulsing glow
        const glow = 6 + Math.sin(Date.now() * 0.015) * 3;
        this.ctx.shadowColor = '#ff0055';
        this.ctx.shadowBlur = glow;

        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.strokeStyle = '#ff0055';
        this.ctx.lineWidth = 3.5;
        this.ctx.stroke();

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        this.ctx.restore();
    }

    renderParticles(particles) {
        particles.forEach(p => {
            const pt = this.project(p.x, p.y, p.z);
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.alpha);

            if (p.type === 'shockwave') {
                this.ctx.beginPath();
                this.ctx.ellipse(pt.x, pt.y, p.size * this.camera.zoom, p.size * this.camera.zoom * 0.5, 0, 0, Math.PI * 2);
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = 2.5;
                this.ctx.stroke();
            } else if (p.type === 'confetti') {
                this.ctx.translate(pt.x, pt.y);
                this.ctx.rotate(p.rotation || 0);
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.size * 10, -p.size * 6, p.size * 20, p.size * 12);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(pt.x, pt.y, Math.max(1, p.size * (this.camera.zoom * 0.2)), 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
            }

            this.ctx.restore();
        });
    }
}

window.IsometricRenderer = IsometricRenderer;
