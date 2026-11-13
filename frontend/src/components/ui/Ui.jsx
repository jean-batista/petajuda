// Peças visuais pequenas reaproveitadas em formulários e telas
import { useId } from 'react'

export const inputClasse =
  'w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-stone-100 disabled:text-stone-500'

export const botaoPrimario =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'

export const botaoSecundario =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60'

export const botaoPerigo =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60'

// rótulo + campo + mensagem de erro, ligados por id (acessível)
export function Campo({ rotulo, erro, dica, children, className = '' }) {
  const id = useId()
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-stone-700">{rotulo}</label>
      {children(id)}
      {dica && !erro && <p className="text-xs text-stone-500">{dica}</p>}
      {erro && <p role="alert" className="text-xs text-red-600">{erro}</p>}
    </div>
  )
}

export function Selo({ classe, children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${classe}`}>
      {children}
    </span>
  )
}

export function Carregando({ texto = 'Carregando...' }) {
  return (
    <div className="flex items-center gap-3 py-6 text-stone-500" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
      {texto}
    </div>
  )
}

export function Vazio({ icone: Icone, titulo, texto, children }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
      {Icone && <Icone className="h-10 w-10 text-stone-300" />}
      <p className="font-semibold text-stone-700">{titulo}</p>
      {texto && <p className="max-w-md text-sm text-stone-500">{texto}</p>}
      {children}
    </div>
  )
}
