import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, PlusCircle, SearchX, MapPin, RotateCcw } from 'lucide-react'
import PublicacaoCard from '../components/ui/PublicacaoCard'
import { Carregando, Vazio, inputClasse } from '../components/ui/Ui'
import { listarPublicacoes } from '../services/publicacaoService'
import { listarCidadesPorEstado, listarEstados } from '../services/ibgeService'
import { TIPO_PUBLICACAO, ESPECIE, PORTE } from '../data/enums'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const navigate = useNavigate()
  const { usuario, exigirLogin } = useAuth()

  const estadoUsuario = usuario?.endereco?.estado || usuario?.estado || ''
  const cidadeUsuario = usuario?.endereco?.cidade || usuario?.cidade || ''

  const [filtros, setFiltros] = useState({
    tipoPublicacao: '',
    especie: '',
    porte: '',
    estado: estadoUsuario,
    cidade: cidadeUsuario,
  })

  const [estados, setEstados] = useState([])
  const [cidades, setCidades] = useState([])
  const [carregandoCidades, setCarregandoCidades] = useState(false)

  const [busca, setBusca] = useState('')
  const [publicacoes, setPublicacoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  // Carrega lista de estados do IBGE uma vez
  useEffect(() => {
    let ativo = true
    listarEstados()
      .then((lista) => { if (ativo) setEstados(lista) })
      .catch(() => { if (ativo) setEstados([]) })
    return () => { ativo = false }
  }, [])

  // Carrega cidades sempre que o estado selecionado mudar
  useEffect(() => {
    if (!filtros.estado) {
      setCidades([])
      return
    }
    let ativo = true
    setCarregandoCidades(true)
    listarCidadesPorEstado(filtros.estado)
      .then((lista) => {
        if (ativo) {
          setCidades(lista)
          setCarregandoCidades(false)
        }
      })
      .catch(() => {
        if (ativo) {
          setCidades([])
          setCarregandoCidades(false)
        }
      })
    return () => { ativo = false }
  }, [filtros.estado])

  // Sincroniza a região inicial com o endereço do usuário quando o perfil termina de carregar
  const aplicouRegiaoInicial = useRef(Boolean(estadoUsuario || cidadeUsuario))
  useEffect(() => {
    if (!aplicouRegiaoInicial.current && (estadoUsuario || cidadeUsuario)) {
      aplicouRegiaoInicial.current = true
      setFiltros((prev) => ({
        ...prev,
        estado: estadoUsuario,
        cidade: cidadeUsuario,
      }))
    }
  }, [estadoUsuario, cidadeUsuario])

  // Busca as publicações na API conforme os filtros ativos
  useEffect(() => {
    let ativo = true
    setCarregando(true)
    listarPublicacoes({
      tipoPublicacao: filtros.tipoPublicacao,
      especie: filtros.especie,
      porte: filtros.porte,
      estado: filtros.estado,
      cidade: filtros.cidade,
      status: 'ATIVO',
    })
      .then((lista) => {
        if (!ativo) return
        setPublicacoes(Array.isArray(lista) ? lista : (lista?.content || []))
        setCarregando(false)
      })
      .catch(() => {
        if (ativo) {
          setPublicacoes([])
          setCarregando(false)
        }
      })
    return () => { ativo = false }
  }, [filtros])

  function alterarFiltro(campo, valor) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  function alterarEstado(novoEstado) {
    setFiltros((prev) => ({
      ...prev,
      estado: novoEstado,
      cidade: '', // Limpa a cidade ao trocar de estado para não manter cidade de outra UF
    }))
  }

  function voltarParaMinhaRegiao() {
    setFiltros((prev) => ({
      ...prev,
      estado: estadoUsuario,
      cidade: cidadeUsuario,
    }))
  }

  function limparRegiao() {
    setFiltros((prev) => ({
      ...prev,
      estado: '',
      cidade: '',
    }))
  }

  function publicar() {
    if (exigirLogin('/acoes', { aba: 'nova' })) navigate('/acoes', { state: { aba: 'nova' } })
  }

  const termo = busca.trim().toLowerCase()
  const visiveis = publicacoes.filter(
    (p) => (p.titulo?.toLowerCase() || '').includes(termo) || (p.animal?.nome?.toLowerCase() || '').includes(termo)
  )

  const pill = (ativo) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition ${
      ativo ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-stone-300 bg-white hover:bg-stone-100 text-stone-700'
    }`

  const rotuloRegiao = filtros.cidade && filtros.estado
    ? `${filtros.cidade} · ${filtros.estado}`
    : filtros.cidade
      ? filtros.cidade
      : filtros.estado
        ? `Estado: ${filtros.estado}`
        : 'Todas as regiões'

  const estaNaRegiaoDoUsuario =
    Boolean(estadoUsuario || cidadeUsuario) &&
    filtros.estado === estadoUsuario &&
    filtros.cidade === cidadeUsuario

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl bg-emerald-700 px-6 py-10 text-white sm:px-10 shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800/70 px-3 py-1 text-sm font-medium text-emerald-100">
          <MapPin className="h-4 w-4 text-emerald-300" />
          <span>{rotuloRegiao}</span>
        </div>

        <h1 className="mt-3 max-w-xl text-3xl font-bold sm:text-4xl">
          Ajude um animal a voltar para casa ou a encontrar uma família.
        </h1>
        <p className="mt-3 max-w-xl text-emerald-100">
          {filtros.cidade
            ? `Animais perdidos, encontrados e para adoção em ${filtros.cidade}, reunidos num só lugar.`
            : 'Animais perdidos, encontrados e para adoção em todo o Brasil, reunidos num só lugar.'}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={publicar}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 transition hover:bg-emerald-50 shadow-sm"
          >
            <PlusCircle className="h-5 w-5" /> Publicar um animal
          </button>

          {(filtros.estado || filtros.cidade) && (
            <button
              type="button"
              onClick={limparRegiao}
              className="rounded-xl border border-emerald-500/70 bg-emerald-800/40 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-800"
            >
              Ver todas as regiões
            </button>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
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

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {(estadoUsuario || cidadeUsuario) && !estaNaRegiaoDoUsuario && (
              <button
                type="button"
                onClick={voltarParaMinhaRegiao}
                className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Minha região ({cidadeUsuario || estadoUsuario})
              </button>
            )}
            {(filtros.estado || filtros.cidade) && (
              <button
                type="button"
                onClick={limparRegiao}
                className="font-medium text-stone-500 hover:text-stone-800 hover:underline"
              >
                Limpar filtro regional
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Buscar por nome</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome..."
              className={`${inputClasse} pl-9`}
            />
          </label>

          <select
            aria-label="Estado"
            value={filtros.estado}
            onChange={(e) => alterarEstado(e.target.value)}
            className={inputClasse}
          >
            <option value="">Todos os estados</option>
            {estados.map((uf) => (
              <option key={uf.sigla} value={uf.sigla}>
                {uf.nome} ({uf.sigla})
              </option>
            ))}
          </select>

          <select
            aria-label="Cidade"
            value={filtros.cidade}
            onChange={(e) => alterarFiltro('cidade', e.target.value)}
            disabled={!filtros.estado || carregandoCidades}
            className={`${inputClasse} disabled:bg-stone-100 disabled:text-stone-400`}
          >
            <option value="">
              {!filtros.estado
                ? 'Selecione um estado'
                : carregandoCidades
                  ? 'Carregando cidades...'
                  : 'Todas as cidades'}
            </option>
            {cidades.map((nomeCidade) => (
              <option key={nomeCidade} value={nomeCidade}>
                {nomeCidade}
              </option>
            ))}
          </select>

          <select
            aria-label="Espécie"
            value={filtros.especie}
            onChange={(e) => alterarFiltro('especie', e.target.value)}
            className={inputClasse}
          >
            <option value="">Todas as espécies</option>
            {Object.entries(ESPECIE).map(([valor, label]) => (
              <option key={valor} value={valor}>{label}</option>
            ))}
          </select>

          <select
            aria-label="Porte"
            value={filtros.porte}
            onChange={(e) => alterarFiltro('porte', e.target.value)}
            className={inputClasse}
          >
            <option value="">Todos os portes</option>
            {Object.entries(PORTE).map(([valor, label]) => (
              <option key={valor} value={valor}>{label}</option>
            ))}
          </select>
        </div>
      </section>

      <section>
        {carregando ? (
          <Carregando texto="Carregando animais..." />
        ) : visiveis.length === 0 ? (
          <Vazio
            icone={SearchX}
            titulo={filtros.cidade ? `Nenhum animal encontrado em ${filtros.cidade}` : 'Nenhum animal encontrado'}
            texto="Tente mudar os filtros ou selecionar outra cidade/estado."
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-stone-500">
              {visiveis.length} {visiveis.length === 1 ? 'animal' : 'animais'}
              {filtros.cidade ? ` em ${filtros.cidade}` : filtros.estado ? ` em ${filtros.estado}` : ''}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visiveis.map((p) => <PublicacaoCard key={p.id} publicacao={p} />)}
            </div>
          </>
        )}
      </section>
    </div>
  )
}