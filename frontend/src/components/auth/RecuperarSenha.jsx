import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import * as authService from '../../services/authService'
import Modal from '../ui/Modal'
import { botaoPrimario, Campo, inputClasse } from '../ui/Ui'
import { LinkModal } from "../ui/LinkModal"
import { validarEmail } from '../../utils/validators'
import { recuperarSenha } from '../../services/authService'

export function RecuperarSenha() {
  const { abrirModal, fecharModal } = useAuth()
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function enviar(ev) {
    ev.preventDefault()
    if (!validarEmail(email)) return setErro('Informe um e-mail válido.')
    setErro('')
    setEnviando(true)
    await authService.recuperarSenha(email)
    setEnviado(true)
    setEnviando(false)
  }

  return (
    <Modal titulo="Recuperar senha" onFechar={fecharModal}>
      {enviado ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <MailCheck className="h-12 w-12 text-emerald-600" />
          <p className="font-semibold text-stone-800">Confira seu e-mail</p>
          <p className="text-sm text-stone-600">
            Se houver uma conta com <strong>{email}</strong>, enviamos o link para criar uma nova senha.
          </p>
          <button onClick={() => abrirModal('login')} className={`${botaoPrimario} mt-2`}>Voltar para o login</button>
        </div>
      ) : (
        <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
          <p className="text-sm text-stone-600">Informe o e-mail da sua conta e enviaremos um link para redefinir a senha.</p>
          <Campo rotulo="E-mail" erro={erro}>{(id) => <input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasse} autoComplete="email" />}</Campo>
          <button type="submit" disabled={enviando} className={botaoPrimario}>{enviando ? 'Enviando...' : 'Enviar link'}</button>
          <p className="text-center text-sm"><LinkModal onClick={() => abrirModal('login')}>Voltar para o login</LinkModal></p>
        </form>
      )}
    </Modal>
  )
}