import { type JSX, type ParentComponent } from 'solid-js'
import { badge, type BadgeVariants } from './Badge.css'

export interface BadgeProps extends BadgeVariants {
  /** Icon to display before text */
  icon?: JSX.Element
  /** Additional class */
  class?: string
  children: JSX.Element
}

export const Badge: ParentComponent<BadgeProps> = (props) => {
  return (
    <span class={`${badge({ variant: props.variant, size: props.size })} ${props.class ?? ''}`}>
      {props.icon}
      {props.children}
    </span>
  )
}
