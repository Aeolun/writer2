import { JSX, splitProps } from 'solid-js'
import { stack, type StackVariants } from './Stack.css'

export interface StackProps extends StackVariants {
  /** Stack content */
  children?: JSX.Element
  /** Additional class */
  class?: string
  /** Inline styles */
  style?: JSX.CSSProperties
}

export const Stack = (props: StackProps) => {
  const [local, variants] = splitProps(props, ['children', 'class', 'style'])

  return (
    <div
      class={`${stack({
        direction: variants.direction,
        gap: variants.gap,
        align: variants.align,
        justify: variants.justify,
        wrap: variants.wrap,
      })} ${local.class ?? ''}`}
      style={local.style}
    >
      {local.children}
    </div>
  )
}

/** Convenience component for horizontal stacks */
export const HStack = (props: Omit<StackProps, 'direction'>) => {
  return <Stack {...props} direction="horizontal" />
}

/** Convenience component for vertical stacks */
export const VStack = (props: Omit<StackProps, 'direction'>) => {
  return <Stack {...props} direction="vertical" />
}
