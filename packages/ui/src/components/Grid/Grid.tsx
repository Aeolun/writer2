import { JSX, splitProps } from 'solid-js'
import { grid, gridItem, type GridVariants, type GridItemVariants } from './Grid.css'

export interface GridProps extends GridVariants {
  /** Grid content */
  children?: JSX.Element
  /** Additional class */
  class?: string
  /** Inline styles */
  style?: JSX.CSSProperties
}

export const Grid = (props: GridProps) => {
  const [local, variants] = splitProps(props, ['children', 'class', 'style'])

  return (
    <div
      class={`${grid({
        cols: variants.cols,
        rows: variants.rows,
        gap: variants.gap,
        align: variants.align,
        justify: variants.justify,
        flow: variants.flow,
      })} ${local.class ?? ''}`}
      style={local.style}
    >
      {local.children}
    </div>
  )
}

export interface GridItemProps extends GridItemVariants {
  /** Item content */
  children?: JSX.Element
  /** Additional class */
  class?: string
  /** Inline styles */
  style?: JSX.CSSProperties
}

/** Grid item with span control */
export const GridItem = (props: GridItemProps) => {
  const [local, variants] = splitProps(props, ['children', 'class', 'style'])

  return (
    <div
      class={`${gridItem({
        colSpan: variants.colSpan,
        rowSpan: variants.rowSpan,
      })} ${local.class ?? ''}`}
      style={local.style}
    >
      {local.children}
    </div>
  )
}
