import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const ToastContext = createContext({})

export const useToast = () => useContext(ToastContext)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, type, title, message }])

    if (duration) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '1rem', pointerEvents: 'none'
      }}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} {...toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

const ToastItem = ({ type, title, message, onRemove }) => {
  const styles = {
    success: { bg: '#052e16', border: '#059669', icon: <CheckCircle2 color="#34d399" /> },
    error: { bg: '#450a0a', border: '#dc2626', icon: <AlertCircle color="#f87171" /> },
    info: { bg: '#172554', border: '#2563eb', icon: <Info color="#60a5fa" /> }
  }
  const style = styles[type] || styles.info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      style={{
        pointerEvents: 'auto',
        minWidth: '300px',
        background: style.bg,
        borderLeft: `4px solid ${style.border}`,
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        color: 'white'
      }}
    >
      <div style={{ marginTop: '2px' }}>{style.icon}</div>
      <div style={{ flex: 1 }}>
        {title && <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{title}</h4>}
        <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0 }}>{message}</p>
      </div>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
        <X size={16} />
      </button>
    </motion.div>
  )
}