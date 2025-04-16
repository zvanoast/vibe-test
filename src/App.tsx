import React, { useState } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Paper, Grid,
  ThemeProvider, createTheme, CssBaseline, useMediaQuery
} from '@mui/material';

function generateLotteryNumbers(name: string, birthday: string): number[] {
  // Simple deterministic pseudo-random generator based on input
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
  // Theme setup with a more vibrant and attractive color palette
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: '#3f51b5', // Indigo color
          },
          secondary: {
            main: '#f50057', // Pink color
          },
          background: {
            default: prefersDarkMode ? '#121212' : '#f5f5f5',
            paper: prefersDarkMode ? '#1e1e1e' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h4: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 500,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 28,
                padding: '12px 24px',
                fontSize: '1rem',
                textTransform: 'none',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 16,
              },
            },
          },
        },
      }),
    [prefersDarkMode],
  );

  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [numbers, setNumbers] = useState<number[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  
  // Create audio contexts for sound effects
  const playFireworksSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.4);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (e) {
      console.log("Audio playback failed:", e);
    }
  };
  
  const playCelebrationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a series of notes for a celebratory sound
      const notes = [392, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
      
      notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + i * 0.1);
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + i * 0.1 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + i * 0.1 + 0.3);
        
        oscillator.start(audioContext.currentTime + i * 0.1);
        oscillator.stop(audioContext.currentTime + i * 0.1 + 0.3);
      });
    } catch (e) {
      console.log("Audio playback failed:", e);
    }
  };
  
  // Function to play sound effects
  const playSoundEffects = () => {
    playFireworksSound();
    
    // Play celebration sound with slight delay
    setTimeout(() => {
      playCelebrationSound();
    }, 300);
  };

  // Colors for lottery balls
  const ballColors = ['#ff5252', '#ff4081', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3'];
  
  // Generate some random numbers for the loading animation
  const getRandomBalls = () => {
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 49) + 1);
  };

  // Generate fireworks particles
  const fireworksCount = 80; // Increased from 30 to 80 firework explosions!
  const fireworksColors = [
    '#ff5252', '#ff4081', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', 
    '#ffeb3b', '#ff9800', '#76ff03', '#f44336', '#e91e63', '#2196f3',
    '#00bcd4', '#009688', '#4caf50', '#cddc39', '#ffc107', '#ff5722',
    '#ffeb3b', '#ff9800', '#76ff03', '#f44336', '#e91e63', '#2196f3'
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && birthday) {
      setLoading(true);
      setSubmitted(false);
      setShowFireworks(false);
      
      // Add a delay with a shuffling effect before showing the final numbers
      let shuffleCount = 0;
      const maxShuffles = 10;
      const shuffleInterval = setInterval(() => {
        if (shuffleCount >= maxShuffles) {
          clearInterval(shuffleInterval);
          setNumbers(generateLotteryNumbers(name, birthday));
          setLoading(false);
          setSubmitted(true);
          
          // MEGA EXTRAVAGANT fireworks show after a slight delay!
          setTimeout(() => {
            console.log("🎆 LAUNCHING MEGA FIREWORKS EXTRAVAGANZA! 🎆");
            setShowFireworks(true);
            playSoundEffects(); // Play sound effects along with fireworks
            
            // Keep the fireworks going for longer - real celebration!
            setTimeout(() => {
              setShowFireworks(false);
            }, 6000); // Double the duration to 6 seconds
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
          background: 'rgba(0,0,0,0.05)', // Slight darkening of background
          overflow: 'hidden',
        }}>
          {/* Main fireworks display */}
          {Array.from({ length: fireworksCount }).map((_, idx) => {
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 60 + 20; // Keep in upper 80% of screen
            const randomScale = Math.random() * 1.5 + 0.5; // Much larger explosions 0.5-2.0
            const randomDelay = Math.random() * 3; // Longer spread of delays for continuous effect
            const randomDuration = 0.8 + Math.random() * 1.2; // Variable durations
            const randomColor = fireworksColors[Math.floor(Math.random() * fireworksColors.length)];
            const particleCount = 12 + Math.floor(Math.random() * 12); // 12-24 particles per explosion
            const extraLarge = Math.random() > 0.8; // 20% chance of extra large explosion
            
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
                {/* Generate additional particles for each firework */}
                {Array.from({ length: particleCount }).map((_, particleIdx) => {
                  const angle = (particleIdx / particleCount) * Math.PI * 2;
                  const distance = 40 + Math.random() * 80; // Longer particle trails
                  const particleSize = 1 + Math.random() * 4; // Larger particles
                  const particleDelay = randomDelay + Math.random() * 0.3; // Slight variation in particle timing
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

                {/* Create sparkle effect on large explosions */}
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

          {/* Falling confetti effect */}
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

          {/* Flash effect */}
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
          alignItems: 'center', // Add this to center horizontally
          py: 4,
          mx: 'auto' // Ensure margin auto is applied
        }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4,
            borderRadius: 4,
            width: '100%', // Take full width of the container
            maxWidth: 'sm', // Match the maxWidth from the Container
            background: (theme) => `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper} 100%)`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
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
              textShadow: '0px 2px 4px rgba(0,0,0,0.1)'
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
                boxShadow: '0 4px 12px rgba(63, 81, 181, 0.4)',
                '&:hover': {
                  boxShadow: '0 6px 14px rgba(63, 81, 181, 0.6)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
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
                sx={{ mb: 3, fontWeight: 500 }}
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
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
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
                          boxShadow: '0 6px 14px rgba(0,0,0,0.3)',
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
