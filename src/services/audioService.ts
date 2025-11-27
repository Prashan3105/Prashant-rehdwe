
// Advanced Web Audio API wrapper for procedural sound generation

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

// Background Music State
let bgOscillators: OscillatorNode[] = [];
let bgGain: GainNode | null = null;

// Helper: Resume context if suspended (Browser Autoplay Policy)
export const initAudio = () => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(e => console.error("Audio resume failed", e));
  }
};

const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1, slideTo: number | null = null) => {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + duration);
  }
  
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

// Generates a bubbly water sound
const playWaterSound = () => {
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.linearRampToValueAtTime(200, t + 0.2);

    // Lowpass filter to simulate underwater/liquid muffling
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.linearRampToValueAtTime(100, t + 0.2);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(t + 0.2);

    // Add a secondary bubble pop
    setTimeout(() => playTone(800, 'sine', 0.05, 0.05), 50);
};

export const vibrate = (ms: number, enabled: boolean) => {
  if (enabled && navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

export const playBackgroundMusic = (enabled: boolean) => {
  if (!enabled) {
    stopBackgroundMusic();
    return;
  }
  
  if (bgOscillators.length > 0) return; // Already playing

  initAudio();

  // Create an Ambient Drone
  bgGain = audioCtx.createGain();
  bgGain.gain.value = 0.03; // Very subtle volume
  bgGain.connect(audioCtx.destination);

  // Ethereal Chord: E Major 9 (E, G#, B, D#, F#)
  const freqs = [164.81, 207.65, 246.94, 311.13, 369.99]; 
  
  freqs.forEach((f) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    
    // Slow LFO for movement
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1 + Math.random() * 0.1;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 2; // subtle vibrato
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    osc.connect(bgGain!);
    osc.start();
    bgOscillators.push(osc);
    bgOscillators.push(lfo); // Keep track to stop later
  });
};

export const stopBackgroundMusic = () => {
  bgOscillators.forEach(osc => {
    try { osc.stop(); } catch(e) {}
  });
  bgOscillators = [];
  if (bgGain) {
    bgGain.disconnect();
    bgGain = null;
  }
};

export const playSound = (type: 'select' | 'pour' | 'win' | 'error' | 'flip' | 'match' | 'tick' | 'pop', enabled: boolean) => {
  if (!enabled) return;
  initAudio();

  try {
    const now = audioCtx.currentTime;

    switch (type) {
      case 'select': 
        // Crisp UI Click
        playTone(600, 'sine', 0.05, 0.05); 
        break;
        
      case 'flip':
        playTone(400, 'triangle', 0.1, 0.05, 600);
        break;
        
      case 'pour': 
        playWaterSound();
        break;
        
      case 'error': 
        // Low buzzing thud
        playTone(150, 'sawtooth', 0.15, 0.1, 100); 
        break;
        
      case 'tick':
        // Clock tick
        playTone(1000, 'square', 0.03, 0.02);
        break;
        
      case 'pop':
        // Cork pop: Rapid upward pitch sweep + rapid decay
        playTone(200, 'sine', 0.08, 0.2, 500);
        break;
        
      case 'match':
        // High ping
        playTone(880, 'sine', 0.2, 0.1);
        break;

      case 'win': 
        // Major Chord Arpeggio (C Major)
        const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        chord.forEach((freq, i) => {
             setTimeout(() => {
                 const osc = audioCtx.createOscillator();
                 const gain = audioCtx.createGain();
                 osc.type = 'triangle';
                 osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                 gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                 gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
                 osc.connect(gain);
                 gain.connect(audioCtx.destination);
                 osc.start();
                 osc.stop(audioCtx.currentTime + 0.6);
             }, i * 80);
        });
        break;
    }
  } catch (e) {
    console.error("Audio play failed", e);
  }
};
    