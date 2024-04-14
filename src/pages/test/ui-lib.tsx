import { createRoot } from 'react-dom/client'
import styles from './ui-lib.module.scss'
import { useEffect, useState } from 'react'
import MaxIcon from './icon/max.svg'
import MinIcon from './icon/min.svg'
import CloseIcon from './icon/close.svg'

export async function copyToClipboard(text: string) {
  try {
    if (window.__TAURI__) {
      window.__TAURI__.writeText(text)
    } else {
      await navigator.clipboard.writeText(text)
    }

    showToast('已写入剪切板')
  } catch (error) {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      showToast('已写入剪切板')
    } catch (error) {
      showToast('复制失败，请赋予剪切板权限')
    }
    document.body.removeChild(textArea)
  }
}

export function showToast(content: string, action?: ToastProps['action'], delay = 3000) {
  const div = document.createElement('div')
  div.className = styles.show
  document.body.appendChild(div)

  const root = createRoot(div)
  const close = () => {
    div.classList.add(styles.hide)

    setTimeout(() => {
      root.unmount()
      div.remove()
    }, 300)
  }

  setTimeout(() => {
    close()
  }, delay)

  root.render(<Toast content={content} action={action} onClose={close} />)
}

export type ToastProps = {
  content: string
  action?: {
    text: string
    onClick: () => void
  }
  onClose?: () => void
}

export function Toast(props: ToastProps) {
  return (
    <div className={styles['toast-container']}>
      <div className={styles['toast-content']}>
        <span>{props.content}</span>
        {props.action && (
          <button
            onClick={() => {
              props.action?.onClick?.()
              props.onClose?.()
            }}
            className={styles['toast-action']}
          >
            {props.action.text}
          </button>
        )}
      </div>
    </div>
  )
}

export function showImageModal(img: string) {
  showModal({
    title: '长按或右键保存图片',
    children: (
      <div>
        <img
          src={img}
          alt="preview"
          style={{
            maxWidth: '100%'
          }}
        ></img>
      </div>
    )
  })
}

interface ModalProps {
  title: string
  children?: any
  actions?: React.ReactNode[]
  defaultMax?: boolean
  footer?: React.ReactNode
  onClose?: () => void
}

export function showModal(props: ModalProps) {
  const div = document.createElement('div')
  div.className = 'modal-mask'
  document.body.appendChild(div)

  const root = createRoot(div)
  const closeModal = () => {
    props.onClose?.()
    root.unmount()
    div.remove()
  }

  div.onclick = (e) => {
    if (e.target === div) {
      closeModal()
    }
  }

  root.render(<Modal {...props} onClose={closeModal}></Modal>)
}

export function Modal(props: ModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        props.onClose?.()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [isMax, setMax] = useState(!!props.defaultMax)

  return (
    <div className={styles['modal-container'] + ` ${isMax && styles['modal-container-max']}`}>
      <div className={styles['modal-header']}>
        <div className={styles['modal-title']}>{props.title}</div>

        <div className={styles['modal-header-actions']}>
          <div className={styles['modal-header-action']} onClick={() => setMax(!isMax)}>
            {isMax ? <MinIcon /> : <MaxIcon />}
          </div>
          <div className={styles['modal-header-action']} onClick={props.onClose}>
            <CloseIcon />
          </div>
        </div>
      </div>

      <div className={styles['modal-content']}>{props.children}</div>

      <div className={styles['modal-footer']}>
        {props.footer}
        <div className={styles['modal-actions']}>
          {props.actions?.map((action, i) => (
            <div key={i} className={styles['modal-action']}>
              {action}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
