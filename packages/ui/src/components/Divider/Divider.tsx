import { splitProps } from 'solid-js'
import { divider, type DividerVariants } from './Divider.css'

export interface DividerProps extends DividerVariants {
  /** Additional class */
  class?: string
}

export const Divider = (props: DividerProps) => {
  const [local, variants] = splitProps(props, ['class'])

  const isVertical = variants.orientation === 'vertical'

  return (
    <hr
      class={`${divider({
        orientation: variants.orientation,
        variant: variants.variant,
        spacing: variants.spacing,
        color: variants.color,
      })} ${local.class ?? ''}`}
      role="separator"
      aria-orientation={isVertical ? 'vertical' : 'horizontal'}
    />
  )
}
