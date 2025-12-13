import {
  type JSX,
  type ParentComponent,
  Show,
  createSignal,
  onCleanup,
  onMount,
  children as resolveChildren,
} from 'solid-js'
import * as styles from './Dropdown.css'

export interface DropdownProps {
  /** The trigger element (usually a button) */
  trigger: JSX.Element
  /** Align menu to right edge of trigger */
  alignRight?: boolean
  /** Additional class for the container */
  class?: string
}

export const Dropdown: ParentComponent<DropdownProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false)
  let containerRef: HTMLDivElement | undefined
  let menuRef: HTMLDivElement | undefined

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen((prev) => !prev)

  // Close on click outside
  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef && !containerRef.contains(e.target as Node)) {
      close()
    }
  }

  // Close on escape
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen()) {
      close()
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
  })

  onCleanup(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeyDown)
  })

  // Clone trigger and add click handler
  const triggerElement = () => {
    const resolved = resolveChildren(() => props.trigger)
    const el = resolved() as HTMLElement
    return el
  }

  return (
    <div ref={containerRef} class={`${styles.container} ${props.class ?? ''}`}>
      <div onClick={toggle}>{props.trigger}</div>
      <Show when={isOpen()}>
        <div
          ref={menuRef}
          class={`${styles.menu} ${props.alignRight ? styles.menuRight : ''}`}
          role="menu"
        >
          {props.children}
        </div>
      </Show>
    </div>
  )
}

export interface DropdownItemProps {
  /** Click handler */
  onClick?: () => void
  /** Danger/destructive styling */
  danger?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Icon to display before label */
  icon?: JSX.Element
  children: JSX.Element
}

export const DropdownItem: ParentComponent<DropdownItemProps> = (props) => {
  return (
    <button
      class={`${styles.item} ${props.danger ? styles.itemDanger : ''}`}
      onClick={props.onClick}
      disabled={props.disabled}
      role="menuitem"
    >
      {props.icon}
      {props.children}
    </button>
  )
}

export const DropdownDivider = () => <div class={styles.divider} role="separator" />
