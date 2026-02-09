/**
 * HAKOWARE Design Tokens
 * Centralized theme for consistent UI
 */

export const theme = {
  // Colors
  colors: {
    bg: {
      primary: '#0a0a0a',
      secondary: '#111',
      tertiary: '#1a1a1a',
      elevated: '#161616'
    },
    border: {
      default: '#222',
      hover: '#333',
      active: '#444'
    },
    text: {
      primary: '#ffffff',
      secondary: '#e0e0e0',
      muted: '#888',
      disabled: '#444'
    },
    accent: {
      gold: '#ffd700',
      red: '#ff4444',
      green: '#00e676',
      orange: '#ff8800',
      blue: '#33b5e5',
      purple: '#9c27b0',
      magenta: '#ff00ff'
    }
  },

  // Spacing (4px base grid)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px'
  },

  // Border radius
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 6px rgba(0,0,0,0.4)',
    lg: '0 10px 15px rgba(0,0,0,0.5)',
    glow: (color) => `0 0 20px ${color}40`,
    glowSm: (color) => `0 0 10px ${color}30`
  },

  // Transitions
  transitions: {
    fast: 'all 0.15s ease',
    default: 'all 0.2s ease',
    slow: 'all 0.3s ease',
    bounce: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
  },

  // Typography
  typography: {
    size: {
      xs: '0.65rem',
      sm: '0.75rem',
      md: '0.85rem',
      lg: '1rem',
      xl: '1.2rem',
      '2xl': '1.5rem'
    },
    weight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  }
};

// Common style combinations
export const mixins = {
  card: {
    background: `linear-gradient(145deg, ${theme.colors.bg.secondary}, ${theme.colors.bg.primary})`,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.radius.xl,
    transition: theme.transitions.default
  },

  button: {
    base: {
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      borderRadius: theme.radius.md,
      fontWeight: theme.typography.weight.bold,
      fontSize: theme.typography.size.sm,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      cursor: 'pointer',
      transition: theme.transitions.fast,
      border: 'none',
      fontFamily: 'inherit'
    },
    hover: {
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows.md
    },
    active: {
      transform: 'translateY(0)',
      boxShadow: theme.shadows.sm
    }
  },

  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
};

export default theme;
