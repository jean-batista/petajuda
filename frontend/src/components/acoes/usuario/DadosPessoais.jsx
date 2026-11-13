import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { CIDADES_AMUREL } from '../../../data/enums'
import { atualizarPerfil } from '../../../services/authService'
import { formatarTelefone, somenteDigitos } from '../../../utils/format'
import { Campo, botaoPrimario, inputClasse } from '../../ui/Ui'

export function DadosPessoais() {
  const { usuario, atualizarUsuario } = useAuth()
  const toast = useToast()
  
  const [f, setF] = useState({ 
    nome: usuario.nome || usuario.nomeCompleto?.split(' ')[0] || '', 
    sobrenome: usuario.sobrenome || usuario.nomeCompleto?.split(' ').slice(1).join(' ') || '', 
    telefone: formatarTelefone(usuario.telefone || ''),
    nascimento: usuario.nascimento || '',
    estado: usuario.endereco?.estado || 'SC',
    cidade: usuario.endereco?.cidade || '',
    bairro: usuario.endereco?.bairro || '',
    rua: usuario.endereco?.rua || '',
    complemento: usuario.endereco?.complemento || ''
  })
  
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function salvar(e) {
    e.preventDefault()
    if (!f.nome.trim() || !f.sobrenome.trim() || somenteDigitos(f.telefone).length < 10 || !f.nascimento || !f.cidade.trim() || !f.bairro.trim() || !f.rua.trim()) {
      return setErro('Preencha todos os campos obrigatórios (Nome, Sobrenome, Telefone, Nascimento e Endereço).')
    }
    setErro('')
    setEnviando(true)
    try {
      const response = await atualizarPerfil(usuario.id, { 
        nome: f.nome.trim(), 
        sobrenome: f.sobrenome.trim(), 
        telefone: somenteDigitos(f.telefone),
        nascimento: f.nascimento,
        endereco: {
          estado: f.estado,
          cidade: f.cidade,
          bairro: f.bairro.trim(),
          rua: f.rua.trim(),
          complemento: f.complemento.trim()
        }
      })
      atualizarUsuario(response)
      toast.sucesso('Dados pessoais atualizados com sucesso!')
    } catch (err) {
      setErro(err.message || 'Falha ao atualizar perfil.')
    } finally {
      setEnviando(false)
    }
  }

  const caixa = 'flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm'

  return (
    <form onSubmit={salvar} className={caixa} noValidate>
      <h3 className="font-semibold text-stone-900 text-base">Dados Pessoais & Endereço</h3>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome">{(id) => <input id={id} value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} className={inputClasse} autoComplete="given-name" />}</Campo>
        <Campo rotulo="Sobrenome">{(id) => <input id={id} value={f.sobrenome} onChange={(e) => setF({ ...f, sobrenome: e.target.value })} className={inputClasse} autoComplete="family-name" />}</Campo>
        <Campo rotulo="E-mail" dica="O e-mail é a chave de acesso e não pode ser alterado aqui.">{(id) => <input id={id} value={usuario.email} disabled className={`${inputClasse} bg-stone-100 text-stone-500`} />}</Campo>
        <Campo rotulo="Telefone (WhatsApp)">{(id) => <input id={id} value={f.telefone} onChange={(e) => setF({ ...f, telefone: formatarTelefone(e.target.value) })} className={inputClasse} autoComplete="tel" />}</Campo>
        <Campo rotulo="Data de Nascimento">{(id) => <input id={id} type="date" value={f.nascimento} onChange={(e) => setF({ ...f, nascimento: e.target.value })} className={inputClasse} />}</Campo>
      </div>

      <div className="border-t border-stone-100 pt-4 mt-2">
        <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-3">Endereço Residencial</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
          <Campo rotulo="Cidade">{(id) => (
            <select id={id} value={f.cidade} onChange={(e) => setF({ ...f, cidade: e.target.value })} className={inputClasse}>
              <option value="">Selecione a cidade</option>
              {CIDADES_AMUREL.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}</Campo>
          <Campo rotulo="Bairro">{(id) => <input id={id} value={f.bairro} onChange={(e) => setF({ ...f, bairro: e.target.value })} className={inputClasse} />}</Campo>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo rotulo="Rua">{(id) => <input id={id} value={f.rua} onChange={(e) => setF({ ...f, rua: e.target.value })} className={inputClasse} />}</Campo>
          <Campo rotulo="Complemento">{(id) => <input id={id} value={f.complemento} onChange={(e) => setF({ ...f, complemento: e.target.value })} className={inputClasse} />}</Campo>
        </div>
      </div>

      {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
      <button type="submit" disabled={enviando} className={`${botaoPrimario} self-end mt-2`}>
        {enviando ? 'Salvando...' : 'Salvar dados'}
      </button>
    </form>
  )
}