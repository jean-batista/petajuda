import { Link } from 'react-router-dom'
import { MapPin, CalendarDays } from 'lucide-react'
import { TIPO_PUBLICACAO, ESPECIE, PORTE } from '../data/enums'

// card de um animal no feed. Recebe a publicação por "props"
export default function PublicacaoCard({ publicacao }) {
  const { animal, endereco, tipoPublicacao } = publicacao
  const tipo = TIPO_PUBLICACAO[tipoPublicacao] // ex.: { label: 'Perdido', classe: '...' }

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col hover:shadow-md transition">
      <div className="relative">
        <img
          src={animal.fotoUrl}
          alt={animal.nome}
          className="w-full h-48 object-cover bg-stone-100"
        />
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase ${tipo.classe}`}>
          {tipo.label}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-lg leading-tight">{publicacao.titulo}</h3>
        <p className="text-sm text-stone-500">
          {animal.nome} · {ESPECIE[animal.especieAnimal]} · {PORTE[animal.porteAnimal]}
        </p>

        <div className="text-sm text-stone-600 flex flex-col gap-1 mt-auto pt-2">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-green-700" />
            {endereco.bairro}, {endereco.cidade}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4 text-green-700" />
            {new Date(publicacao.data).toLocaleDateString('pt-BR')}
          </span>
        </div>

        <Link
          to={`/publicacoes/${publicacao.id}`}
          className="mt-3 text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition"
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  )
}
