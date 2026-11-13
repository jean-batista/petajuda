import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const larguras = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }

// janela sobreposta. Fecha com Esc, clique fora ou no X, e trava a rolagem da página.
export default function Modal({ titulo, aberto = true, onFechar, tamanho = 'sm', children }) {
  const caixa = useRef(null)

  useEffect(() => {
    if (!aberto) return
    const anterior = document.activeElement
    const aoApertar = (e) => e.key === 'Escape' && onFechar()
    document.addEventListener('keydown', aoApertar)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    caixa.current?.focus()
    return () => {
      document.removeEventListener('keydown', aoApertar)
      document.body.style.overflow = overflow
      anterior?.focus?.()
    }
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div
        ref={caixa}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={`flex max-h-[92vh] w-full ${larguras[tamanho]} flex-col rounded-t-3xl bg-white shadow-xl outline-none sm:rounded-3xl`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-stone-200 px-6 py-4">
          <h2 className="text-lg font-bold text-stone-800">{titulo}</h2>
          <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1 text-stone-500 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
