/**
 * @file MeuPerfil.jsx
 * @description Gestão de perfil do usuário logado e dados institucionais de ONG.
 * Utiliza authService e ongService.
 */

import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { atualizarPerfil, alterarSenha } from '../../services/authService'
import { buscarOng, atualizarOng } from '../../services/ongService'
import { CIDADES_AMUREL, STATUS_ONG } from '../../data/enums'
import { formatarTelefone, formatarCnpj, somenteDigitos } from '../../utils/format'
import { Campo, Carregando, Selo, inputClasse, botaoPrimario } from '../ui'
import { useToast } from '../Toast'

const caixa = 'flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm'

function DadosPessoais() {
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

function TrocarSenha() {
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

function DadosInstituicao({ ongId }) {
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

export default function MeuPerfil() {
  const { usuario } = useAuth()
  if (!usuario) return <Carregando />

  return (
    <div className="flex flex-col gap-5">
      {usuario.perfil === 'ONG' && <DadosInstituicao ongId={usuario.ongId} />}
      <DadosPessoais />
      <TrocarSenha />
    </div>
  )
}