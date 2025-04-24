import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Paper, Grid,
  ThemeProvider, createTheme, CssBaseline, useMediaQuery,
  Drawer, IconButton, Slider, FormControlLabel, Switch, Tooltip
} from '@mui/material';
// Need to add some icons
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CloseIcon from '@mui/icons-material/Close';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SurroundSoundIcon from '@mui/icons-material/SurroundSound';
import { getThemeOptions, getBallColors, getFireworksColors, ThemeType } from './themes/themes';
import ThemeSwitcher from './themes/ThemeSwitcher';

function generateLotteryNumbers(name: string, birthday: string): number[] {
  let seed = 0;
  for (let i = 0; i < name.length; i++) seed += name.charCodeAt(i);
  for (let i = 0; i < birthday.length; i++) seed += birthday.charCodeAt(i);
  const numbers = [];
  for (let i = 0; i < 6; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    numbers.push((seed % 49) + 1); // 1-49
  }
  return numbers;
}

const App: React.FC = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('normal');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('lotteryTheme');
    if (savedTheme && ['normal', 'synthwave', 'cyberpunk', 'rainbow'].includes(savedTheme)) {
      setCurrentTheme(savedTheme as ThemeType);
    }
  }, []);
  
  const handleThemeChange = (themeName: ThemeType) => {
    setCurrentTheme(themeName);
    localStorage.setItem('lotteryTheme', themeName);
  };
  
  const theme = React.useMemo(
    () => createTheme(getThemeOptions(currentTheme, prefersDarkMode)),
    [currentTheme, prefersDarkMode],
  );

  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [numbers, setNumbers] = useState<number[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  
  // Sound settings state
  const [soundSettingsOpen, setSoundSettingsOpen] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.7);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [explosionIntensity, setExplosionIntensity] = useState(1.0);
  const [melodicIntensity, setMelodicIntensity] = useState(1.0);
  const [soundPanning, setSoundPanning] = useState(true);
  const [chaosLevel, setChaosLevel] = useState(0.0); // New state for chaos slider
  
  const ballColors = getBallColors(currentTheme, prefersDarkMode);
  const fireworksColors = getFireworksColors(currentTheme, prefersDarkMode);
  
  // Modify the sound functions to use the settings
  const playFireworksSound = () => {
    if (!soundEffectsEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Apply chaos to number of explosions (5-12 based on chaos level)
      const explosionCount = 5 + Math.floor(chaosLevel * 7);
      
      for (let i = 0; i < explosionCount; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const panner = audioContext.createStereoPanner();
        const filter = audioContext.createBiquadFilter();
        
        // Add a distortion effect when chaos is high
        let distortion = null;
        if (chaosLevel > 0.5) {
          distortion = audioContext.createWaveShaper();
          const distortionAmount = chaosLevel * 100;
          
          // Create distortion curve
          const curve = new Float32Array(audioContext.sampleRate);
          for (let j = 0; j < audioContext.sampleRate; j++) {
            const x = j * 2 / audioContext.sampleRate - 1;
            curve[j] = (Math.PI + distortionAmount) * x / (Math.PI + distortionAmount * Math.abs(x));
          }
          
          distortion.curve = curve;
          oscillator.connect(distortion);
          distortion.connect(filter);
        } else {
          oscillator.connect(filter);
        }
        
        filter.connect(panner);
        panner.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Chaos affects oscillator type selection
        const oscillatorTypes: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'square'];
        // Higher chaos = more likely to pick more aggressive waveforms
        const typeIndex = chaosLevel > 0.7 ? 
          Math.floor(Math.random() * 2) + 2 : // More likely sawtooth/square at high chaos
          Math.floor(Math.random() * 4);
        oscillator.type = oscillatorTypes[typeIndex];
        
        // Chaos affects frequency range
        const chaosFreqMultiplier = 1 + (chaosLevel * 3); // 1-4x frequency range with chaos
        const baseFreq = (80 + Math.random() * 120) * (1 + (chaosLevel * (Math.random() - 0.5) * 2));
        
        // Chaos affects timing - more random starts at high chaos
        const timeOffset = i * 0.1 * (1 - chaosLevel * 0.7) + (chaosLevel * Math.random() * 0.5);
        
        oscillator.frequency.setValueAtTime(baseFreq * 2 * chaosFreqMultiplier, audioContext.currentTime + timeOffset);
        oscillator.frequency.exponentialRampToValueAtTime(
          baseFreq * 0.5, 
          audioContext.currentTime + timeOffset + 0.4 * (1 + chaosLevel)
        );
        
        // Chaos affects filter characteristics
        filter.type = chaosLevel > 0.6 ? 
          (Math.random() > 0.5 ? 'bandpass' : 'highpass') : 
          'lowpass';
        
        const filterFreqStart = 800 + Math.random() * 1000 * (1 + chaosLevel * 5);
        filter.frequency.setValueAtTime(filterFreqStart, audioContext.currentTime + timeOffset);
        filter.frequency.exponentialRampToValueAtTime(
          100 * (1 + chaosLevel * 3), 
          audioContext.currentTime + timeOffset + 0.5
        );
        
        // Chaos affects filter resonance
        filter.Q.value = 5 + Math.random() * 10 * (1 + chaosLevel * 2);
        
        // Apply sound panning setting with chaos affecting panning range
        const panningAmount = soundPanning ? (Math.random() * 2 - 1) * (1 + chaosLevel * 0.5) : 0;
        // Clamp panning between -1 and 1
        panner.pan.setValueAtTime(
          Math.max(-1, Math.min(1, panningAmount)),
          audioContext.currentTime + timeOffset
        );
        
        // Apply volume and intensity settings with chaos affecting dynamics
        const randomVolumeFactor = 0.1 + Math.random() * 0.15 * (1 + chaosLevel);
        const calculatedGain = soundVolume * randomVolumeFactor * explosionIntensity;
        
        // Chaos affects attack and release times
        const attackTime = chaosLevel > 0.5 ? 
          0.01 + Math.random() * 0.1 * chaosLevel : 
          0.05;
          
        const releaseTime = 0.4 + Math.random() * 0.3 * (1 + chaosLevel * 2);
        
        gainNode.gain.setValueAtTime(0.01, audioContext.currentTime + timeOffset);
        gainNode.gain.exponentialRampToValueAtTime(
          calculatedGain, 
          audioContext.currentTime + timeOffset + attackTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.001, 
          audioContext.currentTime + timeOffset + releaseTime
        );
        
        // Chaos affects sound duration
        const duration = 0.8 * (1 + chaosLevel * 1.5);
        oscillator.start(audioContext.currentTime + timeOffset);
        oscillator.stop(audioContext.currentTime + timeOffset + duration);
        
        // Add noise bursts with increasing chaos
        if (i % 2 === 0 || chaosLevel > 0.3) {
          const noiseLength = 0.2 * (1 + chaosLevel);
          const bufferSize = audioContext.sampleRate * noiseLength;
          const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          
          // Chaos affects noise character
          for (let j = 0; j < bufferSize; j++) {
            // Higher chaos = more extreme noise values
            const noiseFactor = chaosLevel > 0.7 ? 
              2.5 : // More extreme at high chaos
              2;
            data[j] = (Math.random() * noiseFactor - noiseFactor/2);
          }
          
          const noise = audioContext.createBufferSource();
          noise.buffer = noiseBuffer;
          
          const noiseFilter = audioContext.createBiquadFilter();
          const noiseGain = audioContext.createGain();
          
          // Add resonance to noise at high chaos
          if (chaosLevel > 0.6) {
            const resonanceFilter = audioContext.createBiquadFilter();
            resonanceFilter.type = 'peaking';
            resonanceFilter.frequency.value = 1000 + Math.random() * 3000;
            resonanceFilter.Q.value = 15 + chaosLevel * 20;
            resonanceFilter.gain.value = 10 + chaosLevel * 15;
            
            noise.connect(resonanceFilter);
            resonanceFilter.connect(noiseFilter);
          } else {
            noise.connect(noiseFilter);
          }
          
          noiseFilter.connect(noiseGain);
          noiseGain.connect(audioContext.destination);
          
          // Chaos affects noise filter type
          noiseFilter.type = chaosLevel > 0.5 ? 
            ['bandpass', 'highpass', 'lowpass'][Math.floor(Math.random() * 3)] as BiquadFilterType : 
            'bandpass';
            
          // Chaos affects filter frequency
          noiseFilter.frequency.value = 300 + Math.random() * 1000 * (1 + chaosLevel * 4);
          noiseFilter.Q.value = 1 + chaosLevel * 10;
          
          // Apply volume and intensity settings to noise with chaos
          const noiseCalculatedGain = soundVolume * (0.1 + Math.random() * 0.15 * (1 + chaosLevel * 2)) * explosionIntensity;
          
          noiseGain.gain.setValueAtTime(0, audioContext.currentTime + timeOffset);
          noiseGain.gain.linearRampToValueAtTime(
            noiseCalculatedGain, 
            audioContext.currentTime + timeOffset + 0.01
          );
          noiseGain.gain.exponentialRampToValueAtTime(
            0.001, 
            audioContext.currentTime + timeOffset + 0.15 * (1 + chaosLevel)
          );
          
          noise.start(audioContext.currentTime + timeOffset);
          noise.stop(audioContext.currentTime + timeOffset + noiseLength);
        }
      }
      
      // Add extra chaotic elements at high chaos levels
      if (chaosLevel > 0.8) {
        // Create a reversed cymbal crash effect
        const reverseCrashLength = 1.5;
        const reverseCrashBuffer = audioContext.createBuffer(1, audioContext.sampleRate * reverseCrashLength, audioContext.sampleRate);
        const reverseCrashData = reverseCrashBuffer.getChannelData(0);
        
        for (let i = 0; i < reverseCrashData.length; i++) {
          // Exponential decay from end to start (will be played in reverse)
          const amplitude = Math.pow(i / reverseCrashData.length, 2) * 0.5;
          reverseCrashData[i] = (Math.random() * 2 - 1) * amplitude;
        }
        
        const reverseCrash = audioContext.createBufferSource();
        reverseCrash.buffer = reverseCrashBuffer;
        
        const crashFilter = audioContext.createBiquadFilter();
        const crashGain = audioContext.createGain();
        
        reverseCrash.connect(crashFilter);
        crashFilter.connect(crashGain);
        crashGain.connect(audioContext.destination);
        
        crashFilter.type = 'highpass';
        crashFilter.frequency.value = 2000;
        
        crashGain.gain.setValueAtTime(0, audioContext.currentTime);
        crashGain.gain.linearRampToValueAtTime(
          soundVolume * 0.2 * explosionIntensity, 
          audioContext.currentTime + 0.2
        );
        crashGain.gain.exponentialRampToValueAtTime(
          0.001, 
          audioContext.currentTime + 1.5
        );
        
        reverseCrash.playbackRate.value = 1 + chaosLevel;
        reverseCrash.start(audioContext.currentTime + 0.5);
      }
    } catch (e) {
      console.log("Audio playback failed:", e);
    }
  };
  
  const playCelebrationSound = () => {
    if (!soundEffectsEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Chaos affects the note selection - potentially wilder or more dissonant at high chaos
      const notes = chaosLevel > 0.7 ?
        // More dissonant note choices at high chaos
        [
          [261.63, 311.13, 392.00, 466.16, 622.25, 783.99],
          [277.18, 369.99, 415.30, 554.37, 698.46, 932.33],
          [349.23, 415.30, 523.25, 622.25, 880.00, 1046.50],
          [392.00, 466.16, 587.33, 698.46, 932.33, 1174.66]
        ] :
        // Standard harmonious chord progression
        [
          [261.63, 329.63, 392.00, 523.25, 659.25, 783.99],
          [293.66, 369.99, 440.00, 587.33, 698.46, 880.00],
          [349.23, 440.00, 523.25, 698.46, 880.00, 1046.50],
          [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66]
        ];
      
      // Chaos affects the chord progression timing
      const chordTiming = 0.25 * (1 + chaosLevel * (Math.random() > 0.5 ? 0.5 : -0.3));
      const noteTiming = 0.05 * (1 + chaosLevel * (Math.random() > 0.5 ? 0.8 : -0.3));
      
      notes.forEach((chordNotes, chordIndex) => {
        // Chaos affects which notes are played in each chord
        const notesToPlay = chaosLevel > 0.5 ?
          // At high chaos, randomly skip some notes for more unpredictable patterns
          chordNotes.filter(() => Math.random() > chaosLevel * 0.3) :
          chordNotes;
        
        notesToPlay.forEach((freq, noteIndex) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const panner = audioContext.createStereoPanner();
          
          // Apply chaos to oscillator routing
          if (chaosLevel > 0.8 && Math.random() > 0.7) {
            // Add distortion to some notes at high chaos
            const distortion = audioContext.createWaveShaper();
            const curve = new Float32Array(audioContext.sampleRate);
            for (let i = 0; i < audioContext.sampleRate; i++) {
              const x = i * 2 / audioContext.sampleRate - 1;
              curve[i] = Math.max(-1, Math.min(1, x * 3 * (1 + chaosLevel)));
            }
            distortion.curve = curve;
            
            oscillator.connect(distortion);
            distortion.connect(panner);
          } else {
            oscillator.connect(panner);
          }
          
          panner.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Chaos affects oscillator type
          const oscillatorTypes: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'square'];
          oscillator.type = chaosLevel > 0.6 ?
            oscillatorTypes[Math.floor(Math.random() * oscillatorTypes.length)] :
            ['sine', 'triangle'][Math.floor(Math.random() * 2)] as OscillatorType;
          
          // Chaos affects frequency - add slight detuning at higher chaos
          const detune = chaosLevel > 0.4 ? (Math.random() * 2 - 1) * chaosLevel * 30 : 0;
          oscillator.frequency.value = freq * (1 + detune/1200); // Convert cents to frequency ratio
          
          // Apply sound panning with chaos affecting the stereo width
          const panRange = 1 + chaosLevel * 0.5; // Wider stereo at high chaos
          panner.pan.value = soundPanning ? 
            Math.max(-1, Math.min(1, ((noteIndex / notesToPlay.length) * 2 - 1) * panRange)) : 
            0;
          
          // Chaos affects timing of notes - more random at high chaos
          const randomOffset = chaosLevel > 0.6 ? (Math.random() * chaosLevel * 0.2) : 0;
          const startTime = audioContext.currentTime + chordIndex * chordTiming;
          const noteDelay = noteIndex * noteTiming + randomOffset;
          
          // Apply volume and melodic intensity with chaos affecting dynamics
          const dynamicVariation = 1 + (chaosLevel * (Math.random() - 0.5) * 0.6);
          const calculatedGain = soundVolume * 
            (0.08 + (noteIndex / notesToPlay.length) * 0.1) * 
            melodicIntensity * 
            dynamicVariation;
          
          // Chaos affects envelope shape
          const attackTime = 0.05 * (1 + chaosLevel * (Math.random() * 0.6));
          const releaseTime = 0.5 + (chaosLevel > 0.7 ? 
            Math.random() * chaosLevel * 0.8 : 
            (notesToPlay.length - noteIndex) * 0.1);
          
          gainNode.gain.setValueAtTime(0, startTime + noteDelay);
          gainNode.gain.linearRampToValueAtTime(
            calculatedGain, 
            startTime + noteDelay + attackTime
          );
          
          // Add wobble/vibrato at high chaos levels
          if (chaosLevel > 0.5 && Math.random() > 0.6) {
            const vibratoRate = 4 + Math.random() * 8 * chaosLevel;
            const vibratoDepth = 10 * chaosLevel;
            
            for (let i = 0; i < 20; i++) {
              const vibratoTime = startTime + noteDelay + attackTime + (i / vibratoRate);
              if (vibratoTime < startTime + noteDelay + releaseTime - 0.05) {
                const vibratoValue = Math.sin(i * Math.PI * 2 / 5) * vibratoDepth;
                oscillator.frequency.setValueAtTime(
                  freq * (1 + vibratoValue/1200), 
                  vibratoTime
                );
              }
            }
          }
          
          gainNode.gain.exponentialRampToValueAtTime(
            0.001, 
            startTime + noteDelay + releaseTime
          );
          
          oscillator.start(startTime + noteDelay);
          oscillator.stop(startTime + noteDelay + releaseTime + 0.1);
          
          // Add tremolo effect to some notes, more likely at high chaos
          if ((noteIndex % 2 === 0 || (chaosLevel > 0.4 && Math.random() > 0.5))) {
            const tremoloFreq = 8 + Math.random() * 5 * (1 + chaosLevel);
            const tremoloDepth = 0.2 + Math.random() * 0.2 * (1 + chaosLevel);
            
            for (let i = 0; i < 20; i++) {
              const modulationTime = startTime + noteDelay + (i * (1/tremoloFreq));
              if (modulationTime < startTime + noteDelay + releaseTime - 0.05) {
                const value = calculatedGain * (1 - tremoloDepth * (i % 2));
                gainNode.gain.setValueAtTime(value, modulationTime);
              }
            }
          }
        });
        
        // Add noise bursts between chords at higher chaos
        if (chordIndex % 2 === 0 || (chaosLevel > 0.5 && Math.random() > 0.5)) {
          const noiseLength = 1.0 * (1 + chaosLevel * 0.5);
          const bufferSize = audioContext.sampleRate * noiseLength;
          const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          
          // Chaos affects noise character
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (chaosLevel > 0.7 ? 1.5 : 1);
          }
          
          const noise = audioContext.createBufferSource();
          noise.buffer = noiseBuffer;
          
          const filterType = chaosLevel > 0.6 ? 
            (Math.random() > 0.5 ? 'bandpass' : 'highpass') : 
            'highpass';
          
          const noiseFilter = audioContext.createBiquadFilter();
          noiseFilter.type = filterType as BiquadFilterType;
          
          // Chaos affects filter frequency
          noiseFilter.frequency.value = 8000 - (chaosLevel > 0.5 ? Math.random() * 5000 * chaosLevel : 0);
          noiseFilter.Q.value = 1 + chaosLevel * 5;
          
          const gainNode = audioContext.createGain();
          
          noise.connect(noiseFilter);
          noiseFilter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          const startTime = audioContext.currentTime + chordIndex * chordTiming;
          const noiseVolume = 0.06 * soundVolume * (1 + chaosLevel * 0.5) * melodicIntensity;
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(noiseVolume, startTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
          
          noise.start(startTime);
          noise.stop(startTime + noiseLength);
        }
      });
      
      // Add final burst at the end, more dramatic with high chaos
      setTimeout(() => {
        const finalContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Number of oscillators increases with chaos
        const oscillatorCount = 10 + Math.floor(chaosLevel * 10);
        
        for (let i = 0; i < oscillatorCount; i++) {
          const osc = finalContext.createOscillator();
          const gain = finalContext.createGain();
          const filter = finalContext.createBiquadFilter();
          const panner = finalContext.createStereoPanner();
          
          osc.connect(filter);
          filter.connect(panner);
          panner.connect(gain);
          gain.connect(finalContext.destination);
          
          // Chaos affects oscillator type
          const oscTypes: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'square'];
          osc.type = chaosLevel > 0.7 ?
            oscTypes[Math.floor(Math.random() * oscTypes.length)] :
            ['sine', 'triangle', 'sawtooth'][Math.floor(Math.random() * 3)] as OscillatorType;
          
          // Chaos affects frequency spread
          const freqRange = 200 * (1 + chaosLevel * 3);
          osc.frequency.value = 100 + i * 100 + Math.random() * freqRange;
          
          // Chaos affects filter characteristics
          filter.type = chaosLevel > 0.6 ?
            ['bandpass', 'lowpass', 'highpass', 'peaking'][Math.floor(Math.random() * 4)] as BiquadFilterType :
            'bandpass';
            
          filter.frequency.value = 500 + i * 300 * (1 + chaosLevel);
          filter.Q.value = 1 + chaosLevel * 10;
          
          // Chaos affects stereo positioning
          panner.pan.value = soundPanning ?
            (Math.random() * 2 - 1) * (1 + chaosLevel * 0.2) :
            0;
          
          // Chaos affects envelope
          const attackTime = 0.05 * (1 + chaosLevel * 0.5);
          const releaseTime = 0.2 + Math.random() * 0.3 * (1 + chaosLevel);
          
          gain.gain.setValueAtTime(0, finalContext.currentTime);
          gain.gain.linearRampToValueAtTime(
            soundVolume * 0.1 * melodicIntensity * (1 + chaosLevel * 0.3), 
            finalContext.currentTime + attackTime
          );
          gain.gain.exponentialRampToValueAtTime(
            0.001, 
            finalContext.currentTime + releaseTime
          );
          
          osc.start(finalContext.currentTime);
          osc.stop(finalContext.currentTime + releaseTime + 0.1);
        }
        
        // Add a final deep bass note, more intense at higher chaos
        const bassOsc = finalContext.createOscillator();
        const bassGain = finalContext.createGain();
        const bassFilter = finalContext.createBiquadFilter();
        
        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(finalContext.destination);
        
        // Chaos affects bass character
        bassOsc.type = chaosLevel > 0.6 ? 'square' : 'sine';
        
        const bassDuration = 0.8 * (1 + chaosLevel * 0.5);
        const bassFreqStart = 150 - chaosLevel * 50;
        const bassFreqEnd = 40 - chaosLevel * 10;
        
        bassOsc.frequency.setValueAtTime(bassFreqStart, finalContext.currentTime);
        bassOsc.frequency.exponentialRampToValueAtTime(
          bassFreqEnd, 
          finalContext.currentTime + bassDuration
        );
        
        // Chaos affects filter characteristics
        bassFilter.type = 'lowpass';
        bassFilter.frequency.value = 200 * (1 + chaosLevel * 2);
        bassFilter.Q.value = 10 * (1 + chaosLevel * 2);
        
        // Chaos affects volume
        const bassVolume = soundVolume * 0.25 * (1 + chaosLevel * 0.5) * melodicIntensity;
        
        bassGain.gain.setValueAtTime(0, finalContext.currentTime);
        bassGain.gain.linearRampToValueAtTime(
          bassVolume, 
          finalContext.currentTime + 0.05
        );
        bassGain.gain.exponentialRampToValueAtTime(
          0.001, 
          finalContext.currentTime + bassDuration
        );
        
        bassOsc.start(finalContext.currentTime);
        bassOsc.stop(finalContext.currentTime + bassDuration);
        
        // Add a chaotic crash at highest chaos
        if (chaosLevel > 0.8) {
          const crashNoise = finalContext.createBufferSource();
          const crashBuffer = finalContext.createBuffer(1, finalContext.sampleRate * 1.5, finalContext.sampleRate);
          const crashData = crashBuffer.getChannelData(0);
          
          for (let i = 0; i < crashData.length; i++) {
            // Create a rapidly decaying noise
            crashData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (finalContext.sampleRate * 0.3));
          }
          
          crashNoise.buffer = crashBuffer;
          
          const crashFilter = finalContext.createBiquadFilter();
          const crashGain = finalContext.createGain();
          
          crashNoise.connect(crashFilter);
          crashFilter.connect(crashGain);
          crashGain.connect(finalContext.destination);
          
          crashFilter.type = 'highpass';
          crashFilter.frequency.value = 6000;
          
          crashGain.gain.setValueAtTime(0, finalContext.currentTime);
          crashGain.gain.linearRampToValueAtTime(
            soundVolume * 0.15 * melodicIntensity, 
            finalContext.currentTime + 0.01
          );
          crashGain.gain.exponentialRampToValueAtTime(
            0.001, 
            finalContext.currentTime + 1.2
          );
          
          crashNoise.start(finalContext.currentTime);
          crashNoise.stop(finalContext.currentTime + 1.5);
        }
      }, 1200);
      
    } catch (e) {
      console.log("Audio playback failed:", e);
    }
  };
  
  const playSoundEffects = () => {
    playFireworksSound();
    setTimeout(() => {
      playCelebrationSound();
      setTimeout(() => {
        playFireworksSound();
      }, 800);
      setTimeout(() => {
        playCelebrationSound();
      }, 1500);
      setTimeout(() => {
        playFireworksSound();
        playCelebrationSound();
      }, 2800);
    }, 300);
  };

  const getRandomBalls = () => {
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 49) + 1);
  };

  const fireworksCount = 80;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && birthday) {
      setLoading(true);
      setSubmitted(false);
      setShowFireworks(false);
      
      let shuffleCount = 0;
      const maxShuffles = 10;
      const shuffleInterval = setInterval(() => {
        if (shuffleCount >= maxShuffles) {
          clearInterval(shuffleInterval);
          setNumbers(generateLotteryNumbers(name, birthday));
          setLoading(false);
          setSubmitted(true);
          
          setTimeout(() => {
            setShowFireworks(true);
            playSoundEffects();
            setTimeout(() => {
              setShowFireworks(false);
            }, 6000);
          }, 800);
        } else {
          setNumbers(getRandomBalls());
          shuffleCount++;
        }
      }, 120);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {showFireworks && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 100,
          background: 'rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}>
          {Array.from({ length: fireworksCount }).map((_, idx) => {
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 60 + 20;
            const randomScale = Math.random() * 1.5 + 0.5;
            const randomDelay = Math.random() * 3;
            const randomDuration = 0.8 + Math.random() * 1.2;
            const randomColor = fireworksColors[Math.floor(Math.random() * fireworksColors.length)];
            const particleCount = 12 + Math.floor(Math.random() * 12);
            const extraLarge = Math.random() > 0.8;
            
            return (
              <Box
                key={idx}
                sx={{
                  position: 'absolute',
                  left: `${randomX}%`,
                  top: `${randomY}%`,
                  width: extraLarge ? '10px' : '7px', 
                  height: extraLarge ? '10px' : '7px',
                  borderRadius: '50%',
                  backgroundColor: randomColor,
                  boxShadow: `0 0 30px 5px ${randomColor}`,
                  transform: 'scale(0)',
                  filter: 'blur(0.5px)',
                  animation: `firework ${randomDuration}s forwards ${randomDelay}s`,
                  '@keyframes firework': {
                    '0%': {
                      transform: 'scale(0)',
                      opacity: 1,
                      boxShadow: `0 0 ${extraLarge ? '60px' : '30px'} 8px ${randomColor}`,
                    },
                    '40%': {
                      opacity: 0.8,
                    },
                    '100%': {
                      transform: `scale(${randomScale * (extraLarge ? 2 : 1)})`,
                      opacity: 0,
                      boxShadow: `0 0 0px 0px ${randomColor}`,
                    }
                  }
                }}
              >
                {Array.from({ length: particleCount }).map((_, particleIdx) => {
                  const angle = (particleIdx / particleCount) * Math.PI * 2;
                  const distance = 40 + Math.random() * 80;
                  const particleSize = 1 + Math.random() * 4;
                  const particleDelay = randomDelay + Math.random() * 0.3;
                  const particleColor = Math.random() > 0.3 ? randomColor : fireworksColors[Math.floor(Math.random() * fireworksColors.length)];
                  
                  return (
                    <Box
                      key={particleIdx}
                      sx={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: particleSize,
                        height: particleSize,
                        backgroundColor: particleColor,
                        boxShadow: `0 0 ${particleSize * 2}px ${particleSize/2}px ${particleColor}`,
                        borderRadius: '50%',
                        filter: 'blur(0.5px)',
                        animation: `fireworkParticle ${randomDuration * 1.2}s ease-out forwards ${particleDelay}s`,
                        '@keyframes fireworkParticle': {
                          '0%': {
                            transform: 'translate(-50%, -50%) scale(1)',
                            opacity: 1,
                          },
                          '70%': {
                            opacity: 0.6,
                          },
                          '100%': {
                            transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0)`,
                            opacity: 0,
                          }
                        }
                      }}
                    />
                  );
                })}
                {extraLarge && Array.from({ length: 8 }).map((_, sparkleIdx) => {
                  const sparkleDelay = randomDelay + 0.1 + Math.random() * 0.3;
                  const sparkleDistance = 15 + Math.random() * 25;
                  const sparkleAngle = Math.random() * Math.PI * 2;
                  
                  return (
                    <Box
                      key={`sparkle-${sparkleIdx}`}
                      sx={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: '2px',
                        height: '2px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        filter: 'blur(0.3px)',
                        boxShadow: '0 0 5px 2px white',
                        animation: `sparkle 0.6s ease-out forwards ${sparkleDelay}s`,
                        '@keyframes sparkle': {
                          '0%': {
                            transform: 'translate(-50%, -50%) scale(0)',
                            opacity: 1,
                          },
                          '90%': {
                            opacity: 0.8,
                          },
                          '100%': {
                            transform: `translate(calc(-50% + ${Math.cos(sparkleAngle) * sparkleDistance}px), calc(-50% + ${Math.sin(sparkleAngle) * sparkleDistance}px)) scale(3)`,
                            opacity: 0,
                          }
                        }
                      }}
                    />
                  );
                })}
              </Box>
            );
          })}
          {Array.from({ length: 100 }).map((_, idx) => {
            const randomX = Math.random() * 100;
            const randomDelay = Math.random() * 2;
            const randomDuration = 3 + Math.random() * 3;
            const randomColor = fireworksColors[Math.floor(Math.random() * fireworksColors.length)];
            const size = 4 + Math.random() * 6;
            const isRect = Math.random() > 0.5;
            
            return (
              <Box
                key={`confetti-${idx}`}
                sx={{
                  position: 'absolute',
                  left: `${randomX}%`,
                  top: '-5%',
                  width: isRect ? `${size}px` : `${size/2}px`,
                  height: isRect ? `${size/2}px` : `${size}px`,
                  backgroundColor: randomColor,
                  opacity: 0.7,
                  borderRadius: '1px',
                  animation: `confetti ${randomDuration}s linear forwards ${randomDelay}s`,
                  '@keyframes confetti': {
                    '0%': {
                      transform: 'rotate(0deg) translateY(0)',
                      opacity: 0,
                    },
                    '10%': {
                      opacity: 0.7,
                    },
                    '100%': {
                      transform: `rotate(${360 * (Math.random() > 0.5 ? 1 : -1)}deg) translateY(${window.innerHeight}px)`,
                      opacity: 0,
                    }
                  }
                }}
              />
            );
          })}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'white',
              opacity: 0,
              animation: 'flash 0.8s ease-out forwards',
              '@keyframes flash': {
                '0%': { opacity: 0 },
                '10%': { opacity: 0.3 },
                '100%': { opacity: 0 }
              }
            }}
          />
        </Box>
      )}
      <Container 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
          mx: 'auto',
          position: 'relative',
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16, 
          zIndex: 10 
        }}>
          <ThemeSwitcher 
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
          />
        </Box>
        
        {/* Sound Settings Button */}
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          left: 16, 
          zIndex: 10 
        }}>
          <Tooltip title="Sound Settings">
            <IconButton 
              onClick={() => setSoundSettingsOpen(true)}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': { 
                  bgcolor: 'background.paper',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s'
              }}
            >
              <VolumeUpIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Sound Settings Drawer */}
        <Drawer
          anchor="left"
          open={soundSettingsOpen}
          onClose={() => setSoundSettingsOpen(false)}
        >
          <Box sx={{ 
            width: 300, 
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3 
            }}>
              <Typography variant="h6" component="div">
                Sound Settings
              </Typography>
              <IconButton onClick={() => setSoundSettingsOpen(false)} edge="end">
                <CloseIcon />
              </IconButton>
            </Box>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={soundEffectsEnabled}
                  onChange={(e) => setSoundEffectsEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Sound Effects"
              sx={{ mb: 3 }}
            />
            
            <Typography gutterBottom>
              Master Volume
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <VolumeUpIcon sx={{ mr: 2, opacity: 0.7 }} />
              <Slider
                value={soundVolume}
                onChange={(_, value) => setSoundVolume(value as number)}
                min={0}
                max={1}
                step={0.01}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                disabled={!soundEffectsEnabled}
              />
            </Box>
            
            <Typography gutterBottom>
              Explosion Intensity
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SurroundSoundIcon sx={{ mr: 2, opacity: 0.7 }} />
              <Slider
                value={explosionIntensity}
                onChange={(_, value) => setExplosionIntensity(value as number)}
                min={0.1}
                max={2.0}
                step={0.1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value.toFixed(1)}x`}
                disabled={!soundEffectsEnabled}
              />
            </Box>
            
            <Typography gutterBottom>
              Melodic Intensity
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <MusicNoteIcon sx={{ mr: 2, opacity: 0.7 }} />
              <Slider
                value={melodicIntensity}
                onChange={(_, value) => setMelodicIntensity(value as number)}
                min={0.1}
                max={2.0}
                step={0.1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value.toFixed(1)}x`}
                disabled={!soundEffectsEnabled}
              />
            </Box>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={soundPanning}
                  onChange={(e) => setSoundPanning(e.target.checked)}
                  color="primary"
                  disabled={!soundEffectsEnabled}
                />
              }
              label="Stereo Sound (Panning)"
              sx={{ mb: 2 }}
            />
            
            {/* New Chaos Level Slider */}
            <Typography gutterBottom>
              Chaos Level
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Slider
                value={chaosLevel}
                onChange={(_, value) => setChaosLevel(value as number)}
                min={0}
                max={1}
                step={0.01}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                disabled={!soundEffectsEnabled}
              />
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => {
                playSoundEffects();
              }}
              disabled={!soundEffectsEnabled}
              fullWidth
              sx={{ mt: 2 }}
            >
              Test Sound
            </Button>
          </Box>
        </Drawer>
        
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4,
            borderRadius: 4,
            width: '100%',
            maxWidth: 'sm',
            background: (theme) => theme.palette.mode === 'dark' || ['synthwave', 'cyberpunk'].includes(currentTheme)
              ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(0,0,0,0.3) 100%)`
              : currentTheme === 'rainbow'
                ? 'linear-gradient(135deg, rgba(255,0,0,0.1), rgba(255,127,0,0.1), rgba(255,255,0,0.1), rgba(0,255,0,0.1), rgba(0,0,255,0.1), rgba(75,0,130,0.1), rgba(148,0,211,0.1))'
                : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper} 100%)`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            transition: 'all 0.5s ease',
          }}
        >
          <Typography 
            variant="h4" 
            align="center" 
            gutterBottom
            sx={{ 
              mb: 3, 
              color: 'primary.main',
              fontWeight: 'bold',
              textShadow: theme => 
                currentTheme === 'synthwave' 
                  ? '0 0 5px #ff71ce, 0 0 10px #01cdfe, 0 0 15px #05ffa1'
                  : currentTheme === 'cyberpunk'
                    ? '0 0 5px #fcee09, 0 0 10px #ff003c' 
                    : currentTheme === 'rainbow'
                      ? '0 0 1px rgba(0,0,0,0.5)'
                      : '0px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            ✨ Lucky Lottery Numbers ✨
          </Typography>
          
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              mt: 2,
              '& .MuiTextField-root': { mb: 3 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&.Mui-focused fieldset': {
                  borderWidth: 2,
                }
              }
            }}
          >
            <TextField
              label="Your Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              variant="outlined"
              required
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            
            <TextField
              label="Your Birthday"
              type="date"
              value={birthday}
              onChange={e => setBirthday(e.target.value)}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              required
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ 
                mt: 2, 
                py: 1.5,
                boxShadow: theme => 
                  currentTheme === 'synthwave'
                    ? '0 0 10px #ff71ce, 0 0 20px #01cdfe'
                    : currentTheme === 'cyberpunk'
                      ? '0 0 10px #fcee09, 0 0 20px #ff003c'
                      : '0 4px 12px rgba(63, 81, 181, 0.4)',
                '&:hover': {
                  boxShadow: theme =>
                    currentTheme === 'synthwave'
                      ? '0 0 15px #ff71ce, 0 0 30px #01cdfe'
                      : currentTheme === 'cyberpunk'
                        ? '0 0 15px #fcee09, 0 0 30px #ff003c'
                        : '0 6px 14px rgba(63, 81, 181, 0.6)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease',
                background: theme => 
                  currentTheme === 'rainbow'
                    ? 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)'
                    : undefined,
                backgroundSize: '200% auto',
                animation: theme => 
                  currentTheme === 'rainbow' 
                    ? 'rainbow 3s linear infinite'
                    : undefined,
                '@keyframes rainbow': {
                  '0%': { backgroundPosition: '0% 50%' },
                  '100%': { backgroundPosition: '200% 50%' },
                }
              }}
            >
              {loading ? 'Shuffling Numbers...' : 'Generate My Lucky Numbers'}
            </Button>
          </Box>
          
          {(loading || submitted) && numbers && (
            <Box 
              sx={{ 
                mt: 5,
                pt: 3,
                borderTop: '1px solid',
                borderColor: 'divider',
                animation: 'fadeIn 0.6s ease-out',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'translateY(20px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                }
              }}
            >
              <Typography 
                variant="h6" 
                align="center" 
                gutterBottom
                sx={{ 
                  mb: 3, 
                  fontWeight: 500,
                  textShadow: theme => 
                    currentTheme === 'synthwave' 
                      ? '0 0 5px #ff71ce'
                      : currentTheme === 'cyberpunk'
                        ? '0 0 5px #fcee09'
                        : 'none'
                }}
              >
                {loading ? 'Shuffling Your Numbers...' : 'Your Personal Lucky Numbers:'}
              </Typography>
              
              <Grid container spacing={2} justifyContent="center">
                {numbers.map((num, idx) => (
                  <Grid item key={idx}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: ballColors[idx % ballColors.length],
                        color: 'white',
                        fontSize: 24,
                        fontWeight: 'bold',
                        boxShadow: theme => 
                          currentTheme === 'synthwave'
                            ? `0 0 10px ${ballColors[idx % ballColors.length]}`
                            : currentTheme === 'cyberpunk'
                              ? `0 0 15px ${ballColors[idx % ballColors.length]}`
                              : '0 4px 10px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                        animation: loading 
                          ? `${idx % 2 === 0 ? 'rumble1' : 'rumble2'} 0.5s infinite` 
                          : `popIn 0.5s ease-out ${idx * 0.1 + 0.2}s both`,
                        '@keyframes rumble1': {
                          '0%': { transform: 'translateY(0) rotate(0deg)' },
                          '25%': { transform: 'translateY(-6px) rotate(-5deg)' },
                          '50%': { transform: 'translateY(0) rotate(0deg)' },
                          '75%': { transform: 'translateY(6px) rotate(5deg)' },
                          '100%': { transform: 'translateY(0) rotate(0deg)' }
                        },
                        '@keyframes rumble2': {
                          '0%': { transform: 'translateY(0) rotate(0deg)' },
                          '25%': { transform: 'translateY(6px) rotate(5deg)' },
                          '50%': { transform: 'translateY(0) rotate(0deg)' },
                          '75%': { transform: 'translateY(-6px) rotate(-5deg)' },
                          '100%': { transform: 'translateY(0) rotate(0deg)' }
                        },
                        '@keyframes popIn': {
                          '0%': { 
                            opacity: 0,
                            transform: 'scale(0.5)'
                          },
                          '70%': {
                            transform: 'scale(1.1)'
                          },
                          '100%': {
                            opacity: 1,
                            transform: 'scale(1)'
                          }
                        },
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: theme =>
                            currentTheme === 'synthwave'
                              ? `0 0 15px ${ballColors[idx % ballColors.length]}, 0 0 30px ${ballColors[idx % ballColors.length]}`
                              : currentTheme === 'cyberpunk'
                                ? `0 0 20px ${ballColors[idx % ballColors.length]}`
                                : '0 6px 14px rgba(0,0,0,0.3)',
                        }
                      }}
                    >
                      {num}
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Typography 
                variant="body2" 
                align="center" 
                color="textSecondary"
                sx={{ 
                  mt: 4, 
                  fontStyle: 'italic',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Determining your lucky numbers...' : 'Based on your name and birthday - Good luck!'}
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default App;
