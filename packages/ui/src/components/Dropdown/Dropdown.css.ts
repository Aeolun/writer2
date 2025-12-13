import { style, keyframes } from '@vanilla-extract/css'
import { tokens } from '../../theme/tokens.css'

const fadeIn = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-4px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

export const container = style({
  position: 'relative',
  display: 'inline-block',
})

export const menu = style({
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: tokens.space['1'],
  minWidth: '160px',
  backgroundColor: tokens.color.bg.elevated,
  border: `${tokens.borderWidth.default} solid ${tokens.color.border.default}`,
  borderRadius: tokens.radius.md,
  boxShadow: tokens.shadow.md,
  zIndex: tokens.zIndex.dropdown,
  overflow: 'hidden',
  animation: `${fadeIn} ${tokens.duration.fast} ${tokens.easing.out}`,
})

export const menuRight = style({
  left: 'auto',
  right: 0,
})

export const item = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.space['2'],
  width: '100%',
  padding: `${tokens.space['2']} ${tokens.space['3']}`,
  border: 'none',
  backgroundColor: 'transparent',
  color: tokens.color.text.primary,
  fontSize: tokens.font.size.sm,
  textAlign: 'left',
  cursor: 'pointer',
  transition: `background-color ${tokens.duration.fast} ${tokens.easing.default}`,

  ':hover': {
    backgroundColor: tokens.color.surface.hover,
  },

  ':focus': {
    outline: 'none',
    backgroundColor: tokens.color.surface.hover,
  },

  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  selectors: {
    '&:disabled:hover': {
      backgroundColor: 'transparent',
    },
  },
})

export const itemDanger = style({
  color: tokens.color.semantic.error,

  ':hover': {
    backgroundColor: tokens.color.semantic.errorSubtle,
  },

  ':focus': {
    backgroundColor: tokens.color.semantic.errorSubtle,
  },
})

export const divider = style({
  height: '1px',
  backgroundColor: tokens.color.border.subtle,
  margin: `${tokens.space['1']} 0`,
})
