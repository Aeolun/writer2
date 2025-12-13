import { style, keyframes } from '@vanilla-extract/css'
import { recipe, type RecipeVariants } from '@vanilla-extract/recipes'
import { tokens } from '../../theme/tokens.css'

const spinGradient = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
})

const base = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.space['2'],
  fontFamily: tokens.font.family.sans,
  fontWeight: tokens.font.weight.medium,
  lineHeight: tokens.font.lineHeight.tight,
  borderRadius: tokens.radius.default,
  border: 'none',
  cursor: 'pointer',
  transition: `all ${tokens.duration.fast} ${tokens.easing.default}`,
  userSelect: 'none',
  overflow: 'hidden',
  isolation: 'isolate',

  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  ':focus-visible': {
    outline: `2px solid ${tokens.color.border.focus}`,
    outlineOffset: '2px',
  },

  // Spinning gradient layer - starts as solid color, becomes gradient on hover
  '::before': {
    content: '""',
    position: 'absolute',
    inset: '-100%',
    background: tokens.color.accent.primary,
    transition: `background ${tokens.duration.normal} ${tokens.easing.default}`,
    zIndex: -2,
  },

  // Inner background that covers the gradient except at edges
  '::after': {
    content: '""',
    position: 'absolute',
    inset: '2px',
    borderRadius: `calc(${tokens.radius.default} - 2px)`,
    backgroundColor: tokens.color.accent.primary,
    transition: `background-color ${tokens.duration.fast} ${tokens.easing.default}`,
    zIndex: -1,
  },

  selectors: {
    '&:hover:not(:disabled)::before': {
      background: `conic-gradient(
        from 0deg,
        ${tokens.color.accent.primary},
        ${tokens.color.accent.primaryHover},
        ${tokens.color.accent.secondary},
        ${tokens.color.accent.secondaryHover},
        ${tokens.color.accent.primary}
      )`,
      animation: `${spinGradient} 3s linear infinite`,
    },
    '&:active:not(:disabled)::before': {
      animation: `${spinGradient} 1s linear infinite`,
    },
  },
})

export const button = recipe({
  base,

  variants: {
    variant: {
      primary: {
        color: tokens.color.text.inverse,
        selectors: {
          '&:hover:not(:disabled)::after': {
            backgroundColor: tokens.color.accent.primaryHover,
          },
          '&:active:not(:disabled)::after': {
            backgroundColor: tokens.color.accent.primaryActive,
          },
        },
      },
      secondary: {
        color: tokens.color.text.primary,
        selectors: {
          '&::after': {
            backgroundColor: tokens.color.surface.default,
            border: `${tokens.borderWidth.default} solid ${tokens.color.border.default}`,
          },
          '&::before': {
            background: tokens.color.border.default,
          },
          '&:hover:not(:disabled)::before': {
            background: `conic-gradient(
              from 0deg,
              ${tokens.color.border.strong},
              ${tokens.color.border.default},
              ${tokens.color.accent.primary},
              ${tokens.color.border.default},
              ${tokens.color.border.strong}
            )`,
          },
          '&:hover:not(:disabled)::after': {
            backgroundColor: tokens.color.surface.hover,
            borderColor: tokens.color.border.strong,
          },
          '&:active:not(:disabled)::after': {
            backgroundColor: tokens.color.surface.active,
          },
        },
      },
      ghost: {
        color: tokens.color.text.primary,
        backgroundColor: 'transparent',
        selectors: {
          '&::after': {
            display: 'none',
          },
          '&::before': {
            display: 'none',
          },
          '&:hover:not(:disabled)::before': {
            display: 'none',
          },
          '&:hover:not(:disabled)': {
            backgroundColor: tokens.color.surface.hover,
          },
          '&:active:not(:disabled)': {
            backgroundColor: tokens.color.surface.active,
          },
        },
      },
      danger: {
        color: tokens.color.text.inverse,
        selectors: {
          '&::after': {
            backgroundColor: tokens.color.semantic.error,
          },
          '&::before': {
            background: tokens.color.semantic.error,
          },
          '&:hover:not(:disabled)::before': {
            background: `conic-gradient(
              from 0deg,
              ${tokens.color.semantic.error},
              ${tokens.color.accent.secondary},
              ${tokens.color.semantic.error}
            )`,
          },
          '&:hover:not(:disabled)::after': {
            filter: 'brightness(1.1)',
          },
          '&:active:not(:disabled)::after': {
            filter: 'brightness(0.95)',
          },
        },
      },
    },

    size: {
      sm: {
        height: '32px',
        paddingLeft: tokens.space['3'],
        paddingRight: tokens.space['3'],
        fontSize: tokens.font.size.sm,
      },
      md: {
        height: '40px',
        paddingLeft: tokens.space['4'],
        paddingRight: tokens.space['4'],
        fontSize: tokens.font.size.base,
      },
      lg: {
        height: '48px',
        paddingLeft: tokens.space['6'],
        paddingRight: tokens.space['6'],
        fontSize: tokens.font.size.lg,
      },
    },

    fullWidth: {
      true: {
        width: '100%',
      },
    },

    // Icon-only button (square, no text padding)
    iconOnly: {
      true: {},
    },
  },

  compoundVariants: [
    // Icon-only size adjustments - make buttons square
    {
      variants: { iconOnly: true, size: 'sm' },
      style: {
        width: '32px',
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    {
      variants: { iconOnly: true, size: 'md' },
      style: {
        width: '40px',
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    {
      variants: { iconOnly: true, size: 'lg' },
      style: {
        width: '48px',
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
  ],

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export type ButtonVariants = RecipeVariants<typeof button>
