import { useEffect, useRef, useState } from 'react'
import { MapPin, Check, CalendarDays, HeartHandshake, MessageCircle, PawPrint, Building2, Copy, RotateCcw } from 'lucide-react'
import { listarOngs, listarCampanhas, listarAnimaisDaOng } from '../services/ongService'
import { listarCidadesPorEstado, listarEstados } from '../services/ibgeService'
import { copiarTexto, formatarData, formatarCnpj, linkWhatsApp } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import PublicacaoCard from '../components/ui/PublicacaoCard'
import { Carregando, Vazio, inputClasse, botaoPrimario, botaoSecundario } from '../components/ui/Ui'

function BoxPix({ chave }) {
  const toast = useToast()
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    const ok = await copiarTexto(chave)
    if (!ok) return toast.erro?.('Não foi possível copiar.')
    setCopiado(true)
    toast.sucesso?.('Chave Pix copiada!')
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 p-3 border border-stone-100">
      <div className="min-w-0">
        <p className="text-xs text-stone-500 font-medium">Chave Pix para doações</p>
        <p className="select-all truncate font-mono text-sm text-stone-800">{chave}</p>
      </div>
      <button onClick={copiar} className={`${botaoPrimario} shrink-0 !px-3 !py-2 text-xs`}>
        {copiado ? <><Check className="h-4 w-4" /> Copiado</> : <><Copy className="h-4 w-4" /> Copiar</>}
      </button>
    </div>
  )
}

function CardCampanha({ campanha }) {
  const inicio = campanha.inicio ?? campanha.dataInicio
  const fim = campanha.fim ?? campanha.dataFim

  return (
    <article className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
      <h3 className="font-semibold text-amber-900">{campanha.titulo}</h3>
      <p className="mt-1 text-sm text-stone-700">{campanha.descricao}</p>
      <p className="mt-3 flex flex-wrap items-center gap-x-1 text-xs font-medium text-stone-600 bg-white/60 px-2.5 py-1.5 rounded-lg w-fit border border-amber-100">
        <CalendarDays className="h-3.5 w-3.5 text-amber-700" />
        {formatarData(inicio)}
        {fim && fim !== inicio && ` até ${formatarData(fim)}`}
        {campanha.ongNome && ` · ${campanha.ongNome}`}
      </p>
    </article>
  )
}

function ModalOng({ ong, onFechar }) {
  const [animais, setAnimais] = useState(null)
  const [campanhas, setCampanhas] = useState(null)

  useEffect(() => {
    let ativo = true
    listarAnimaisDaOng(ong).then((l) => ativo && setAnimais(l || []))
    listarCampanhas({ ongId: ong.id }).then((l) => ativo && setCampanhas(l || []))
    return () => { ativo = false }
  }, [ong])

  return (
    <Modal titulo={ong.nome} tamanho="lg" onFechar={onFechar}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="flex items-center gap-1 text-sm text-stone-500">
            <MapPin className="h-4 w-4 text-emerald-600" />
            {[ong.endereco?.rua, ong.endereco?.bairro].filter(Boolean).join(', ')} · {ong.endereco?.cidade}/{ong.endereco?.estado}
          </p>
          <p className="mt-3 text-stone-700 leading-relaxed">{ong.descricao}</p>
          <p className="mt-2 text-xs text-stone-500 font-mono">{ong.razaoSocial} · CNPJ {formatarCnpj(ong.cnpj)}</p>
        </div>

        {ong.chavePix && <BoxPix chave={ong.chavePix} />}

        {ong.contato?.telefone && (
          <a href={linkWhatsApp(ong.contato.telefone, `Olá! Conheci a ${ong.nome} pelo Pet Ajuda.`)} target="_blank" rel="noreferrer" className={`${botaoSecundario} w-fit flex items-center gap-2`}>
            <MessageCircle className="h-4 w-4 text-emerald-600" /> Falar com a instituição
          </a>
        )}

        <section>
          <h3 className="mb-3 text-lg font-bold text-stone-900">Animais para adoção</h3>
          {animais === null ? <Carregando /> : animais.length === 0 ? (
            <p className="text-sm text-stone-500 bg-stone-50 p-4 rounded-xl text-center">No momento não há animais para adoção cadastrados.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {animais.map((p) => <PublicacaoCard key={p.id} publicacao={p} />)}
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-3 text-lg font-bold text-stone-900">Campanhas ativas</h3>
          {campanhas === null ? <Carregando /> : campanhas.length === 0 ? (
            <p className="text-sm text-stone-500 bg-stone-50 p-4 rounded-xl text-center">Nenhuma campanha ativa agora.</p>
          ) : (
            <div className="grid gap-3">{campanhas.map((c) => <CardCampanha key={c.id} campanha={c} />)}</div>
          )}
        </section>
      </div>
    </Modal>
  )
}

export default function Ongs() {
  const { usuario } = useAuth()
  const estadoUsuario = usuario?.endereco?.estado || usuario?.estado || ''
  const cidadeUsuario = usuario?.endereco?.cidade || usuario?.cidade || ''

  const [estado, setEstado] = useState(estadoUsuario)
  const [cidade, setCidade] = useState(cidadeUsuario)
  const [estados, setEstados] = useState([])
  const [cidades, setCidades] = useState([])
  const [carregandoCidades, setCarregandoCidades] = useState(false)

  const [ongs, setOngs] = useState(null)
  const [campanhas, setCampanhas] = useState(null)
  const [selecionada, setSelecionada] = useState(null)

  useEffect(() => {
    let ativo = true
    listarEstados()
      .then((l) => ativo && setEstados(l))
      .catch(() => ativo && setEstados([]))
    return () => { ativo = false }
  }, [])

  useEffect(() => {
    if (!estado) {
      setCidades([])
      return
    }
    let ativo = true
    setCarregandoCidades(true)
    listarCidadesPorEstado(estado)
      .then((l) => {
        if (ativo) {
          setCidades(l)
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
  }, [estado])

  const aplicouRegiaoInicial = useRef(Boolean(estadoUsuario || cidadeUsuario))
  useEffect(() => {
    if (!aplicouRegiaoInicial.current && (estadoUsuario || cidadeUsuario)) {
      aplicouRegiaoInicial.current = true
      setEstado(estadoUsuario)
      setCidade(cidadeUsuario)
    }
  }, [estadoUsuario, cidadeUsuario])

  useEffect(() => {
    let ativo = true
    setOngs(null)
    setCampanhas(null)
    listarOngs({ estado, cidade }).then((l) => ativo && setOngs(l || []))
    listarCampanhas({ estado, cidade }).then((l) => ativo && setCampanhas(l || []))
    return () => { ativo = false }
  }, [estado, cidade])

  function alterarEstado(novaUf) {
    setEstado(novaUf)
    setCidade('')
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">ONGs e protetores</h1>
          <p className="mt-1 text-stone-500">
            Instituições validadas que cuidam dos animais{cidade ? ` em ${cidade}` : estado ? ` em ${estado}` : ' na sua região'}.
          </p>
          {(estadoUsuario || cidadeUsuario) && (estado !== estadoUsuario || cidade !== cidadeUsuario) && (
            <button
              type="button"
              onClick={() => { setEstado(estadoUsuario); setCidade(cidadeUsuario) }}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Voltar para minha região ({cidadeUsuario || estadoUsuario})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select aria-label="Filtrar por estado" value={estado} onChange={(e) => alterarEstado(e.target.value)} className={`${inputClasse} sm:w-52`}>
            <option value="">Todos os estados</option>
            {estados.map((uf) => (
              <option key={uf.sigla} value={uf.sigla}>{uf.nome} ({uf.sigla})</option>
            ))}
          </select>

          <select
            aria-label="Filtrar por cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            disabled={!estado || carregandoCidades}
            className={`${inputClasse} sm:w-56 disabled:bg-stone-100 disabled:text-stone-400`}
          >
            <option value="">
              {!estado ? 'Selecione um estado' : carregandoCidades ? 'Carregando cidades...' : 'Todas as cidades'}
            </option>
            {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </section>

      <section>
        {ongs === null ? <Carregando texto="Carregando instituições..." /> : ongs.length === 0 ? (
          <Vazio icone={Building2} titulo="Nenhuma ONG nesta região" texto="Tente outra cidade ou veja todas as instituições." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {ongs.map((ong) => (
              <article key={ong.id} className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <HeartHandshake className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-stone-900">{ong.nome}</h2>
                    <p className="flex items-center gap-1 text-sm text-stone-500">
                      <MapPin className="h-4 w-4 shrink-0 text-emerald-600" /> {ong.endereco?.bairro}, {ong.endereco?.cidade}
                    </p>
                  </div>
                </div>

                <p className="line-clamp-3 text-sm text-stone-600 leading-relaxed">{ong.descricao}</p>

                <p className="flex items-center gap-1 text-sm font-medium text-emerald-700 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50 w-fit">
                  <PawPrint className="h-4 w-4" />
                  {ong.totalAnimais || 0} {(ong.totalAnimais === 1) ? 'animal para adoção' : 'animais para adoção'}
                </p>

                <div className="mt-auto flex flex-col gap-3">
                  {ong.chavePix && <BoxPix chave={ong.chavePix} />}
                  <button onClick={() => setSelecionada(ong)} className={botaoPrimario}>Conhecer trabalho & doar</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-stone-900">Campanhas, feiras e ações</h2>
        {campanhas === null ? <Carregando /> : campanhas.length === 0 ? (
          <p className="text-stone-500 bg-stone-50 p-6 rounded-2xl text-center border border-stone-200">Nenhuma campanha ativa {cidade ? `em ${cidade}` : 'no momento'}.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {campanhas.map((c) => <CardCampanha key={c.id} campanha={c} />)}
          </div>
        )}
      </section>

      {selecionada && <ModalOng ong={selecionada} onFechar={() => setSelecionada(null)} />}
    </div>
  )
}