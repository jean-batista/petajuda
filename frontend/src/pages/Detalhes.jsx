import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, MessageCircle, Check, X, User, CalendarDays } from 'lucide-react'
import { buscarPublicacao } from '../services/publicacaoService'
import { TIPO_PUBLICACAO, ESPECIE, PORTE, IDADE, SEXO } from '../data/enums'
import { formatarData, linkWhatsApp } from '../utils/format'
import FotoAnimal from '../components/FotoAnimal'
import { Carregando, Selo } from '../components/ui'

const Sim = () => <Check className="h-5 w-5 text-green-600" aria-label="Sim" />
const Nao = () => <X className="h-5 w-5 text-red-500" aria-label="Não" />

export default function Detalhes() {
  const { id } = useParams() // pega o :id da URL, ex.: /publicacoes/p1 → 'p1'
  const [publicacao, setPublicacao] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    buscarPublicacao(id).then((p) => {
      if (!ativo) return
      setPublicacao(p)
      setCarregando(false)
    })
    return () => { ativo = false }
  }, [id])

  if (carregando) return <Carregando />
  if (!publicacao) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-lg font-semibold">Publicação não encontrada.</p>
        <Link to="/" className="font-medium text-green-700 hover:underline">← Voltar ao feed</Link>
      </div>
    )
  }

  const { animal, endereco, autor } = publicacao
  const tipo = TIPO_PUBLICACAO[publicacao.tipoPublicacao]
  const resolvido = publicacao.status === 'RESOLVIDO'

  // lista de características: cada item vira uma linha na ficha
  const ficha = [
    ['Espécie', ESPECIE[animal.especieAnimal]],
    ['Sexo', SEXO[animal.sexo]],
    ['Porte', PORTE[animal.porteAnimal]],
    ['Idade', IDADE[animal.idadeAnimal]],
    ['Cor', animal.corPredominante],
  ]

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="flex w-fit items-center gap-1 font-medium text-green-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Voltar ao feed
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <FotoAnimal animal={animal} className="h-72 w-full rounded-3xl sm:h-96" />

        <div className="flex flex-col gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${tipo.classe}`}>{tipo.label}</span>
              {resolvido && <Selo classe="bg-stone-200 text-stone-600">Caso encerrado</Selo>}
            </div>
            <h1 className="mt-3 text-3xl font-bold">{publicacao.titulo}</h1>
            <p className="mt-1 flex items-center gap-1 text-stone-500">
              <CalendarDays className="h-4 w-4" /> Publicado em {formatarData(publicacao.data)}
            </p>
          </div>

          <p className="text-stone-700">{publicacao.descricao}</p>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="mb-3 font-semibold">Ficha de {animal.nome}</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              {ficha.map(([rotulo, valor]) => (
                <div key={rotulo} className="contents">
                  <dt className="text-stone-500">{rotulo}</dt>
                  <dd className="font-medium">{valor}</dd>
                </div>
              ))}
              <dt className="text-stone-500">Castrado</dt>
              <dd>{animal.castrado ? <Sim /> : <Nao />}</dd>
              <dt className="text-stone-500">Vacinado</dt>
              <dd>{animal.vacinado ? <Sim /> : <Nao />}</dd>
            </dl>
            {animal.descricao && <p className="mt-3 text-sm text-stone-600">{animal.descricao}</p>}
          </div>

          <div className="flex items-start gap-2 text-stone-700">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
            <span>
              {[endereco.rua, endereco.bairro].filter(Boolean).join(', ')} · {endereco.cidade}/{endereco.estado}
              {endereco.complemento && <span className="block text-sm text-stone-500">{endereco.complemento}</span>}
            </span>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <User className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-stone-500">{autor.ongId ? 'Instituição responsável' : 'Responsável'}</p>
                <p className="font-semibold">{autor.nome}</p>
              </div>
            </div>

            {/* o telefone só aparece se o autor autorizou (LGPD - RNF06) */}
            {autor.exibirTelefone && !resolvido ? (
              <a
                href={linkWhatsApp(autor.telefone, `Olá! Vi a publicação "${publicacao.titulo}" no Pet Ajuda.`)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                <MessageCircle className="h-5 w-5" /> Chamar no WhatsApp
              </a>
            ) : (
              <p className="text-sm text-stone-500">
                {resolvido ? 'Esta publicação já foi encerrada.' : 'O responsável não divulgou contato.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
