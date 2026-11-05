import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, MessageCircle, Check, X, User } from 'lucide-react'
import { buscarPublicacao } from '../services/publicacaoService'
import { TIPO_PUBLICACAO, ESPECIE, PORTE, IDADE } from '../data/enums'

export default function Detalhes() {
  const { id } = useParams() // pega o :id da URL, ex.: /publicacoes/p1 → 'p1'
  const [publicacao, setPublicacao] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    buscarPublicacao(id).then((p) => {
      setPublicacao(p)
      setCarregando(false)
    })
  }, [id])

  if (carregando) return <p className="text-stone-500">Carregando...</p>
  if (!publicacao) {
    return (
      <div className="flex flex-col gap-4">
        <p>Publicação não encontrada.</p>
        <Link to="/" className="text-green-700 hover:underline">← Voltar ao feed</Link>
      </div>
    )
  }

  const { animal, endereco, autor } = publicacao
  const tipo = TIPO_PUBLICACAO[publicacao.tipoPublicacao]

  // lista de características: cada item vira uma linha na ficha
  const ficha = [
    ['Espécie', ESPECIE[animal.especieAnimal]],
    ['Sexo', animal.sexo === 'MACHO' ? 'Macho' : 'Fêmea'],
    ['Porte', PORTE[animal.porteAnimal]],
    ['Idade', IDADE[animal.idadeAnimal]],
    ['Cor', animal.corPredominante],
  ]

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="flex items-center gap-1 text-green-700 font-medium hover:underline w-fit">
        <ArrowLeft className="w-4 h-4" /> Voltar ao feed
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <img src={animal.fotoUrl} alt={animal.nome} className="w-full h-72 sm:h-96 object-cover rounded-3xl bg-stone-100" />

        <div className="flex flex-col gap-5">
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${tipo.classe}`}>{tipo.label}</span>
            <h1 className="text-3xl font-bold mt-3">{publicacao.titulo}</h1>
            <p className="text-stone-500 mt-1">
              Publicado em {new Date(publicacao.data).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <p className="text-stone-700">{publicacao.descricao}</p>

          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="font-semibold mb-3">Ficha de {animal.nome}</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              {ficha.map(([rotulo, valor]) => (
                <div key={rotulo} className="contents">
                  <dt className="text-stone-500">{rotulo}</dt>
                  <dd className="font-medium">{valor}</dd>
                </div>
              ))}
              <dt className="text-stone-500">Castrado</dt>
              <dd>{animal.castrado ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-500" />}</dd>
              <dt className="text-stone-500">Vacinado</dt>
              <dd>{animal.vacinado ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-500" />}</dd>
            </dl>
            <p className="text-sm text-stone-600 mt-3">{animal.descricao}</p>
          </div>

          <div className="flex items-start gap-2 text-stone-700">
            <MapPin className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
            <span>
              {endereco.rua}, {endereco.bairro} · {endereco.cidade}/{endereco.estado}
              {endereco.complemento && <span className="block text-sm text-stone-500">{endereco.complemento}</span>}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Responsável</p>
                <p className="font-semibold">{autor.nome}</p>
              </div>
            </div>

            {/* o telefone só aparece se o autor autorizou (LGPD - RNF06) */}
            {autor.exibirTelefone ? (
              <a
                href={`https://wa.me/55${autor.telefone}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl transition"
              >
                <MessageCircle className="w-5 h-5" /> Chamar no WhatsApp
              </a>
            ) : (
              <p className="text-sm text-stone-500">Contato não disponibilizado pelo autor.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
