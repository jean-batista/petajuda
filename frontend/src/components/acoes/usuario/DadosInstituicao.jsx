import { useEffect, useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { CIDADES_AMUREL, STATUS_ONG } from '../../../data/enums'
import { atualizarOng, buscarOng } from '../../../services/ongService'
import { formatarCnpj, formatarTelefone, somenteDigitos } from '../../../utils/format'
import { Campo, Carregando, Selo, botaoPrimario, inputClasse } from '../../ui/Ui'

export function DadosInstituicao({ ongId }) {
  const toast = useToast()
  const [f, setF] = useState(null)
  const [status, setStatus] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    buscarOng(ongId).then((o) => {
      if (!o) return
      setStatus(o.status)
      setF({
        nome: o.nome, razaoSocial: o.razaoSocial, cnpj: o.cnpj, chavePix: o.chavePix, descricao: o.descricao,
        cidade: o.endereco?.cidade || 'Tubarão', bairro: o.endereco?.bairro || '', rua: o.endereco?.rua || '', complemento: o.endereco?.complemento || '',
        telefone: formatarTelefone(o.contato?.telefone ?? ''), email: o.contato?.email ?? '',
      })
    })
  }, [ongId])

  if (!f) return <Carregando />
  const mudar = (campo) => (e) => setF({ ...f, [campo]: e.target.value })

  async function salvar(e) {
    e.preventDefault()
    if (!f.nome.trim() || !f.razaoSocial.trim() || !f.chavePix.trim() || f.descricao.trim().length < 20) {
      return setErro('Preencha nome, razão social, chave Pix e uma descrição de pelo menos 20 caracteres.')
    }
    setErro('')
    setEnviando(true)
    try {
      await atualizarOng(ongId, {
        nome: f.nome.trim(), razaoSocial: f.razaoSocial.trim(), chavePix: f.chavePix.trim(), descricao: f.descricao.trim(),
        endereco: { estado: 'SC', cidade: f.cidade, bairro: f.bairro.trim(), rua: f.rua.trim(), complemento: f.complemento.trim() },
        contato: { telefone: somenteDigitos(f.telefone), email: f.email.trim() },
      })
      toast.sucesso('Dados da instituição atualizados com sucesso!')
    } catch (err) {
      setErro(err.message || 'Falha ao atualizar dados da ONG.')
    } finally {
      setEnviando(false)
    }
  }

  const infoStatus = STATUS_ONG[status] || { label: status, classe: 'bg-stone-100 text-stone-800 border-stone-200' }
  const caixa = 'flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm'

  return (
    <form onSubmit={salvar} className={caixa} noValidate>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-stone-900 text-base">Dados da Instituição (ONG / Protetor)</h3>
        <Selo classe={`border ${infoStatus.classe}`}>{infoStatus.label}</Selo>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome da instituição">{(id) => <input id={id} value={f.nome} onChange={mudar('nome')} className={inputClasse} />}</Campo>
        <Campo rotulo="Razão social">{(id) => <input id={id} value={f.razaoSocial} onChange={mudar('razaoSocial')} className={inputClasse} />}</Campo>
        <Campo rotulo="CNPJ" dica="Alterações de CNPJ passam por análise administrativa.">{(id) => <input id={id} value={formatarCnpj(f.cnpj)} disabled className={`${inputClasse} bg-stone-100 text-stone-500`} />}</Campo>
        <Campo rotulo="Chave Pix">{(id) => <input id={id} value={f.chavePix} onChange={mudar('chavePix')} className={inputClasse} />}</Campo>
        <Campo rotulo="Telefone de contato">{(id) => <input id={id} value={f.telefone} onChange={(e) => setF({ ...f, telefone: formatarTelefone(e.target.value) })} className={inputClasse} autoComplete="tel" />}</Campo>
        <Campo rotulo="E-mail de contato">{(id) => <input id={id} type="email" value={f.email} onChange={mudar('email')} className={inputClasse} autoComplete="email" />}</Campo>
      </div>
      <Campo rotulo="História e apresentação">{(id) => <textarea id={id} rows={3} value={f.descricao} onChange={mudar('descricao')} className={inputClasse} />}</Campo>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo rotulo="Cidade">{(id) => (
          <select id={id} value={f.cidade} onChange={mudar('cidade')} className={inputClasse}>
            {CIDADES_AMUREL.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}</Campo>
        <Campo rotulo="Bairro">{(id) => <input id={id} value={f.bairro} onChange={mudar('bairro')} className={inputClasse} />}</Campo>
        <Campo rotulo="Rua">{(id) => <input id={id} value={f.rua} onChange={mudar('rua')} className={inputClasse} />}</Campo>
        <Campo rotulo="Complemento">{(id) => <input id={id} value={f.complemento} onChange={mudar('complemento')} className={inputClasse} />}</Campo>
      </div>
      {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
      <button type="submit" disabled={enviando} className={`${botaoPrimario} self-end mt-2`}>
        {enviando ? 'Salvando...' : 'Salvar instituição'}
      </button>
    </form>
  )
}