import { type JSX, splitProps } from 'solid-js'
import { button, type ButtonVariants } from './Button.css'

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  children: JSX.Element
}

export const Button = (props: ButtonProps) => {
  const [local, variants, rest] = splitProps(
    props,
    ['children', 'class'],
    ['variant', 'size', 'fullWidth', 'iconOnly']
  )

  return (
    <button
      class={`${button(variants)} ${local.class ?? ''}`}
      {...rest}
    >
      {local.children}
    </button>
  )
}
