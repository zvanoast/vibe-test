import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Paper, Grid,
  ThemeProvider, createTheme, CssBaseline, useMediaQuery
} from '@mui/material';
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
  
  const ballColors = getBallColors(currentTheme, prefersDarkMode);
  const fireworksColors = getFireworksColors(currentTheme, prefersDarkMode);
  
  const playFireworksSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      for (let i = 0; i < 5; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const panner = audioContext.createStereoPanner();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(panner);
        panner.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = ['sine', 'triangle', 'sawtooth', 'square'][Math.floor(Math.random() * 4)] as OscillatorType;
        const baseFreq = 80 + Math.random() * 120;
        oscillator.frequency.setValueAtTime(baseFreq * 2, audioContext.currentTime + i * 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, audioContext.currentTime + i * 0.1 + 0.4);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 + Math.random() * 1000, audioContext.currentTime + i * 0.1);
        filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + i * 0.1 + 0.5);
        filter.Q.value = 5 + Math.random() * 10;
        
        panner.pan.setValueAtTime((Math.random() * 2 - 1), audioContext.currentTime + i * 0.1);
        
        gainNode.gain.setValueAtTime(0.01, audioContext.currentTime + i * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.1 + Math.random() * 0.15, audioContext.currentTime + i * 0.1 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + i * 0.1 + 0.4 + Math.random() * 0.3);
        
        oscillator.start(audioContext.currentTime + i * 0.1);
        oscillator.stop(audioContext.currentTime + i * 0.1 + 0.8);
        
        if (i % 2 === 0) {
          const noiseLength = 0.2;
          const bufferSize = audioContext.sampleRate * noiseLength;
          const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          
          for (let j = 0; j < bufferSize; j++) {
            data[j] = Math.random() * 2 - 1;
          }
          
          const noise = audioContext.createBufferSource();
          noise.buffer = noiseBuffer;
          
          const noiseFilter = audioContext.createBiquadFilter();
          const noiseGain = audioContext.createGain();
          
          noise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(audioContext.destination);
          
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.value = 300 + Math.random() * 1000;
          noiseFilter.Q.value = 1;
          
          noiseGain.gain.setValueAtTime(0, audioContext.currentTime + i * 0.1);
          noiseGain.gain.linearRampToValueAtTime(0.1 + Math.random() * 0.15, audioContext.currentTime + i * 0.1 + 0.01);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + i * 0.1 + 0.15);
          
          noise.start(audioContext.currentTime + i * 0.1);
          noise.stop(audioContext.currentTime + i * 0.1 + noiseLength);
        }
      }
    } catch (e) {
      console.log("Audio playback failed:", e);
    }
  };
  
  const playCelebrationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [
        [261.63, 329.63, 392.00, 523.25, 659.25, 783.99],
        [293.66, 369.99, 440.00, 587.33, 698.46, 880.00],
        [349.23, 440.00, 523.25, 698.46, 880.00, 1046.50],
        [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66]
      ];
      
      notes.forEach((chordNotes, chordIndex) => {
        chordNotes.forEach((freq, noteIndex) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const panner = audioContext.createStereoPanner();
          
          oscillator.connect(panner);
          panner.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.type = ['sine', 'triangle'][Math.floor(Math.random() * 2)] as OscillatorType;
          oscillator.frequency.value = freq;
          
          panner.pan.value = (noteIndex / chordNotes.length) * 2 - 1;
          
          const startTime = audioContext.currentTime + chordIndex * 0.25;
          const noteDelay = noteIndex * 0.05;
          
          gainNode.gain.setValueAtTime(0, startTime + noteDelay);
          gainNode.gain.linearRampToValueAtTime(
            0.08 + (noteIndex / chordNotes.length) * 0.1, 
            startTime + noteDelay + 0.05
          );
          gainNode.gain.exponentialRampToValueAtTime(
            0.001, 
            startTime + noteDelay + 0.5 + (chordNotes.length - noteIndex) * 0.1
          );
          
          oscillator.start(startTime + noteDelay);
          oscillator.stop(startTime + noteDelay + 0.8);
          
          if (noteIndex % 2 === 0) {
            const tremoloFreq = 8 + Math.random() * 5;
            const tremoloDepth = 0.2 + Math.random() * 0.2;
            
            for (let i = 0; i < 20; i++) {
              const modulationTime = startTime + noteDelay + (i * (1/tremoloFreq));
              const value = 0.08 * (1 - tremoloDepth * (i % 2));
              gainNode.gain.setValueAtTime(value, modulationTime);
            }
          }
        });
        
        if (chordIndex % 2 === 0) {
          const noiseLength = 1.0;
          const bufferSize = audioContext.sampleRate * noiseLength;
          const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          
          const noise = audioContext.createBufferSource();
          noise.buffer = noiseBuffer;
          
          const highpassFilter = audioContext.createBiquadFilter();
          const gainNode = audioContext.createGain();
          
          noise.connect(highpassFilter);
          highpassFilter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          highpassFilter.type = 'highpass';
          highpassFilter.frequency.value = 8000;
          
          const startTime = audioContext.currentTime + chordIndex * 0.25;
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.06, startTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
          
          noise.start(startTime);
          noise.stop(startTime + noiseLength);
        }
      });
      
      setTimeout(() => {
        const finalContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        for (let i = 0; i < 10; i++) {
          const osc = finalContext.createOscillator();
          const gain = finalContext.createGain();
          const filter = finalContext.createBiquadFilter();
          
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(finalContext.destination);
          
          osc.type = ['sine', 'triangle', 'sawtooth'][Math.floor(Math.random() * 3)] as OscillatorType;
          osc.frequency.value = 100 + i * 100 + Math.random() * 200;
          
          filter.type = 'bandpass';
          filter.frequency.value = 500 + i * 300;
          filter.Q.value = 1;
          
          gain.gain.setValueAtTime(0, finalContext.currentTime);
          gain.gain.linearRampToValueAtTime(0.1, finalContext.currentTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, finalContext.currentTime + 0.2 + Math.random() * 0.3);
          
          osc.start(finalContext.currentTime);
          osc.stop(finalContext.currentTime + 0.5);
        }
        
        const bassOsc = finalContext.createOscillator();
        const bassGain = finalContext.createGain();
        const bassFilter = finalContext.createBiquadFilter();
        
        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(finalContext.destination);
        
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(150, finalContext.currentTime);
        bassOsc.frequency.exponentialRampToValueAtTime(40, finalContext.currentTime + 0.8);
        
        bassFilter.type = 'lowpass';
        bassFilter.frequency.value = 200;
        bassFilter.Q.value = 10;
        
        bassGain.gain.setValueAtTime(0, finalContext.currentTime);
        bassGain.gain.linearRampToValueAtTime(0.25, finalContext.currentTime + 0.05);
        bassGain.gain.exponentialRampToValueAtTime(0.001, finalContext.currentTime + 0.8);
        
        bassOsc.start(finalContext.currentTime);
        bassOsc.stop(finalContext.currentTime + 0.8);
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
