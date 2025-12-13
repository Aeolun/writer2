import { type JSX, splitProps } from 'solid-js'
import { iconButton, type IconButtonVariants } from './IconButton.css'

export interface IconButtonProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'>,
    IconButtonVariants {
  /** Icon element to display */
  children: JSX.Element
  /** Required for accessibility - describes the button action */
  'aria-label': string
}

export const IconButton = (props: IconButtonProps) => {
  const [local, variants, rest] = splitProps(
    props,
    ['children', 'class', 'aria-label'],
    ['variant', 'size']
  )

  return (
    <button
      class={`${iconButton(variants)} ${local.class ?? ''}`}
      aria-label={local['aria-label']}
      title={local['aria-label']}
      {...rest}
    >
      {local.children}
    </button>
  )
}
