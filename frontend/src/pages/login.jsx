import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Login() {
  const [mensagem, setMensagem] = useState('')

  function entrar(event) {
    event.preventDefault()
    setMensagem('A autenticação ainda não foi conectada ao servidor.')
  }

  return (
    <section className="mx-auto max-w-md py-8 sm:py-14">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-green-700">Pet Ajuda</p>
        <h1 className="mt-2 text-2xl font-bold text-stone-800">Entre na sua conta</h1>
        <p className="mt-2 text-sm text-stone-600">
          Acesse sua conta para acompanhar suas publicações e ajudar os animais.
        </p>

        <form onSubmit={entrar} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-stone-700">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="voce@exemplo.com"
              className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="text-sm font-medium text-stone-700">Senha</label>
            <input
              id="senha"
              name="senha"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Sua senha"
              className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Entrar
          </button>
        </form>

        {mensagem && (
          <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            {mensagem}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-stone-600">
          Ainda não quer entrar?{' '}
          <Link to="/" className="font-semibold text-green-700 hover:text-green-800">
            Voltar para o início
          </Link>
        </p>
      </div>
    </section>
  )
}
