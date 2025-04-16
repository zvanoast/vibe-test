import { ThemeOptions } from '@mui/material/styles';

export type ThemeType = 'normal' | 'synthwave' | 'cyberpunk' | 'rainbow';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: {
    default: string;
    paper: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  ballColors: string[];
  fireworksColors: string[];
  gradientColors?: string[];
}

interface ThemeDefinition extends ThemeColors {
  name: string;
  displayName: string;
}

const normalTheme: ThemeDefinition = {
  name: 'normal',
  displayName: 'Normal',
  primary: '#3f51b5',
  secondary: '#f50057',
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: '#121212',
    secondary: '#6c757d',
  },
  ballColors: ['#ff5252', '#ff4081', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3'],
  fireworksColors: [
    '#ff5252', '#ff4081', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', 
    '#ffeb3b', '#ff9800', '#76ff03', '#f44336', '#e91e63', '#2196f3',
    '#00bcd4', '#009688', '#4caf50', '#cddc39', '#ffc107', '#ff5722'
  ],
};

const normalDarkTheme: ThemeDefinition = {
  name: 'normalDark',
  displayName: 'Normal Dark',
  primary: '#5c6bc0',
  secondary: '#ff4081',
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: '#b0b0b0',
  },
  ballColors: ['#ff5252', '#ff4081', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3'],
  fireworksColors: [
    '#ff5252', '#ff4081', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', 
    '#ffeb3b', '#ff9800', '#76ff03', '#f44336', '#e91e63', '#2196f3',
    '#00bcd4', '#009688', '#4caf50', '#cddc39', '#ffc107', '#ff5722'
  ],
};

const synthwaveTheme: ThemeDefinition = {
  name: 'synthwave',
  displayName: 'Synthwave',
  primary: '#ff0099',
  secondary: '#00ffff',
  background: {
    default: '#1a1a2e',
    paper: '#16213e',
  },
  text: {
    primary: '#ffffff',
    secondary: '#e4007c',
  },
  ballColors: ['#ff0099', '#00ffff', '#fc8bff', '#bf00ff', '#0500ff', '#14ffec'],
  fireworksColors: [
    '#ff0099', '#00ffff', '#fc8bff', '#bf00ff', '#14ffec', '#0500ff',
    '#0affdb', '#0affe6', '#ff71ce', '#01cdfe', '#05ffa1', '#b967ff'
  ],
  gradientColors: ['#ff0099', '#00ffff', '#b967ff', '#05ffa1'],
};

const cyberpunkTheme: ThemeDefinition = {
  name: 'cyberpunk',
  displayName: 'Cyberpunk',
  primary: '#fcee09',
  secondary: '#00ff9f',
  background: {
    default: '#141010',
    paper: '#240c48',
  },
  text: {
    primary: '#ffffff',
    secondary: '#fcee09',
  },
  ballColors: ['#00ff9f', '#fcee09', '#ff003c', '#700353', '#32004a', '#f7137a'],
  fireworksColors: [
    '#00ff9f', '#fcee09', '#ff003c', '#fb7dff', '#0affc1', '#f7137a',
    '#00ff9f', '#ff00a0', '#00ffff', '#ffff00', '#da00ff', '#00ffcc'
  ],
  gradientColors: ['#00ff9f', '#fcee09', '#ff003c', '#fb7dff'],
};

const rainbowTheme: ThemeDefinition = {
  name: 'rainbow',
  displayName: 'Rainbow',
  primary: '#ff0000',
  secondary: '#00ff00',
  background: {
    default: '#ffffff',
    paper: '#ffffff',
  },
  text: {
    primary: '#000000',
    secondary: '#444444',
  },
  ballColors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'],
  fireworksColors: [
    '#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff',
    '#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'
  ],
  gradientColors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'],
};

export const themes: Record<string, ThemeDefinition> = {
  normal: normalTheme,
  normalDark: normalDarkTheme,
  synthwave: synthwaveTheme,
  cyberpunk: cyberpunkTheme,
  rainbow: rainbowTheme,
};

export const getThemeOptions = (themeName: string, isDarkMode: boolean): ThemeOptions => {
  const theme = themes[isDarkMode && themeName === 'normal' ? 'normalDark' : themeName] || themes.normal;
  
  return {
    palette: {
      mode: isDarkMode || ['synthwave', 'cyberpunk'].includes(themeName) ? 'dark' : 'light',
      primary: {
        main: theme.primary,
      },
      secondary: {
        main: theme.secondary,
      },
      background: theme.background,
      text: theme.text,
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
  };
};

export const getBallColors = (themeName: string, isDarkMode: boolean): string[] => {
  return themes[isDarkMode && themeName === 'normal' ? 'normalDark' : themeName]?.ballColors || themes.normal.ballColors;
};

export const getFireworksColors = (themeName: string, isDarkMode: boolean): string[] => {
  return themes[isDarkMode && themeName === 'normal' ? 'normalDark' : themeName]?.fireworksColors || themes.normal.fireworksColors;
};