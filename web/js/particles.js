/**
 * BoxCrafter 3D - 3D Particle System
 * Manages physical particles, sparks, confetti, and shockwaves in isometric space.
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 300;
    }

    emitDust(x, y, z, count = 6, color = 'rgba(200, 220, 255, 0.6)') {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) this.particles.shift();
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.02 + Math.random() * 0.04;
            this.particles.push({
                x: x + (Math.random() - 0.5) * 0.3,
                y: y + 0.05,
                z: z + (Math.random() - 0.5) * 0.3,
                vx: Math.cos(angle) * speed,
                vy: 0.03 + Math.random() * 0.04,
                vz: Math.sin(angle) * speed,
                size: 0.12 + Math.random() * 0.08,
                color: color,
                alpha: 1.0,
                decay: 0.03 + Math.random() * 0.03,
                type: 'dust'
            });
        }
    }

    emitSparks(x, y, z, count = 14, color = '#ff007f') {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) this.particles.shift();
            const angle = Math.random() * Math.PI * 2;
            const elevation = (Math.random() - 0.2) * Math.PI;
            const speed = 0.05 + Math.random() * 0.08;
            this.particles.push({
                x: x,
                y: y + 0.5,
                z: z,
                vx: Math.cos(angle) * Math.cos(elevation) * speed,
                vy: Math.sin(elevation) * speed + 0.05,
                vz: Math.sin(angle) * Math.cos(elevation) * speed,
                size: 0.08 + Math.random() * 0.06,
                color: color,
                alpha: 1.0,
                decay: 0.025 + Math.random() * 0.02,
                type: 'spark'
            });
        }
    }

    emitConfetti(x, y, z, count = 40) {
        const colors = ['#00f0ff', '#ff007f', '#ffe600', '#00ff66', '#a100ff', '#ffffff'];
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) this.particles.shift();
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.04 + Math.random() * 0.09;
            this.particles.push({
                x: x + (Math.random() - 0.5) * 1.5,
                y: y + 1.5 + Math.random() * 1.5,
                z: z + (Math.random() - 0.5) * 1.5,
                vx: Math.cos(angle) * speed,
                vy: 0.06 + Math.random() * 0.08,
                vz: Math.sin(angle) * speed,
                size: 0.15 + Math.random() * 0.12,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1.0,
                decay: 0.012 + Math.random() * 0.01,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.2,
                type: 'confetti'
            });
        }
    }

    emitShockwave(x, y, z, color = '#00f0ff') {
        this.particles.push({
            x: x,
            y: y + 0.02,
            z: z,
            vx: 0,
            vy: 0,
            vz: 0,
            size: 0.2,
            maxSize: 1.6,
            color: color,
            alpha: 1.0,
            decay: 0.04,
            type: 'shockwave'
        });
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            if (p.type === 'shockwave') {
                p.size += (p.maxSize - p.size) * 0.15;
                p.alpha -= p.decay;
            } else {
                p.x += p.vx;
                p.y += p.vy;
                p.z += p.vz;

                // Gravity
                if (p.type === 'dust' || p.type === 'confetti') {
                    p.vy -= 0.0018;
                } else if (p.type === 'spark') {
                    p.vy -= 0.003;
                }

                if (p.rotation !== undefined) {
                    p.rotation += p.rotSpeed;
                }

                p.alpha -= p.decay;
            }

            if (p.alpha <= 0 || p.y < -3) {
                this.particles.splice(i, 1);
            }
        }
    }

    clear() {
        this.particles = [];
    }
}

window.particleSystem = new ParticleSystem();

