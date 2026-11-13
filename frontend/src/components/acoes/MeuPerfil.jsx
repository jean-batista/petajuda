import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { atualizarPerfil, alterarSenha } from '../../services/authService'
import { buscarOng, atualizarOng } from '../../services/ongService'
import { CIDADES, STATUS_ONG } from '../../data/enums'
import { formatarTelefone, formatarCnpj, somenteDigitos } from '../../utils/format'
import { Campo, Carregando, Selo, inputClasse, botaoPrimario } from '../ui'
import { useToast } from '../Toast'

const caixa = 'flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5'

function DadosPessoais() {
  const { usuario, atualizarUsuario } = useAuth()
  const toast = useToast()
  const [f, setF] = useState({ nome: usuario.nome, sobrenome: usuario.sobrenome, telefone: formatarTelefone(usuario.telefone) })
  const [erro, setErro] = useState('')

  async function salvar(e) {
    e.preventDefault()
    if (!f.nome.trim() || !f.sobrenome.trim() || somenteDigitos(f.telefone).length < 10) return setErro('Preencha nome, sobrenome e telefone com DDD.')
    setErro('')
    atualizarUsuario(await atualizarPerfil(usuario.id, { nome: f.nome.trim(), sobrenome: f.sobrenome.trim(), telefone: somenteDigitos(f.telefone) }))
    toast.sucesso('Dados atualizados!')
  }

  return (
    <form onSubmit={salvar} className={caixa} noValidate>
      <h3 className="font-semibold">Dados pessoais</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome">{(id) => <input id={id} value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} className={inputClasse} />}</Campo>
        <Campo rotulo="Sobrenome">{(id) => <input id={id} value={f.sobrenome} onChange={(e) => setF({ ...f, sobrenome: e.target.value })} className={inputClasse} />}</Campo>
        <Campo rotulo="E-mail" dica="O e-mail não pode ser alterado.">{(id) => <input id={id} value={usuario.email} disabled className={inputClasse} />}</Campo>
        <Campo rotulo="Telefone (WhatsApp)">{(id) => <input id={id} value={f.telefone} onChange={(e) => setF({ ...f, telefone: formatarTelefone(e.target.value) })} className={inputClasse} />}</Campo>
      </div>
      {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
      <button className={`${botaoPrimario} self-end`}>Salvar dados</button>
    </form>
  )
}

function TrocarSenha() {
  const { usuario } = useAuth()
  const toast = useToast()
  const [f, setF] = useState({ atual: '', nova: '', confirmar: '' })
  const [erro, setErro] = useState('')

  async function salvar(e) {
    e.preventDefault()
    if (f.nova.length < 6) return setErro('A nova senha precisa ter pelo menos 6 caracteres.')
    if (f.nova !== f.confirmar) return setErro('As senhas não coincidem.')
    try {
      await alterarSenha(usuario.id, f.atual, f.nova)
      setErro('')
      setF({ atual: '', nova: '', confirmar: '' })
      toast.sucesso('Senha alterada!')
    } catch (err) {
      setErro(err.message)
    }
  }

  return (
    <form onSubmit={salvar} className={caixa} noValidate>
      <h3 className="font-semibold">Alterar senha</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Campo rotulo="Senha atual">{(id) => <input id={id} type="password" value={f.atual} onChange={(e) => setF({ ...f, atual: e.target.value })} className={inputClasse} autoComplete="current-password" />}</Campo>
        <Campo rotulo="Nova senha">{(id) => <input id={id} type="password" value={f.nova} onChange={(e) => setF({ ...f, nova: e.target.value })} className={inputClasse} autoComplete="new-password" />}</Campo>
        <Campo rotulo="Confirmar nova senha">{(id) => <input id={id} type="password" value={f.confirmar} onChange={(e) => setF({ ...f, confirmar: e.target.value })} className={inputClasse} autoComplete="new-password" />}</Campo>
      </div>
      {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
      <button className={`${botaoPrimario} self-end`}>Alterar senha</button>
    </form>
  )
}

function DadosInstituicao({ ongId }) {
  const toast = useToast()
  const [f, setF] = useState(null)
  const [status, setStatus] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    buscarOng(ongId).then((o) => {
      setStatus(o.status)
      setF({
        nome: o.nome, razaoSocial: o.razaoSocial, cnpj: o.cnpj, chavePix: o.chavePix, descricao: o.descricao,
        cidade: o.endereco.cidade, bairro: o.endereco.bairro, rua: o.endereco.rua, complemento: o.endereco.complemento,
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
    await atualizarOng(ongId, {
      nome: f.nome.trim(), razaoSocial: f.razaoSocial.trim(), chavePix: f.chavePix.trim(), descricao: f.descricao.trim(),
      endereco: { cidade: f.cidade, bairro: f.bairro.trim(), rua: f.rua.trim(), complemento: f.complemento.trim() },
      contato: { telefone: somenteDigitos(f.telefone), email: f.email.trim() },
    })
    toast.sucesso('Dados da instituição atualizados!')
  }

  return (
    <form onSubmit={salvar} className={caixa} noValidate>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">Dados da instituição</h3>
        <Selo classe={STATUS_ONG[status].classe}>{STATUS_ONG[status].label}</Selo>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome da instituição">{(id) => <input id={id} value={f.nome} onChange={mudar('nome')} className={inputClasse} />}</Campo>
        <Campo rotulo="Razão social">{(id) => <input id={id} value={f.razaoSocial} onChange={mudar('razaoSocial')} className={inputClasse} />}</Campo>
        <Campo rotulo="CNPJ" dica="Alterações de CNPJ passam pela administração.">{(id) => <input id={id} value={formatarCnpj(f.cnpj)} disabled className={inputClasse} />}</Campo>
        <Campo rotulo="Chave Pix">{(id) => <input id={id} value={f.chavePix} onChange={mudar('chavePix')} className={inputClasse} />}</Campo>
        <Campo rotulo="Telefone de contato">{(id) => <input id={id} value={f.telefone} onChange={(e) => setF({ ...f, telefone: formatarTelefone(e.target.value) })} className={inputClasse} />}</Campo>
        <Campo rotulo="E-mail de contato">{(id) => <input id={id} type="email" value={f.email} onChange={mudar('email')} className={inputClasse} />}</Campo>
      </div>
      <Campo rotulo="História e apresentação">{(id) => <textarea id={id} rows={3} value={f.descricao} onChange={mudar('descricao')} className={inputClasse} />}</Campo>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo rotulo="Cidade">{(id) => (
          <select id={id} value={f.cidade} onChange={mudar('cidade')} className={inputClasse}>
            {CIDADES.map((c) => <option key={c}>{c}</option>)}
          </select>
        )}</Campo>
        <Campo rotulo="Bairro">{(id) => <input id={id} value={f.bairro} onChange={mudar('bairro')} className={inputClasse} />}</Campo>
        <Campo rotulo="Rua">{(id) => <input id={id} value={f.rua} onChange={mudar('rua')} className={inputClasse} />}</Campo>
        <Campo rotulo="Complemento">{(id) => <input id={id} value={f.complemento} onChange={mudar('complemento')} className={inputClasse} />}</Campo>
      </div>
      {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
      <button className={`${botaoPrimario} self-end`}>Salvar instituição</button>
    </form>
  )
}

// Tela 10: Meu perfil (e dados institucionais, se for ONG)
export default function MeuPerfil() {
  const { usuario } = useAuth()
  return (
    <div className="flex flex-col gap-5">
      {usuario.perfil === 'ONG' && <DadosInstituicao ongId={usuario.ongId} />}
      <DadosPessoais />
      <TrocarSenha />
    </div>
  )
}
