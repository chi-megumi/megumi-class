import { useEffect, type ReactNode, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import './Modal.scss'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ModalProps {
  /** Whether the modal is visible */
  open: boolean
  /** Called when user requests close (Escape key, overlay click, close button) */
  onClose: () => void
  /** Content rendered inside the modal body */
  children: ReactNode
  /** Optional title shown in the default header */
  title?: ReactNode
  /** Optional extra content rendered in the right side of the header (e.g. a score badge) */
  headerExtra?: ReactNode
  /** Modal width preset */
  size?: ModalSize
  /** Hide the built-in header (title + close button) */
  hideHeader?: boolean
  /** Prevent closing when clicking the overlay backdrop */
  disableOverlayClose?: boolean
  /** Additional class for the modal box */
  className?: string
  /** Override max-height of the body scroll area */
  bodyMaxHeight?: CSSProperties['maxHeight']
}

const SIZE_MAP: Record<ModalSize, string> = {
  sm: '400px',
  md: '560px',
  lg: '720px',
  xl: '900px',
  full: '96vw',
}

export function Modal({
  open,
  onClose,
  children,
  title,
  headerExtra,
  size = 'md',
  hideHeader = false,
  disableOverlayClose = false,
  className = '',
  bodyMaxHeight,
}: ModalProps) {
  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const modal = (
    <div
      className="modal-overlay"
      onClick={disableOverlayClose ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`modal ${className}`}
        style={{ maxWidth: SIZE_MAP[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {!hideHeader && (
          <div className="modal__header">
            <div className="modal__title">{title}</div>
            <div className="modal__header-extra">
              {headerExtra}
              <button className="modal__close-btn" onClick={onClose} aria-label="Đóng">
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div
          className="modal__body"
          style={bodyMaxHeight ? { maxHeight: bodyMaxHeight } : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
