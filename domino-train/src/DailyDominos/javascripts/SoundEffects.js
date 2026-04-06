class SoundGenerator {
    constructor() {
        this.audioContext = null;
    }

    // Initialize AudioContext (must be done after user interaction)
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    playDomino(startFreq, endFreq){
        const ctx = this.init();
        const now = ctx.currentTime;

        // Oscillator for the tone
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.05);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.type = 'sine';
        osc.start(now);
        osc.stop(now + 0.05);
    }

    // 1. Domino Pickup - Rising pitch "pop"
    playPickup() {
        this.playDomino(200, 600);
    }

    // 2. Domino Put Down - Descending "thunk"
    playPutDown() {
        this.playDomino(600, 200);
    }

    // 3. Domino Rotation - Quick "click"
    playRotate() {
        this.playDomino(400, 400);
    }

    playError(){
        this.playDomino(350, 350);
        this.playDomino(150, 150);
    }

    // 4. Clear Board - Descending cascade
    playClear() {
        const ctx = this.init();
        const now = ctx.currentTime;

        // Play multiple descending notes
        for (let i = 0; i < 2; i++) {
            // Oscillator for the tone
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            const startTime = now + (i * 0.08);
            const frequency = 600 - (i * 250); // Descending notes

            osc.frequency.setValueAtTime(frequency, startTime);
            osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, startTime + 0.05);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.4, startTime + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

            osc.type = 'sine';
            osc.start(startTime);
            osc.stop(startTime + 0.05);
        }
    }

    // 5. Scoreboard Sound - Pleasant "ding"
    playScore(score, topScore) {
        // const frequencies = [523.25, 554.36, 587.33, 622.25, 659.25, 698.456, 739.99, 783.99, 830.61, 880, 932.33, 1046.502];
        if(score >= 0){
            let freq = 523.25 + (525.25 * score/topScore);
            this.playDomino(freq, freq);
        }
    }

    playTutorial(){
        this.playDomino(1046.502,1046.502);
    }

    playVictory() {
        const ctx = this.init();
        const now = ctx.currentTime;
        const beat = 60 / 240;

        const playNote = (freq, startTime, duration, volume = 0.1) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
            gain.gain.setValueAtTime(volume, startTime + duration * 0.4);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.start(startTime);
            osc.stop(startTime + duration + 0.05);
        };

        playNote(587.33, now, beat * 1.5, 0.1);  // D5
        playNote(739.99, now, beat * 1.5, 0.1);  // F#5
        playNote(880.00, now, beat * 1.5, 0.05); // A5
        playNote(1174.66, now, beat * 1.5, 0.05); // D6

        const chordStart = now + beat;
        playNote(587.33, chordStart, beat * 4, 0.1);
        playNote(739.99, chordStart, beat * 4, 0.1);
        playNote(880.00, chordStart, beat * 4, 0.05);
        playNote(1174.66, chordStart, beat * 4, 0.05);
    }
}

// Export singleton instance
export const soundGenerator = new SoundGenerator();