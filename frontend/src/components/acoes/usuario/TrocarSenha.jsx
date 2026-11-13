import { useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { alterarSenha } from '../../../services/authService'
import { Campo, botaoPrimario, inputClasse } from '../../ui/Ui'

export function TrocarSenha() {
  const toast = useToast()
  const [f, setF] = useState({ atual: '', nova: '', confirmar: '' })
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function salvar(e) {
    e.preventDefault()
    if (f.nova.length < 8) return setErro('A nova senha precisa ter pelo menos 8 caracteres.')
    if (f.nova !== f.confirmar) return setErro('As senhas não coincidem.')
    setEnviando(true)
    try {
      await alterarSenha(f.atual, f.nova)
      setErro('')
      setF({ atual: '', nova: '', confirmar: '' })
      toast.sucesso('Senha alterada com sucesso!')
    } catch (err) {
      setErro(err.message || 'Falha ao alterar senha.')
    } finally {
      setEnviando(false)
    }
  }

  const caixa = 'flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm'

  return (
    <form onSubmit={salvar} className={caixa} noValidate>
      <h3 className="font-semibold text-stone-900 text-base">Alterar Senha</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Campo rotulo="Senha atual">{(id) => <input id={id} type="password" value={f.atual} onChange={(e) => setF({ ...f, atual: e.target.value })} className={inputClasse} autoComplete="current-password" />}</Campo>
        <Campo rotulo="Nova senha">{(id) => <input id={id} type="password" value={f.nova} onChange={(e) => setF({ ...f, nova: e.target.value })} className={inputClasse} autoComplete="new-password" />}</Campo>
        <Campo rotulo="Confirmar nova senha">{(id) => <input id={id} type="password" value={f.confirmar} onChange={(e) => setF({ ...f, confirmar: e.target.value })} className={inputClasse} autoComplete="new-password" />}</Campo>
      </div>
      {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
      <button type="submit" disabled={enviando} className={`${botaoPrimario} self-end mt-2`}>
        {enviando ? 'Alterando...' : 'Alterar senha'}
      </button>
    </form>
  )
}