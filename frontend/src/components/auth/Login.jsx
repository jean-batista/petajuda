import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Modal from '../Modal'
import { botaoPrimario, Campo, inputClasse } from '../ui'
import { LinkModal } from "../LinkModal"
import { login } from '../../services/authService'

export function Login() {
  const { entrar, abrirModal, fecharModal } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [ver, setVer] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await entrar(email, senha)
    } catch (err) {
      setErro(err.message || 'E-mail ou senha incorretos.')
      setEnviando(false)
    }
  }

  return (
    <Modal titulo="Entrar no Pet Ajuda" onFechar={fecharModal}>
      <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <Campo rotulo="E-mail">
          {(id) => (
            <input id={id} type="email" autoComplete="email" value={email} required
              onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" className={inputClasse} />
          )}
        </Campo>

        <Campo rotulo="Senha">
          {(id) => (
            <div className="relative">
              <input id={id} type={ver ? 'text' : 'password'} autoComplete="current-password" value={senha} required
                onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" className={`${inputClasse} pr-11`} />
              <button type="button" onClick={() => setVer(!ver)} aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-500 hover:bg-stone-100">
                {ver ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}
        </Campo>

        <div className="text-right text-sm">
          <LinkModal onClick={() => abrirModal('recuperar')}>Esqueci minha senha</LinkModal>
        </div>

        {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</p>}

        <button type="submit" disabled={enviando || !email || !senha} className={botaoPrimario}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-stone-600">
        Não tem conta? <LinkModal onClick={() => abrirModal('cadastro')}>Criar conta</LinkModal>
        <span className="mx-2 text-stone-300">|</span>
        <LinkModal onClick={() => abrirModal('ong')}>Cadastrar minha ONG</LinkModal>
      </p>
    </Modal>
  )
}