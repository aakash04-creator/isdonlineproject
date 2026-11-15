/**
 * BoxCrafter 3D - Procedural Web Audio Engine
 * Generates all sound effects and synthwave ambient music dynamically
 * with zero external asset dependencies.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.masterVolume = 0.5;
        this.musicGain = null;
        this.sfxGain = null;
        this.isMusicPlaying = false;
        this.musicInterval = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
            this.sfxGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume * 0.25, this.ctx.currentTime);
            this.musicGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.ctx) {
            const now = this.ctx.currentTime;
            this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, now);
            this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume * 0.25, now);
        }
        return this.isMuted;
    }

    playRoll() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140 + Math.random() * 20, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playJump() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.18);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    playLand() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playSwitch() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;

        // Two-tone bell harmonic
        [523.25, 659.25].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);

            gain.gain.setValueAtTime(0.2, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.25);
        });
    }

    playGem() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;

        const chord = [587.33, 739.99, 880, 1174.66]; // D maj
        chord.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);

            gain.gain.setValueAtTime(0.2, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 0.3);
        });
    }

    playVictory() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;

        const notes = [
            { f: 523.25, t: 0.0 }, // C5
            { f: 659.25, t: 0.12 }, // E5
            { f: 783.99, t: 0.24 }, // G5
            { f: 1046.50, t: 0.36 } // C6
        ];

        notes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(note.f, now + note.t);

            gain.gain.setValueAtTime(0.25, now + note.t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + 0.45);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + note.t);
            osc.stop(now + note.t + 0.45);
        });
    }

    playDefeat() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.4);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.4);
    }

    startAmbientMusic() {
        if (this.isMusicPlaying) return;
        this.init();
        this.isMusicPlaying = true;

        const chords = [
            [220, 261.63, 329.63], // Am
            [174.61, 220, 261.63], // F
            [261.63, 329.63, 392], // C
            [196, 246.94, 293.66]  // G
        ];

        let chordIdx = 0;
        const playPad = () => {
            if (!this.isMusicPlaying || this.isMuted) return;
            const now = this.ctx.currentTime;
            const currentChord = chords[chordIdx];
            chordIdx = (chordIdx + 1) % chords.length;

            currentChord.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq * 0.5, now);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(400, now);

                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.05, now + 1.2);
                gain.gain.linearRampToValueAtTime(0.001, now + 3.8);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.musicGain);

                osc.start(now);
                osc.stop(now + 3.9);
            });
        };

        playPad();
        this.musicInterval = setInterval(playPad, 3800);
    }

    stopAmbientMusic() {
        this.isMusicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

window.soundEngine = new SoundEngine();

