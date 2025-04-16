import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton,
  Tooltip
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckIcon from '@mui/icons-material/Check';
import { themes, ThemeType } from './themes';

interface ThemeSwitcherProps {
  currentTheme: string;
  onThemeChange: (theme: ThemeType) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (themeName: ThemeType) => {
    onThemeChange(themeName);
    handleClose();
  };

  return (
    <Box>
      <Tooltip title="Change theme">
        <IconButton
          onClick={handleClick}
          size="large"
          sx={{ 
            bgcolor: 'background.paper', 
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'background.default',
            }
          }}
        >
          <PaletteIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            mt: 1.5,
            borderRadius: 2,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              my: 0.5,
              borderRadius: 1,
              mx: 1,
            },
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {Object.entries(themes).map(([id, theme]) => (
          // Skip normalDark as it's automatically applied in dark mode
          id !== 'normalDark' && (
            <MenuItem 
              key={id} 
              onClick={() => handleThemeSelect(id as ThemeType)}
              selected={currentTheme === id}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                '&::before': theme.gradientColors ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.2,
                  zIndex: 0,
                  background: theme.gradientColors ? 
                    `linear-gradient(135deg, ${theme.gradientColors.join(', ')})` : 
                    'transparent',
                } : {}
              }}
            >
              <ListItemIcon sx={{ 
                color: theme.primary,
                position: 'relative',
                zIndex: 1
              }}>
                {currentTheme === id ? <CheckIcon /> : 
                  <Box sx={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%', 
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    boxShadow: 1
                  }} />
                }
              </ListItemIcon>
              <ListItemText 
                primary={theme.displayName}
                sx={{ position: 'relative', zIndex: 1 }}
              />
            </MenuItem>
          )
        ))}
      </Menu>
    </Box>
  );
};

export default ThemeSwitcher;