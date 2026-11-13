import { useCallback, useEffect, useState } from 'react'
import { Search, MapPin, ShieldAlert, CheckCircle, XCircle, PlusCircle, Pencil, Megaphone, Power } from 'lucide-react'
import { formatarData } from '../../utils/format'
import Modal from '../Modal'
import { Carregando, Selo, Vazio, Campo, inputClasse, botaoPrimario, botaoSecundario, botaoPerigo } from '../ui'
import { useToast } from '../Toast'
import { useAuth } from '../../context/AuthContext'
import { listarCampanhasDaOng, criarCampanha, atualizarCampanha } from '../../services/ongService'

// Constantes da API e utilitários de cabeçalho
const BASE_URL = 'http://localhost:8080/api/v1'
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('petajuda_token')}`
})

// Enums mapeados perfeitamente com os retornos do Backend (StatusDenuncia e PerfilUsuario)
const STATUS_DENUNCIA = {
  PENDENTE: { label: 'Pendente', classe: 'bg-amber-100 text-amber-800 border-amber-200' },
  EM_ANALISE: { label: 'Em Análise', classe: 'bg-blue-100 text-blue-800 border-blue-200' },
  CONCLUIDA: { label: 'Concluída', classe: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  RESOLVIDO: { label: 'Resolvido', classe: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  DESCARTADA: { label: 'Descartada', classe: 'bg-stone-100 text-stone-800 border-stone-200' }
}

const PERFIL = {
  USUARIO_COMUM: 'Usuário Comum',
  ADMIN: 'Administrador'
}

// ---------- Tela: Triagem de Denúncias ----------
export function AdminDenuncias() {
  const toast = useToast()
  const [lista, setLista] = useState(null)
  const [aberta, setAberta] = useState(null)
  const [novoStatus, setNovoStatus] = useState('')

  // Chama o GET /api/v1/denuncias (Restrito a ROLE_ADMIN)
  const carregar = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/denuncias`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Falha ao carregar triagem de denúncias.')
      setLista(await res.json())
    } catch (err) {
      toast.erro?.(err.message) || console.error(err)
      setLista([])
    }
  }, [toast])

  useEffect(() => { carregar() }, [carregar])

  // Dispara o PATCH /api/v1/denuncias/{id}/status?status=X
  async function salvar() {
    try {
      const res = await fetch(`${BASE_URL}/denuncias/${aberta.id}/status?status=${novoStatus}`, {
        method: 'PATCH',
        headers: getHeaders()
      })
      if (!res.ok) throw new Error('Falha ao atualizar o status na base de dados.')
      toast.sucesso?.('Status da denúncia atualizado com sucesso.')
      setAberta(null)
      carregar() // Recarrega a listagem
    } catch (err) {
      toast.erro?.(err.message) || console.error(err)
    }
  }

  if (lista === null) return <Carregando />
  if (lista.length === 0) return <Vazio icone={ShieldAlert} titulo="Nenhuma denúncia registrada no sistema" />

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Local</th>
              <th className="px-4 py-3 font-medium">Relato / Título</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {lista.map((d) => {
              const infoStatus = STATUS_DENUNCIA[d.status] || STATUS_DENUNCIA.PENDENTE
              return (
                <tr key={d.id} className="hover:bg-stone-50 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3">{formatarData(d.data || d.dataRegistro)}</td>
                  <td className="px-4 py-3 truncate max-w-[150px]">{d.endereco?.bairro}, {d.endereco?.cidade}</td>
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-stone-700">{d.titulo}</td>
                  <td className="px-4 py-3"><Selo classe={`border ${infoStatus.classe}`}>{infoStatus.label}</Selo></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setAberta(d); setNovoStatus(d.status) }} className={`${botaoSecundario} !px-3 !py-1.5`}>Analisar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes da Denúncia */}
      {aberta && (
        <Modal titulo="Analisar Denúncia" tamanho="md" onFechar={() => setAberta(null)}>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-mono text-stone-400 mb-1">Protocolo: {aberta.id}</p>
              <h3 className="font-bold text-lg text-stone-800 leading-tight">{aberta.titulo}</h3>
            </div>
            
            <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">{aberta.descricao}</p>
            
            <div className="rounded-xl bg-emerald-50/50 p-3 border border-emerald-100/50">
              <p className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span className="text-stone-700">{aberta.endereco?.rua}, {aberta.endereco?.bairro} · {aberta.endereco?.cidade}/{aberta.endereco?.estado}
                  {aberta.endereco?.complemento && <span className="block text-stone-500 mt-0.5 text-xs">{aberta.endereco.complemento}</span>}</span>
              </p>
            </div>

            {aberta.fotoUrl ? (
              <img src={aberta.fotoUrl} alt="Evidência fotográfica" className="max-h-72 w-full rounded-xl object-contain bg-stone-100 border border-stone-200" />
            ) : (
              <div className="flex h-24 items-center justify-center rounded-xl bg-stone-50 border border-dashed border-stone-300">
                <p className="text-sm text-stone-400">Nenhuma evidência fotográfica anexada.</p>
              </div>
            )}
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end mt-2 pt-4 border-t border-stone-100">
              <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-stone-700">
                Alterar status de triagem
                <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)} className={inputClasse}>
                  {Object.entries(STATUS_DENUNCIA).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                </select>
              </label>
              <button onClick={salvar} className={botaoPrimario}>Salvar Alteração</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ---------- Tela: Moderação de Usuários ----------
export function AdminModeracao() {
  const toast = useToast()
  const { usuario: eu } = useAuth() // Para impedir auto-bloqueio
  const [busca, setBusca] = useState('')
  const [usuarios, setUsuarios] = useState(null)

  // Chama o GET /api/v1/usuarios que retorna dados paginados do Spring Data (Page<UsuarioInfoResponse>)
  const carregar = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/usuarios`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Falha ao carregar lista de usuários.')
      const data = await res.json()
      setUsuarios(data.content || data) // Extrai o array 'content' da paginação
    } catch (err) {
      toast.erro?.(err.message) || console.error(err)
      setUsuarios([])
    }
  }, [toast])

  useEffect(() => { carregar() }, [carregar])

  // Dispara PATCH /api/v1/usuarios/{id}/desativar OU reativar
  async function alternarUsuario(u) {
    try {
      const endpoint = u.ativo ? 'desativar' : 'reativar'
      const res = await fetch(`${BASE_URL}/usuarios/${u.id}/${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders()
      })
      if (!res.ok) throw new Error(`Falha ao ${endpoint} o usuário.`)
      toast.sucesso?.(u.ativo ? `${u.nomeCompleto} foi suspenso da plataforma.` : `${u.nomeCompleto} teve a conta restaurada.`)
      carregar() // Recarrega a tabela para refletir os status
    } catch (err) {
      toast.erro?.(err.message) || console.error(err)
    }
  }

  if (usuarios === null) return <Carregando />
  
  const termo = busca.trim().toLowerCase()
  const usersFiltrados = usuarios.filter((u) => `${u.nomeCompleto} ${u.email}`.toLowerCase().includes(termo))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row mb-2">
        <label className="relative flex-1">
          <span className="sr-only">Pesquisar contas</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar por nome ou e-mail..." className={`${inputClasse} pl-9`} />
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 font-medium">Nome Completo</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Perfil</th>
              <th className="px-4 py-3 font-medium">Situação</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {usersFiltrados.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-stone-500">Nenhum resultado para a busca.</td></tr>
            ) : (
              usersFiltrados.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-stone-800">{u.nomeCompleto}</td>
                  <td className="px-4 py-3 text-stone-600">{u.email}</td>
                  <td className="px-4 py-3 text-stone-600">{PERFIL[u.tipoPerfil] || u.tipoPerfil}</td>
                  <td className="px-4 py-3">
                    <Selo classe={`border ${u.ativo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {u.ativo ? 'Ativo' : 'Suspenso'}
                    </Selo>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {/* Validação para impedir que o admin suspenda a própria conta acidentalmente */}
                    {u.id !== eu?.id && (
                      <button onClick={() => alternarUsuario(u)} className={`${u.ativo ? botaoPerigo : botaoSecundario} !px-3 !py-1.5 flex items-center justify-center gap-1.5 ml-auto`}>
                        {u.ativo ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        {u.ativo ? 'Suspender' : 'Reativar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const hoje = () => new Date().toISOString().slice(0, 10)

// ---------- Tela: Formulário de Campanha ----------
function FormCampanha({ campanha, onSalvar, onCancelar }) {
  const [f, setF] = useState({
    titulo: campanha?.titulo ?? '', descricao: campanha?.descricao ?? '',
    dataInicio: campanha?.dataInicio ?? hoje(), dataFim: campanha?.dataFim ?? hoje(), ativo: campanha?.ativo ?? true,
  })
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)

  async function enviar(ev) {
    ev.preventDefault()
    const e = {}
    if (f.titulo.trim().length < 5) e.titulo = 'Informe o título da ação.'
    if (f.descricao.trim().length < 10) e.descricao = 'Descreva a necessidade (mínimo 10 caracteres).'
    if (!f.dataInicio) e.dataInicio = 'Informe a data de início.'
    if (!f.dataFim || f.dataFim < f.dataInicio) e.dataFim = 'A data de término não pode ser antes do início.'
    setErros(e)
    if (Object.keys(e).length) return
    setEnviando(true)
    await onSalvar({ ...f, titulo: f.titulo.trim(), descricao: f.descricao.trim() })
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <Campo rotulo="Título da ação" erro={erros.titulo}>{(id) => <input id={id} value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} placeholder="Ex.: Feira de adoção no sábado" className={inputClasse} />}</Campo>
      <Campo rotulo="Descrição da necessidade" erro={erros.descricao}>{(id) => <textarea id={id} rows={3} value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} className={inputClasse} />}</Campo>
      <div className="grid grid-cols-2 gap-4">
        <Campo rotulo="Início" erro={erros.dataInicio}>{(id) => <input id={id} type="date" value={f.dataInicio} onChange={(e) => setF({ ...f, dataInicio: e.target.value })} className={inputClasse} />}</Campo>
        <Campo rotulo="Término" erro={erros.dataFim}>{(id) => <input id={id} type="date" value={f.dataFim} onChange={(e) => setF({ ...f, dataFim: e.target.value })} className={inputClasse} />}</Campo>
      </div>
      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input type="checkbox" checked={f.ativo} onChange={(e) => setF({ ...f, ativo: e.target.checked })} className="h-4 w-4 accent-emerald-600 rounded border-stone-300" />
        Campanha ativa (aparece na página pública da ONG)
      </label>
      <div className="flex justify-end gap-3 mt-2">
        <button type="button" onClick={onCancelar} className={botaoSecundario}>Cancelar</button>
        <button type="submit" disabled={enviando} className={botaoPrimario}>{enviando ? 'Salvando...' : 'Salvar campanha'}</button>
      </div>
    </form>
  )
}

// ---------- Tela: Campanhas da ONG ----------
export default function CampanhasOng({ ongId }) {
  const toast = useToast()
  const [lista, setLista] = useState(null)
  const [editando, setEditando] = useState(null) // objeto da campanha, ou 'nova'

  const carregar = useCallback(() => listarCampanhasDaOng(ongId).then(setLista), [ongId])
  useEffect(() => { carregar() }, [carregar])

  async function salvar(dados) {
    try {
      if (editando === 'nova') await criarCampanha(ongId, dados)
      else await atualizarCampanha(editando.id, dados)
      toast.sucesso?.(editando === 'nova' ? 'Campanha publicada!' : 'Campanha atualizada!')
      setEditando(null)
      carregar()
    } catch (err) {
      toast.erro?.(err.message) || console.error(err)
    }
  }

  async function alternar(c) {
    try {
      await atualizarCampanha(c.id, { ativo: !c.ativo })
      toast.sucesso?.(c.ativo ? 'Campanha desativada.' : 'Campanha ativada.')
      carregar()
    } catch (err) {
    }
  }

  if (lista === null) return <Carregando />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end mb-2">
        <button onClick={() => setEditando('nova')} className={`${botaoPrimario} flex items-center gap-2`}>
          <PlusCircle className="h-4 w-4" /> Nova campanha
        </button>
      </div>
      {lista.length === 0 ? (
        <Vazio icone={Megaphone} titulo="Nenhuma campanha ainda" texto="Divulgue feiras de adoção, vaquinhas e mutirões de castração." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((c) => (
            <li key={c.id} className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-stone-800 leading-tight">{c.titulo}</h4>
                <Selo classe={`border ${c.ativo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone-50 text-stone-600 border-stone-200'}`}>
                  {c.ativo ? 'Ativa' : 'Inativa'}
                </Selo>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed flex-1">{c.descricao}</p>
              <p className="text-[11px] font-medium text-stone-500 bg-stone-50 px-2.5 py-1.5 rounded-lg w-fit border border-stone-100">
                {formatarData(c.dataInicio)} até {formatarData(c.dataFim)}
              </p>
              <div className="mt-2 flex gap-2 pt-4 border-t border-stone-100">
                <button onClick={() => setEditando(c)} className={`${botaoSecundario} !px-3 !py-1.5 flex items-center justify-center gap-1.5 flex-1`}>
                  <Pencil className="h-4 w-4" /> Editar
                </button>
                <button onClick={() => alternar(c)} className={`${botaoSecundario} !px-3 !py-1.5 flex items-center justify-center gap-1.5 flex-1`}>
                  <Power className="h-4 w-4 text-stone-500" /> {c.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {editando && (
        <Modal titulo={editando === 'nova' ? 'Nova campanha' : 'Editar campanha'} onFechar={() => setEditando(null)}>
          <FormCampanha campanha={editando === 'nova' ? null : editando} onSalvar={salvar} onCancelar={() => setEditando(null)} />
        </Modal>
      )}
    </div>
  )
}