import { JSX, splitProps } from 'solid-js'
import { container, type ContainerVariants } from './Container.css'

export interface ContainerProps extends ContainerVariants {
  /** Container content */
  children?: JSX.Element
  /** Additional class */
  class?: string
  /** Inline styles */
  style?: JSX.CSSProperties
}

export const Container = (props: ContainerProps) => {
  const [local, variants] = splitProps(props, ['children', 'class', 'style'])

  return (
    <div
      class={`${container({
        size: variants.size,
        padding: variants.padding,
        center: variants.center,
      })} ${local.class ?? ''}`}
      style={local.style}
    >
      {local.children}
    </div>
  )
}
