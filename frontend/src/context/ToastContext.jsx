import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'

const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

// aviso rápido no canto da tela ("Publicação criada!")
export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([])

  const mostrar = useCallback((texto, tipo = 'sucesso') => {
    const id = Date.now() + Math.random()
    setAvisos((atual) => [...atual, { id, texto, tipo }])
    setTimeout(() => setAvisos((atual) => atual.filter((a) => a.id !== id)), 3500)
  }, [])

  const api = {
    sucesso: (texto) => mostrar(texto, 'sucesso'),
    erro: (texto) => mostrar(texto, 'erro'),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4" aria-live="polite">
        {avisos.map((a) => (
          <div
            key={a.id}
            className={`pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
              a.tipo === 'erro' ? 'bg-red-600' : 'bg-green-700'
            }`}
          >
            {a.tipo === 'erro' ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
            {a.texto}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
