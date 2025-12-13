import { style } from '@vanilla-extract/css'
import { tokens } from '../../theme/tokens.css'

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.space['1.5'],
})

export const labelRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.space['2'],
})

export const label = style({
  fontSize: tokens.font.size.sm,
  fontWeight: tokens.font.weight.medium,
  color: tokens.color.text.primary,
})

export const required = style({
  color: tokens.color.semantic.error,
  marginLeft: tokens.space['0.5'],
})

export const optional = style({
  fontSize: tokens.font.size.xs,
  color: tokens.color.text.muted,
  fontWeight: tokens.font.weight.normal,
})

export const helpText = style({
  fontSize: tokens.font.size.sm,
  color: tokens.color.text.secondary,
})

export const errorText = style({
  fontSize: tokens.font.size.sm,
  color: tokens.color.semantic.error,
})
