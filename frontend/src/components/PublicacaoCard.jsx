import { Link } from 'react-router-dom'
import { MapPin, CalendarDays } from 'lucide-react'
import { TIPO_PUBLICACAO, ESPECIE, PORTE } from '../data/enums'
import { formatarData } from '../utils/format'
import FotoAnimal from './FotoAnimal'

// card de um animal no feed. Recebe a publicação por "props"
export default function PublicacaoCard({ publicacao }) {
  const { animal, endereco, tipoPublicacao } = publicacao
  const tipo = TIPO_PUBLICACAO[tipoPublicacao] // ex.: { label: 'Perdido', classe: '...' }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative">
        <FotoAnimal animal={animal} className="h-48 w-full" />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase ${tipo.classe}`}>
          {tipo.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold leading-tight">{publicacao.titulo}</h3>
        <p className="text-sm text-stone-500">
          {animal.nome} · {ESPECIE[animal.especieAnimal]} · {PORTE[animal.porteAnimal]}
        </p>

        <div className="mt-auto flex flex-col gap-1 pt-2 text-sm text-stone-600">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-green-700" />
            {endereco.bairro}, {endereco.cidade}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4 text-green-700" />
            {formatarData(publicacao.data)}
          </span>
        </div>

        <Link
          to={`/publicacoes/${publicacao.id}`}
          className="mt-3 rounded-xl bg-green-600 py-2 text-center font-semibold text-white transition hover:bg-green-700"
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  )
}
