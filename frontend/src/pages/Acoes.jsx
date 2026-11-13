import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  FileText, PlusCircle, ShieldAlert, UserCog, Megaphone, BarChart3, Building2, Gavel, LogIn, UserPlus, Hourglass, Ban,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PERFIL } from '../data/enums'
import { buscarOng } from '../services/ongService'
import { Carregando } from '../components/ui'
import MinhasPublicacoes from '../components/acoes/MinhasPublicacoes'
import PublicacaoForm from '../components/acoes/PublicacaoForm'
import DenunciaForm from '../components/acoes/DenunciaForm'
import CampanhasOng from '../components/acoes/CampanhasOng'
import MeuPerfil from '../components/acoes/MeuPerfil'
import { AdminMetricas, AdminDenuncias, AdminOngs, AdminModeracao } from '../components/acoes/Admin'

// quais abas cada perfil enxerga (RF05 - diferenciação de perfis)
const ABAS = {
  VISITANTE: [
    { id: 'denuncia', rotulo: 'Denúncia anônima', icone: ShieldAlert },
  ],
  USUARIO_COMUM: [
    { id: 'publicacoes', rotulo: 'Minhas publicações', icone: FileText },
    { id: 'nova', rotulo: 'Nova publicação', icone: PlusCircle },
    { id: 'denuncia', rotulo: 'Denúncia anônima', icone: ShieldAlert },
    { id: 'perfil', rotulo: 'Meu perfil', icone: UserCog },
  ],
  ONG: [
    { id: 'publicacoes', rotulo: 'Animais e publicações', icone: FileText },
    { id: 'nova', rotulo: 'Nova publicação', icone: PlusCircle },
    { id: 'campanhas', rotulo: 'Campanhas', icone: Megaphone },
    { id: 'perfil', rotulo: 'Instituição e perfil', icone: UserCog },
    { id: 'denuncia', rotulo: 'Denúncia anônima', icone: ShieldAlert },
  ],
  ADMIN: [
    { id: 'metricas', rotulo: 'Métricas', icone: BarChart3 },
    { id: 'denuncias', rotulo: 'Denúncias', icone: ShieldAlert },
    { id: 'ongs', rotulo: 'Aprovar ONGs', icone: Building2 },
    { id: 'moderacao', rotulo: 'Moderação', icone: Gavel },
  ],
}

// convite para entrar, mostrado a quem ainda não fez login
function ConviteLogin() {
  const { abrirModal } = useAuth()
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-green-700 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div>
        <h2 className="text-xl font-bold">Entre para publicar e gerenciar</h2>
        <p className="mt-1 text-green-100">Com uma conta você cadastra animais, acompanha suas publicações e, se for ONG, divulga campanhas.</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button onClick={() => abrirModal('login')} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-green-800 hover:bg-green-50"><LogIn className="h-4 w-4" /> Entrar</button>
        <button onClick={() => abrirModal('cadastro')} className="inline-flex items-center gap-2 rounded-xl border border-white/60 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"><UserPlus className="h-4 w-4" /> Criar conta</button>
        <button onClick={() => abrirModal('ong')} className="inline-flex items-center gap-2 rounded-xl border border-white/60 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"><Building2 className="h-4 w-4" /> Cadastrar ONG</button>
      </div>
    </div>
  )
}

// aviso para ONG ainda não aprovada ou reprovada
function AvisoOng({ status }) {
  if (status === 'APROVADA' || !status) return null
  const pendente = status === 'PENDENTE'
  const Icone = pendente ? Hourglass : Ban
  return (
    <div className={`flex items-start gap-3 rounded-2xl p-4 text-sm ${pendente ? 'bg-amber-50 text-amber-900' : 'bg-red-50 text-red-800'}`}>
      <Icone className="h-5 w-5 shrink-0" />
      <p>
        {pendente
          ? 'Seu cadastro institucional está em análise. Você já pode preparar publicações e campanhas, mas elas só aparecem para o público depois da aprovação.'
          : 'O cadastro da sua instituição foi reprovado. Revise os dados em "Instituição e perfil" e entre em contato com a administração.'}
      </p>
    </div>
  )
}

function Painel({ perfil, abaInicial }) {
  const { usuario } = useAuth()
  const abas = ABAS[perfil]
  const [aba, setAba] = useState(abas.some((a) => a.id === abaInicial) ? abaInicial : abas[0].id)
  const [statusOng, setStatusOng] = useState(null)

  useEffect(() => {
    if (perfil === 'ONG') buscarOng(usuario.ongId).then((o) => setStatusOng(o?.status))
  }, [perfil, usuario])

  function conteudo() {
    switch (aba) {
      case 'publicacoes': return <MinhasPublicacoes usuario={usuario} onNova={() => setAba('nova')} />
      case 'nova': return (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <PublicacaoForm usuario={usuario} onSalvo={() => setAba('publicacoes')} />
        </div>
      )
      case 'denuncia': return <DenunciaForm />
      case 'perfil': return <MeuPerfil />
      case 'campanhas': return <CampanhasOng ongId={usuario.ongId} />
      case 'metricas': return <AdminMetricas irPara={setAba} />
      case 'denuncias': return <AdminDenuncias />
      case 'ongs': return <AdminOngs />
      case 'moderacao': return <AdminModeracao />
      default: return null
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {perfil === 'VISITANTE' && <ConviteLogin />}
      {perfil === 'ONG' && <AvisoOng status={statusOng} />}

      {/* abas: no celular rolam para o lado */}
      <div role="tablist" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {abas.map(({ id, rotulo, icone: Icone }) => (
          <button key={id} role="tab" aria-selected={aba === id} onClick={() => setAba(id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              aba === id ? 'bg-green-600 text-white shadow-sm' : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
            }`}>
            <Icone className="h-4 w-4" /> {rotulo}
          </button>
        ))}
      </div>

      <div role="tabpanel">{conteudo()}</div>
    </div>
  )
}

// Tela 04: concentra o gerenciamento, organizado pelo perfil de quem está logado
export default function Acoes() {
  const { usuario, pronto } = useAuth()
  const location = useLocation()
  const perfil = usuario?.perfil ?? 'VISITANTE'

  if (!pronto) return <Carregando />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Central de Ações</h1>
        <p className="mt-1 text-stone-500">
          {usuario ? <>Olá, {usuario.nome}! Você está como <strong>{PERFIL[perfil]}</strong>.</> : 'Faça uma denúncia anônima ou entre para gerenciar suas publicações.'}
        </p>
      </div>
      {/* key: ao entrar/sair, o painel recomeça com as abas do novo perfil */}
      <Painel key={`${perfil}-${usuario?.id}`} perfil={perfil} abaInicial={location.state?.aba} />
    </div>
  )
}

