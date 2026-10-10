/**
 * Witcher Dice Poker Procedural Audio Engine
 * Uses Web Audio API for 100% offline, zero-asset tavern sound effects:
 * - Dice cup rattle & shake
 * - Dice clattering and settling on wooden felt
 * - Coin clinking & pot collection
 * - UI clicks & victory / defeat jingles
 */
class DiceAudio {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.init();
    }

    init() {
        if (typeof window === "undefined") return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            this.ctx = new AudioCtx();
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    // Play a short click
    playClick() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.05);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
    }

    // Play dice cup shake and rolling sound
    playDiceRoll() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Sequence of 7-9 small wooden impacts
        const count = 8;
        for (let i = 0; i < count; i++) {
            const delay = i * 0.06 + Math.random() * 0.04;
            const t = now + delay;

            // Wood impact
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = "triangle";
            const freq = 180 + Math.random() * 140;
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);

            filter.type = "lowpass";
            filter.frequency.setValueAtTime(900, t);

            const vol = 0.25 * (1 - i / (count + 2));
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.08);
        }

        // Noise rattle
        const bufferSize = this.ctx.sampleRate * 0.5;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.value = 1400;
        noiseFilter.Q.value = 3.0;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.12, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        whiteNoise.start(now);
        whiteNoise.stop(now + 0.45);
    }

    // Play single die toggle
    playDieSelect() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.09);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.09);
    }

    // Play coin clink
    playCoin() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const t = this.ctx.currentTime;
        const freqs = [2400, 3100, 4800];
        freqs.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(f + Math.random() * 50, t);
            gain.gain.setValueAtTime(0.15 / (i + 1), t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25 + i * 0.05);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.35);
        });
    }

    // Play victory fanfare
    playWin() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const notes = [330, 440, 554, 659]; // E4, A4, C#5, E5
        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
            const t = now + idx * 0.12;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.65);
        });
    }

    // Play defeat sound
    playLose() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const notes = [440, 392, 349, 311]; // Minor descent
        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
            const t = now + idx * 0.15;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.55);
        });
    }
}

window.diceAudio = new DiceAudio();
