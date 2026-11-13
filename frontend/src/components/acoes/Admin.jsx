import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Building2, PawPrint, AlertTriangle, Hourglass, FileText, Eye, Trash2, Search, MapPin, ShieldAlert } from 'lucide-react'
import { obterMetricas } from '../../services/adminService'
import { restaurarDemonstracao } from '../../data/store'
import { listarDenuncias, alterarStatusDenuncia } from '../../services/denunciaService'
import { listarTodasOngs, alterarStatusOng } from '../../services/ongService'
import { listarTodasPublicacoes, excluirPublicacao } from '../../services/publicacaoService'
import { listarUsuarios, alterarStatusUsuario } from '../../services/authService'
import { STATUS_DENUNCIA, STATUS_ONG, TIPO_PUBLICACAO, STATUS_PUBLICACAO, PERFIL } from '../../data/enums'
import { formatarData, formatarCnpj } from '../../utils/format'
import Modal from '../Modal'
import ConfirmarModal from '../ConfirmarModal'
import { Carregando, Selo, Vazio, inputClasse, botaoPrimario, botaoSecundario, botaoPerigo } from '../ui'
import { useToast } from '../Toast'
import { useAuth } from '../../context/AuthContext'

// ---------- Tela 14: métricas ----------
export function AdminMetricas({ irPara }) {
  const [m, setM] = useState(null)
  useEffect(() => { obterMetricas().then(setM) }, [])
  if (!m) return <Carregando />

  const cards = [
    { rotulo: 'Usuários cadastrados', valor: m.totalUsuarios, icone: Users },
    { rotulo: 'ONGs aprovadas', valor: m.totalOngs, icone: Building2 },
    { rotulo: 'Publicações ativas', valor: m.publicacoesAtivas, icone: FileText },
    { rotulo: 'Animais resgatados / adotados', valor: m.animaisResolvidos, icone: PawPrint },
    { rotulo: 'Denúncias pendentes', valor: m.denunciasPendentes, icone: AlertTriangle, alerta: m.denunciasPendentes > 0, aba: 'denuncias' },
    { rotulo: 'ONGs aguardando análise', valor: m.ongsPendentes, icone: Hourglass, alerta: m.ongsPendentes > 0, aba: 'ongs' },
  ]

  function restaurar() {
    if (!window.confirm('Apagar tudo o que foi criado e voltar aos dados de exemplo?')) return
    restaurarDemonstracao()
    window.location.assign('/')
  }

  return (
    <div className="flex flex-col gap-6">
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {cards.map(({ rotulo, valor, icone: Icone, alerta, aba }) => (
        <button key={rotulo} onClick={() => aba && irPara(aba)} disabled={!aba}
          className={`flex flex-col items-start gap-2 rounded-2xl border bg-white p-5 text-left ${alerta ? 'border-amber-300' : 'border-stone-200'} ${aba ? 'hover:shadow-md' : 'cursor-default'}`}>
          <Icone className={`h-6 w-6 ${alerta ? 'text-amber-600' : 'text-green-700'}`} />
          <span className="text-3xl font-bold">{valor}</span>
          <span className="text-sm text-stone-500">{rotulo}</span>
          {aba && <span className="text-xs font-semibold text-green-700">Ver agora →</span>}
        </button>
      ))}
    </div>
    <button onClick={restaurar} className={`${botaoSecundario} self-start`}>Restaurar dados de demonstração</button>
    </div>
  )
}

// ---------- Tela 15: triagem de denúncias ----------
export function AdminDenuncias() {
  const toast = useToast()
  const [lista, setLista] = useState(null)
  const [aberta, setAberta] = useState(null)
  const [novoStatus, setNovoStatus] = useState('')

  const carregar = useCallback(() => listarDenuncias().then(setLista), [])
  useEffect(() => { carregar() }, [carregar])

  async function salvar() {
    await alterarStatusDenuncia(aberta.id, novoStatus)
    toast.sucesso('Status da denúncia atualizado.')
    setAberta(null)
    carregar()
  }

  if (lista === null) return <Carregando />
  if (lista.length === 0) return <Vazio icone={ShieldAlert} titulo="Nenhuma denúncia registrada" />

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-stone-50 text-stone-500">
            <tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Local</th><th className="px-4 py-3">Relato</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {lista.map((d) => (
              <tr key={d.id}>
                <td className="whitespace-nowrap px-4 py-3">{formatarData(d.data)}</td>
                <td className="px-4 py-3">{d.endereco.bairro}, {d.endereco.cidade}</td>
                <td className="max-w-xs truncate px-4 py-3 text-stone-600">{d.descricao}</td>
                <td className="px-4 py-3"><Selo classe={STATUS_DENUNCIA[d.status].classe}>{STATUS_DENUNCIA[d.status].label}</Selo></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setAberta(d); setNovoStatus(d.status) }} className={`${botaoSecundario} !px-3 !py-1.5`}>Analisar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {aberta && (
        <Modal titulo="Detalhes da denúncia" tamanho="md" onFechar={() => setAberta(null)}>
          <div className="flex flex-col gap-4">
            <p className="text-xs text-stone-500">Protocolo {aberta.id} · enviada em {formatarData(aberta.data)}</p>
            <p className="text-stone-700">{aberta.descricao}</p>
            <p className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-green-700" />
              <span>{aberta.endereco.rua}, {aberta.endereco.bairro} · {aberta.endereco.cidade}/{aberta.endereco.estado}
                {aberta.endereco.complemento && <span className="block text-stone-500">{aberta.endereco.complemento}</span>}</span>
            </p>
            {aberta.fotoUrl ? <img src={aberta.fotoUrl} alt="Evidência" className="max-h-72 rounded-xl object-contain" /> : <p className="text-sm text-stone-500">Sem foto anexada.</p>}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
                Alterar status
                <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)} className={inputClasse}>
                  {Object.entries(STATUS_DENUNCIA).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                </select>
              </label>
              <button onClick={salvar} className={botaoPrimario}>Salvar</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ---------- Tela 16: aprovação de ONGs ----------
export function AdminOngs() {
  const toast = useToast()
  const [lista, setLista] = useState(null)
  const [filtro, setFiltro] = useState('PENDENTE')

  const carregar = useCallback(() => listarTodasOngs().then(setLista), [])
  useEffect(() => { carregar() }, [carregar])

  async function decidir(ong, status) {
    await alterarStatusOng(ong.id, status)
    toast.sucesso(status === 'APROVADA' ? `${ong.nome} aprovada e visível no site.` : `${ong.nome} reprovada.`)
    carregar()
  }

  if (lista === null) return <Carregando />
  const visiveis = lista.filter((o) => o.status === filtro)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(STATUS_ONG).map(([v, s]) => (
          <button key={v} onClick={() => setFiltro(v)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${filtro === v ? 'border-green-700 bg-green-700 text-white' : 'border-stone-300 bg-white'}`}>
            {s.label} ({lista.filter((o) => o.status === v).length})
          </button>
        ))}
      </div>
      {visiveis.length === 0 ? (
        <Vazio icone={Building2} titulo="Nada por aqui" texto="Nenhuma instituição com este status." />
      ) : visiveis.map((o) => (
        <article key={o.id} className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">{o.nome}</h3>
            <Selo classe={STATUS_ONG[o.status].classe}>{STATUS_ONG[o.status].label}</Selo>
          </div>
          <p className="text-sm text-stone-600">{o.descricao}</p>
          <dl className="grid gap-1 text-sm sm:grid-cols-2">
            <div><dt className="inline text-stone-500">Razão social: </dt><dd className="inline">{o.razaoSocial}</dd></div>
            <div><dt className="inline text-stone-500">CNPJ: </dt><dd className="inline font-mono">{formatarCnpj(o.cnpj)}</dd></div>
            <div><dt className="inline text-stone-500">Cidade: </dt><dd className="inline">{o.endereco.bairro}, {o.endereco.cidade}</dd></div>
            <div><dt className="inline text-stone-500">Contato: </dt><dd className="inline">{o.contato?.email}</dd></div>
          </dl>
          <div className="flex flex-wrap gap-2">
            {o.status !== 'APROVADA' && <button onClick={() => decidir(o, 'APROVADA')} className={botaoPrimario}>Aprovar cadastro</button>}
            {o.status !== 'REPROVADA' && <button onClick={() => decidir(o, 'REPROVADA')} className={botaoPerigo}>Reprovar</button>}
          </div>
        </article>
      ))}
    </div>
  )
}

// ---------- Tela 17: moderação de conteúdo e usuários ----------
export function AdminModeracao() {
  const toast = useToast()
  const { usuario: eu } = useAuth()
  const [modo, setModo] = useState('publicacoes')
  const [busca, setBusca] = useState('')
  const [publicacoes, setPublicacoes] = useState(null)
  const [usuarios, setUsuarios] = useState(null)
  const [excluindo, setExcluindo] = useState(null)

  const carregar = useCallback(() => {
    listarTodasPublicacoes().then(setPublicacoes)
    listarUsuarios().then(setUsuarios)
  }, [])
  useEffect(() => { carregar() }, [carregar])

  async function confirmarExclusao() {
    await excluirPublicacao(excluindo.id)
    toast.sucesso('Publicação removida por moderação.')
    setExcluindo(null)
    carregar()
  }

  async function alternarUsuario(u) {
    await alterarStatusUsuario(u.id, !u.ativo)
    toast.sucesso(u.ativo ? `${u.nome} foi suspenso.` : `${u.nome} foi reativado.`)
    carregar()
  }

  if (!publicacoes || !usuarios) return <Carregando />
  const termo = busca.trim().toLowerCase()
  const pubs = publicacoes.filter((p) => `${p.titulo} ${p.autor.nome}`.toLowerCase().includes(termo))
  const users = usuarios.filter((u) => `${u.nome} ${u.sobrenome} ${u.email}`.toLowerCase().includes(termo))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex gap-2">
          {[['publicacoes', 'Publicações'], ['usuarios', 'Usuários']].map(([v, r]) => (
            <button key={v} onClick={() => setModo(v)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${modo === v ? 'border-green-700 bg-green-700 text-white' : 'border-stone-300 bg-white'}`}>{r}</button>
          ))}
        </div>
        <label className="relative flex-1">
          <span className="sr-only">Buscar</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={modo === 'publicacoes' ? 'Buscar por título ou autor...' : 'Buscar por nome ou e-mail...'} className={`${inputClasse} pl-9`} />
        </label>
      </div>

      {modo === 'publicacoes' ? (
        <ul className="flex flex-col gap-2">
          {pubs.map((p) => (
            <li key={p.id} className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex gap-2">
                  <Selo classe={TIPO_PUBLICACAO[p.tipoPublicacao].classe}>{TIPO_PUBLICACAO[p.tipoPublicacao].label}</Selo>
                  <Selo classe={STATUS_PUBLICACAO[p.status].classe}>{STATUS_PUBLICACAO[p.status].label}</Selo>
                </div>
                <p className="mt-1 truncate font-semibold">{p.titulo}</p>
                <p className="text-sm text-stone-500">por {p.autor.nome} · {p.endereco.cidade} · {formatarData(p.data)}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/publicacoes/${p.id}`} className={`${botaoSecundario} !px-3 !py-1.5`}><Eye className="h-4 w-4" /> Ver</Link>
                <button onClick={() => setExcluindo(p)} className={`${botaoPerigo} !px-3 !py-1.5`}><Trash2 className="h-4 w-4" /> Remover</button>
              </div>
            </li>
          ))}
          {pubs.length === 0 && <p className="text-sm text-stone-500">Nenhuma publicação encontrada.</p>}
        </ul>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">E-mail</th><th className="px-4 py-3">Perfil</th><th className="px-4 py-3">Situação</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium">{u.nome} {u.sobrenome}</td>
                  <td className="px-4 py-3 text-stone-600">{u.email}</td>
                  <td className="px-4 py-3">{PERFIL[u.perfil]}</td>
                  <td className="px-4 py-3"><Selo classe={u.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{u.ativo ? 'Ativo' : 'Suspenso'}</Selo></td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== eu.id && (
                      <button onClick={() => alternarUsuario(u)} className={`${u.ativo ? botaoPerigo : botaoSecundario} !px-3 !py-1.5`}>
                        {u.ativo ? 'Suspender' : 'Reativar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {excluindo && (
        <ConfirmarModal titulo="Remover publicação?" texto={`"${excluindo.titulo}" será removida por violar os termos de uso.`} rotuloConfirmar="Remover"
          onConfirmar={confirmarExclusao} onFechar={() => setExcluindo(null)} />
      )}
    </div>
  )
}
