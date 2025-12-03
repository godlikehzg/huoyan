
// Simple Web Audio API Synthesizer to avoid external assets

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export type SoundType = 'select' | 'success' | 'failure' | 'powerup' | 'timeout' | 'scan' | 'combo';

export const playSound = (type: SoundType) => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'select':
        // Short high-pitched "pop"
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'success':
        // Ascending major arpeggio (Win/Cash register feel)
        osc.type = 'triangle';
        gainNode.gain.value = 0.2;
        
        // C5
        osc.frequency.setValueAtTime(523.25, now);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
        
        // E5
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.setValueAtTime(659.25, now + 0.1);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gain2.gain.linearRampToValueAtTime(0, now + 0.3);
        osc2.start(now);
        osc2.stop(now + 0.4);

        // G5
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'triangle';
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.frequency.setValueAtTime(783.99, now + 0.2);
        gain3.gain.setValueAtTime(0, now);
        gain3.gain.linearRampToValueAtTime(0.2, now + 0.2);
        gain3.gain.linearRampToValueAtTime(0, now + 0.5);
        osc3.start(now);
        osc3.stop(now + 0.6);

        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case 'failure':
        // Descending low buzzer
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'powerup':
        // Sci-fi rising sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.2);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'timeout':
        // Two quick low beeps
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.setValueAtTime(0, now + 0.1);
        gainNode.gain.setValueAtTime(0.2, now + 0.2);
        gainNode.gain.setValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
        
      case 'scan':
        // Mechanical click
        osc.type = 'square';
        osc.frequency.setValueAtTime(2000, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'combo':
        // Bright, energetic ascending major scale sweep with sparkle
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.linearRampToValueAtTime(880, now + 0.2); // A5
        osc.frequency.linearRampToValueAtTime(1760, now + 0.4); // A6
        
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        
        // Add a "sparkle" layer
        const oscS = ctx.createOscillator();
        const gainS = ctx.createGain();
        oscS.type = 'square';
        oscS.connect(gainS);
        gainS.connect(ctx.destination);
        
        oscS.frequency.setValueAtTime(1200, now);
        oscS.frequency.linearRampToValueAtTime(2400, now + 0.1);
        oscS.frequency.linearRampToValueAtTime(1200, now + 0.2);
        oscS.frequency.linearRampToValueAtTime(2400, now + 0.3);
        
        gainS.gain.setValueAtTime(0.05, now);
        gainS.gain.linearRampToValueAtTime(0, now + 0.4);
        
        osc.start(now);
        osc.stop(now + 0.6);
        oscS.start(now);
        oscS.stop(now + 0.4);
        break;
    }
  } catch (e) {
    console.error('Audio play failed', e);
  }
};
