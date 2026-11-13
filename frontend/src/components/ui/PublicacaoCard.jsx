import { Link } from 'react-router-dom'
import { MapPin, CalendarDays } from 'lucide-react'
import { TIPO_PUBLICACAO, ESPECIE_ANIMAL, PORTE_ANIMAL } from '../../data/enums'
import { formatarData } from '../../utils/format'
import FotoAnimal from './FotoAnimal'

// Card de uma publicação/animal no feed. Recebe a publicação por "props".
export default function PublicacaoCard({ publicacao }) {
  if (!publicacao) return null

  // Mapeamento seguro de propriedades considerando variações da API
  const animal = publicacao.animal || {}
  const endereco = publicacao.endereco || {}
  
  // Suporta tanto 'tipo' quanto 'tipoPublicacao' vindos do backend
  const tipoChave = publicacao.tipo || publicacao.tipoPublicacao || 'PERDIDO'
  const tipo = TIPO_PUBLICACAO[tipoChave] || { label: tipoChave, classe: 'bg-stone-100 text-stone-800' }

  // Fallback seguro para espécie e porte utilizando os Enums atualizados
  const especieChave = animal.especie || animal.especieAnimal || 'CACHORRO'
  const porteChave = animal.porte || animal.porteAnimal || 'MEDIO'
  
  const rotuloEspecie = ESPECIE_ANIMAL[especieChave] || especieChave
  const rotuloPorte = PORTE_ANIMAL[porteChave] || porteChave

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative">
        {/* Passa a publicação inteira ou objeto unificado para garantir que a foto da publicação apareça se o animal for null */}
        <FotoAnimal animal={{ ...animal, fotoUrl: animal.fotoUrl || publicacao.fotoUrl, nome: animal.nome || publicacao.titulo }} className="h-48 w-full" />
        <span className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-xs font-bold uppercase shadow-sm ${tipo.classe}`}>
          {tipo.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold text-stone-900 leading-tight">{publicacao.titulo}</h3>
        
        {/* Exibe detalhes do animal se houver vínculo, ou apenas a espécie/descrição resumida */}
        <p className="text-sm text-stone-500">
          {animal.nome ? `${animal.nome} · ` : ''}{rotuloEspecie} · {rotuloPorte}
        </p>

        <div className="mt-auto flex flex-col gap-1 pt-2 text-sm text-stone-600">
          <span className="flex items-center gap-1.5 truncate">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="truncate">{endereco.bairro ? `${endereco.bairro}, ` : ''}{endereco.cidade || 'Local não informado'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 shrink-0 text-emerald-600" />
            {formatarData(publicacao.data || publicacao.dataCriacao)}
          </span>
        </div>

        <Link
          to={`/publicacoes/${publicacao.id}`}
          className="mt-3 rounded-xl bg-emerald-600 py-2 text-center font-semibold text-white transition hover:bg-emerald-700 shadow-sm"
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  )
}