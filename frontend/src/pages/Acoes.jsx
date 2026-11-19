import {
  BarChart3, Building, Building2,
  FileText,
  Gavel,
  LogIn,
  Megaphone,
  PawPrint,
  PlusCircle, ShieldAlert, UserCog,
  UserPlus,
} from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AdminDenuncias } from '../components/acoes/admin/AdminDenuncias'
import { AdminMetricas } from '../components/acoes/admin/AdminMetricas'
import { AdminModeracao } from '../components/acoes/admin/AdminModeracao'
import { CampanhasOng } from '../components/acoes/campanhas/CampanhasOng'
import DenunciaForm from '../components/acoes/denuncia/DenunciaForm'
import { OngForm } from '../components/acoes/ongs/OngForm'
import PublicacaoForm from '../components/acoes/publicacao/PublicacaoForm'
import MeuPerfil from '../components/acoes/usuario/MeuPerfil'
import MeusAnimais from '../components/acoes/usuario/MeusAnimais'
import MinhasPublicacoes from '../components/acoes/usuario/MinhasPublicacoes'
import { Carregando } from '../components/ui/Ui'
import { useAuth } from '../context/AuthContext'
import { PERFIL } from '../data/enums'

const ABAS = {
  VISITANTE: [
    { id: 'denuncia', rotulo: 'Denúncia anônima', icone: ShieldAlert },
  ],
  USUARIO_COMUM: [
    { id: 'publicacoes', rotulo: 'Minhas publicações', icone: FileText },
    { id: 'nova', rotulo: 'Nova publicação', icone: PlusCircle },
    { id: 'animais', rotulo: 'Meus animais', icone: PawPrint },
    { id: 'denuncia', rotulo: 'Denúncia anônima', icone: ShieldAlert },
    { id: 'ongs', rotulo: 'Cadastrar Ong', icone: Building },
    { id: 'perfil', rotulo: 'Meu perfil', icone: UserCog },
  ],
  ONG: [
    { id: 'publicacoes', rotulo: 'Publicações', icone: FileText },
    { id: 'nova', rotulo: 'Nova publicação', icone: PlusCircle },
    { id: 'animais', rotulo: 'Animais cadastrados', icone: PawPrint },
    { id: 'campanhas', rotulo: 'Campanhas', icone: Megaphone },
    { id: 'perfil', rotulo: 'Instituição e perfil', icone: UserCog },
    { id: 'denuncia', rotulo: 'Denúncia anônima', icone: ShieldAlert },
  ],
  ADMIN: [
    { id: 'metricas', rotulo: 'Métricas', icone: BarChart3 },
    { id: 'denuncias', rotulo: 'Denúncias', icone: ShieldAlert },
    { id: 'moderacao', rotulo: 'Moderação', icone: Gavel },
    { id: 'perfil', rotulo: 'Meu perfil', icone: UserCog },
  ],
}

function ConviteLogin() {
  const { abrirModal } = useAuth()
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-emerald-700 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8 shadow-sm">
      <div>
        <h2 className="text-xl font-bold">Entre para publicar e gerenciar</h2>
        <p className="mt-1 text-emerald-100 text-sm">Com uma conta você cadastra animais, acompanha suas publicações e, se for ONG, divulga campanhas.</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button onClick={() => abrirModal('login')} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 shadow-sm"><LogIn className="h-4 w-4" /> Entrar</button>
        <button onClick={() => abrirModal('cadastro')} className="inline-flex items-center gap-2 rounded-xl border border-white/60 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"><UserPlus className="h-4 w-4" /> Criar conta</button>
        <button onClick={() => abrirModal('ong')} className="inline-flex items-center gap-2 rounded-xl border border-white/60 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"><Building2 className="h-4 w-4" /> Cadastrar ONG</button>
      </div>
    </div>
  )
}

function Painel({ perfil, abaInicial }) {
  const { usuario } = useAuth()
  const abas = ABAS[perfil] || ABAS.VISITANTE
  const [aba, setAba] = useState(abas.some((a) => a.id === abaInicial) ? abaInicial : abas[0].id)

  function conteudo() {
    switch (aba) {
      case 'publicacoes': return <MinhasPublicacoes usuario={usuario} onNova={() => setAba('nova')} />
      case 'nova': return (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
          <PublicacaoForm usuario={usuario} onSalvo={() => setAba('publicacoes')} />
        </div>
      )
      case 'animais': return <MeusAnimais usuario={usuario} />
      case 'denuncia': return <DenunciaForm />
      case 'perfil': return <MeuPerfil />
      case 'campanhas': return <CampanhasOng ongId={usuario?.ongId} />
      case 'metricas': return <AdminMetricas />
      case 'denuncias': return <AdminDenuncias />
      case 'ongs': return <OngForm />
      case 'moderacao': return <AdminModeracao />
      default: return null
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {perfil === 'VISITANTE' && <ConviteLogin />}

      <div role="tablist" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {abas.map(({ id, rotulo, icone: Icone }) => (
          <button key={id} role="tab" aria-selected={aba === id} onClick={() => setAba(id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition shadow-sm ${
              aba === id ? 'bg-emerald-600 text-white' : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
            }`}>
            <Icone className="h-4 w-4" /> {rotulo}
          </button>
        ))}
      </div>

      <div role="tabpanel">{conteudo()}</div>
    </div>
  )
}

export default function Acoes() {
  const { usuario, pronto } = useAuth()
  const location = useLocation()
  const temOng = Boolean(usuario?.ongId || usuario?.ong?.id)
  const perfil = usuario
    ? (usuario.perfil === 'ADMIN' ? 'ADMIN' : (temOng || usuario.perfil === 'ONG' ? 'ONG' : 'USUARIO_COMUM'))
    : 'VISITANTE'

  if (!pronto) return <Carregando />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Central de Ações</h1>
        <p className="mt-1 text-stone-500">
          {usuario ? <>Olá, {usuario.nome || usuario.nomeCompleto?.split(' ')[0]}! Você está como <strong>{PERFIL[perfil] || perfil}</strong>.</> : 'Faça uma denúncia anônima ou entre para gerenciar suas publicações.'}
        </p>
      </div>
      <Painel key={`${perfil}-${usuario?.id}-${usuario?.ongId || ''}`} perfil={perfil} abaInicial={location.state?.aba} />
    </div>
  )
}