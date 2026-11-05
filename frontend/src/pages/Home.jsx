import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import PublicacaoCard from '../components/PublicacaoCard'
import { listarPublicacoes } from '../services/publicacaoService'
import { TIPO_PUBLICACAO, ESPECIE, PORTE, CIDADES_AMUREL } from '../data/enums'

export default function Home() {
  // estado da tela: o que o usuário escolheu e o que veio do service
  const [filtros, setFiltros] = useState({ tipoPublicacao: '', especie: '', porte: '', cidade: '' })
  const [busca, setBusca] = useState('')
  const [publicacoes, setPublicacoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  // toda vez que os filtros mudam, pede a lista de novo ao service
  useEffect(() => {
    setCarregando(true)
    listarPublicacoes({ ...filtros, status: 'ATIVO' }).then((lista) => {
      setPublicacoes(lista)
      setCarregando(false)
    })
  }, [filtros])

  // muda só um campo do objeto de filtros, mantendo os outros
  function alterarFiltro(campo, valor) {
    setFiltros({ ...filtros, [campo]: valor })
  }

  // a busca por texto é feita aqui na tela, por nome do animal ou título
  const termo = busca.toLowerCase()
  const visiveis = publicacoes.filter(
    (p) => p.titulo.toLowerCase().includes(termo) || p.animal.nome.toLowerCase().includes(termo)
  )

  const selectClasse = 'bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

  return (
    <div className="flex flex-col gap-8">
      {/* apresentação */}
      <section className="rounded-3xl bg-green-700 text-white px-6 py-10 sm:px-10">
        <p className="text-green-200 font-medium">Região da AMUREL · SC</p>
        <h1 className="text-3xl sm:text-4xl font-bold mt-2 max-w-xl">
          Ajude um animal a voltar para casa ou a encontrar uma família.
        </h1>
        <p className="mt-3 text-green-100 max-w-xl">
          Animais perdidos, encontrados e para adoção em Tubarão e região, reunidos num só lugar.
        </p>
      </section>

      {/* filtros */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => alterarFiltro('tipoPublicacao', '')}
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              filtros.tipoPublicacao === '' ? 'bg-green-700 text-white border-green-700' : 'bg-white border-stone-300'
            }`}
          >
            Todos
          </button>
          {Object.entries(TIPO_PUBLICACAO).map(([valor, tipo]) => (
            <button
              key={valor}
              onClick={() => alterarFiltro('tipoPublicacao', valor)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                filtros.tipoPublicacao === valor ? 'bg-green-700 text-white border-green-700' : 'bg-white border-stone-300'
              }`}
            >
              {tipo.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome..."
              className={`${selectClasse} w-full pl-9`}
            />
          </label>

          <select value={filtros.cidade} onChange={(e) => alterarFiltro('cidade', e.target.value)} className={selectClasse}>
            <option value="">Todas as cidades</option>
            {CIDADES_AMUREL.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={filtros.especie} onChange={(e) => alterarFiltro('especie', e.target.value)} className={selectClasse}>
            <option value="">Todas as espécies</option>
            {Object.entries(ESPECIE).map(([valor, label]) => <option key={valor} value={valor}>{label}</option>)}
          </select>

          <select value={filtros.porte} onChange={(e) => alterarFiltro('porte', e.target.value)} className={selectClasse}>
            <option value="">Todos os portes</option>
            {Object.entries(PORTE).map(([valor, label]) => <option key={valor} value={valor}>{label}</option>)}
          </select>
        </div>
      </section>

      {/* resultado */}
      <section>
        {carregando ? (
          <p className="text-stone-500">Carregando animais...</p>
        ) : visiveis.length === 0 ? (
          <p className="text-stone-500">Nenhum animal encontrado com esses filtros.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiveis.map((p) => <PublicacaoCard key={p.id} publicacao={p} />)}
          </div>
        )}
      </section>
    </div>
  )
}
