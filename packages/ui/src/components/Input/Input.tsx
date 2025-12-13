import { type JSX, splitProps } from 'solid-js'
import { input, type InputVariants } from './Input.css'

export interface InputProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    InputVariants {}

export const Input = (props: InputProps) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class'],
    ['size']
  )

  return (
    <input
      class={`${input(variants)} ${local.class ?? ''}`}
      {...rest}
    />
  )
}
