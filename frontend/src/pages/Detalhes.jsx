import { ArrowLeft, CalendarDays, Check, MapPin, MessageCircle, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FotoAnimal from '../components/ui/FotoAnimal'
import { Carregando, Selo } from '../components/ui/Ui'
import {
  ESPECIE,
  ESPECIE_ANIMAL,
  IDADE,
  IDADE_ANIMAL,
  PORTE,
  PORTE_ANIMAL,
  SEXO,
  SEXO_ANIMAL,
  TIPO_PUBLICACAO,
} from '../data/enums'
import { buscarPublicacao } from '../services/publicacaoService'
import { formatarData, linkWhatsApp } from '../utils/format'

const Sim = () => <Check className="h-5 w-5 text-emerald-600" aria-label="Sim" />
const Nao = () => <X className="h-5 w-5 text-rose-500" aria-label="Não" />

export default function Detalhes() {
  const { id } = useParams()
  const [publicacao, setPublicacao] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    buscarPublicacao(id)
      .then((p) => {
        if (!ativo) return
        setPublicacao(p)
        setCarregando(false)
      })
      .catch(() => {
        if (ativo) {
          setPublicacao(null)
          setCarregando(false)
        }
      })
    return () => { ativo = false }
  }, [id])

  if (carregando) return <Carregando />
  if (!publicacao) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-lg font-semibold text-stone-800">Publicação não encontrada.</p>
        <Link to="/" className="font-medium text-emerald-700 hover:underline">← Voltar ao feed</Link>
      </div>
    )
  }

  const animal = publicacao.animal
  const endereco = publicacao.endereco || {}

  const tipo = TIPO_PUBLICACAO[publicacao.tipo] || {
    label: publicacao.tipo || 'Publicação',
    classe: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  }

  const resolvido = publicacao.status === 'RESOLVIDO'

  const rawEspecie = animal?.especie || animal?.especieAnimal
  const rawSexo = animal?.sexo || animal?.sexoAnimal
  const rawPorte = animal?.porte || animal?.porteAnimal
  const rawIdade = animal?.idade || animal?.idadeAnimal

  const ficha = animal
    ? [
        ['Espécie', ESPECIE[rawEspecie] || ESPECIE_ANIMAL?.[rawEspecie] || rawEspecie],
        ['Sexo', SEXO[rawSexo] || SEXO_ANIMAL?.[rawSexo] || rawSexo],
        ['Porte', PORTE[rawPorte] || PORTE_ANIMAL?.[rawPorte] || rawPorte],
        ['Idade', IDADE[rawIdade] || IDADE_ANIMAL?.[rawIdade] || rawIdade],
        ['Cor', animal.corPredominante],
      ]
    : []

  const nomeResponsavel = publicacao.usuarioNome || 'Usuário do sistema'
  const telefoneContato = publicacao.usuarioTelefone || ''

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="flex w-fit items-center gap-1 font-medium text-emerald-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Voltar ao feed
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <FotoAnimal
          animal={{ ...animal, nome: animal?.nome || publicacao.titulo, fotoUrl: publicacao.fotoUrl }}
          className="h-72 w-full rounded-3xl sm:h-96 object-cover bg-stone-100 border border-stone-200"
        />

        <div className="flex flex-col gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase border ${tipo.classe}`}>
                {tipo.label}
              </span>
              {resolvido && (
                <Selo classe="bg-stone-200 text-stone-700 border-stone-300">Caso encerrado</Selo>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-bold text-stone-900">{publicacao.titulo}</h1>
            <p className="mt-1 flex items-center gap-1 text-stone-500 text-sm">
              <CalendarDays className="h-4 w-4" /> Publicado em {formatarData(publicacao.data)}
            </p>
          </div>

          <p className="text-stone-700 leading-relaxed">{publicacao.descricao}</p>

          {animal && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-stone-800">
                Ficha de {animal.nome || 'Animal'}
              </h2>
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                {ficha.map(([rotulo, valor]) => (
                  <div key={rotulo} className="contents">
                    <dt className="text-stone-500">{rotulo}</dt>
                    <dd className="font-medium text-stone-800">{valor || 'Não informado'}</dd>
                  </div>
                ))}
                <dt className="text-stone-500">Castrado</dt>
                <dd>{animal.castrado ? <Sim /> : <Nao />}</dd>
                <dt className="text-stone-500">Vacinado</dt>
                <dd>{animal.vacinado ? <Sim /> : <Nao />}</dd>
              </dl>
              {animal.descricao && (
                <p className="mt-3 text-sm text-stone-600 border-t border-stone-100 pt-3">
                  {animal.descricao}
                </p>
              )}
            </div>
          )}

          <div className="flex items-start gap-2 text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-100">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <span className="text-sm">
              {[endereco?.rua, endereco?.bairro].filter(Boolean).join(', ')} · {endereco?.cidade}/{endereco?.estado}
              {endereco?.complemento && (
                <span className="block text-xs text-stone-500 mt-0.5">{endereco.complemento}</span>
              )}
            </span>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <User className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs text-stone-500">Responsável</p>
                <p className="font-semibold text-stone-800">{nomeResponsavel}</p>
              </div>
            </div>

            {telefoneContato && !resolvido ? (
              <a
                href={linkWhatsApp(telefoneContato, `Olá! Vi a publicação "${publicacao.titulo}" no Pet Ajuda.`)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 shadow-sm"
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