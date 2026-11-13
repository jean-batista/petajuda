import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, PlusCircle, SearchX } from 'lucide-react'
import PublicacaoCard from '../components/PublicacaoCard'
import { Carregando, Vazio, inputClasse } from '../components/ui'
import { listarPublicacoes } from '../services/publicacaoService'
import { TIPO_PUBLICACAO, ESPECIE, PORTE, CIDADES_AMUREL } from '../data/enums'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const navigate = useNavigate()
  const { exigirLogin } = useAuth()

  // estado da tela: o que o usuário escolheu e o que veio do service
  const [filtros, setFiltros] = useState({ tipoPublicacao: '', especie: '', porte: '', cidade: '' })
  const [busca, setBusca] = useState('')
  const [publicacoes, setPublicacoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  // toda vez que os filtros mudam, pede a lista de novo ao service.
  // "ativo" evita que uma resposta antiga (mais lenta) sobrescreva a mais nova.
  useEffect(() => {
    let ativo = true
    setCarregando(true)
    listarPublicacoes({ ...filtros, status: 'ATIVO' }).then((lista) => {
      if (!ativo) return
      setPublicacoes(lista)
      setCarregando(false)
    })
    return () => { ativo = false }
  }, [filtros])

  // muda só um campo do objeto de filtros, mantendo os outros
  function alterarFiltro(campo, valor) {
    setFiltros({ ...filtros, [campo]: valor })
  }

  function publicar() {
    // visitante pode navegar à vontade; o login só é pedido aqui
    if (exigirLogin('/acoes', { aba: 'nova' })) navigate('/acoes', { state: { aba: 'nova' } })
  }

  // a busca por texto é feita aqui na tela, por nome do animal ou título
  const termo = busca.trim().toLowerCase()
  const visiveis = publicacoes.filter(
    (p) => p.titulo.toLowerCase().includes(termo) || p.animal.nome.toLowerCase().includes(termo)
  )

  const pill = (ativo) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition ${
      ativo ? 'border-green-700 bg-green-700 text-white' : 'border-stone-300 bg-white hover:bg-stone-100'
    }`

  return (
    <div className="flex flex-col gap-8">
      {/* apresentação */}
      <section className="rounded-3xl bg-green-700 px-6 py-10 text-white sm:px-10">
        <p className="font-medium text-green-200">Região da AMUREL · SC</p>
        <h1 className="mt-2 max-w-xl text-3xl font-bold sm:text-4xl">
          Ajude um animal a voltar para casa ou a encontrar uma família.
        </h1>
        <p className="mt-3 max-w-xl text-green-100">
          Animais perdidos, encontrados e para adoção em Tubarão e região, reunidos num só lugar.
        </p>
        <button
          onClick={publicar}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-green-800 transition hover:bg-green-50"
        >
          <PlusCircle className="h-5 w-5" /> Publicar um animal
        </button>
      </section>

      {/* filtros */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => alterarFiltro('tipoPublicacao', '')} className={pill(filtros.tipoPublicacao === '')}>
            Todos
          </button>
          {Object.entries(TIPO_PUBLICACAO).map(([valor, tipo]) => (
            <button key={valor} onClick={() => alterarFiltro('tipoPublicacao', valor)} className={pill(filtros.tipoPublicacao === valor)}>
              {tipo.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Buscar por nome</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome..." className={`${inputClasse} pl-9`} />
          </label>

          <select aria-label="Cidade" value={filtros.cidade} onChange={(e) => alterarFiltro('cidade', e.target.value)} className={inputClasse}>
            <option value="">Todas as cidades</option>
            {CIDADES_AMUREL.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select aria-label="Espécie" value={filtros.especie} onChange={(e) => alterarFiltro('especie', e.target.value)} className={inputClasse}>
            <option value="">Todas as espécies</option>
            {Object.entries(ESPECIE).map(([valor, label]) => <option key={valor} value={valor}>{label}</option>)}
          </select>

          <select aria-label="Porte" value={filtros.porte} onChange={(e) => alterarFiltro('porte', e.target.value)} className={inputClasse}>
            <option value="">Todos os portes</option>
            {Object.entries(PORTE).map(([valor, label]) => <option key={valor} value={valor}>{label}</option>)}
          </select>
        </div>
      </section>

      {/* resultado */}
      <section>
        {carregando ? (
          <Carregando texto="Carregando animais..." />
        ) : visiveis.length === 0 ? (
          <Vazio icone={SearchX} titulo="Nenhum animal encontrado" texto="Tente mudar os filtros ou buscar em outra cidade da região." />
        ) : (
          <>
            <p className="mb-4 text-sm text-stone-500">{visiveis.length} {visiveis.length === 1 ? 'animal' : 'animais'}</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visiveis.map((p) => <PublicacaoCard key={p.id} publicacao={p} />)}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
