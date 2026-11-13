import { useState } from 'react'
import { Dog, Cat, Bird } from 'lucide-react'

const icones = { CACHORRO: Dog, GATO: Cat, PASSARO: Bird }

// Mostra a foto do animal. Se não houver foto (ou ela falhar ao carregar),
// mostra uma ilustração fixa. Assim a imagem nunca aparece quebrada nem muda sozinha.
export default function FotoAnimal({ animal, className = 'h-48 w-full' }) {
  // guarda QUAL endereço falhou: se a foto for trocada, tenta carregar a nova
  const [urlComErro, setUrlComErro] = useState(null)
  const falhou = urlComErro === animal.fotoUrl

  if (animal.fotoUrl && !falhou) {
    return (
      <img
        src={animal.fotoUrl}
        alt={`Foto de ${animal.nome}`}
        loading="lazy"
        onError={() => setUrlComErro(animal.fotoUrl)}
        className={`${className} bg-stone-100 object-cover`}
      />
    )
  }

  const Icone = icones[animal.especieAnimal] ?? Dog
  return (
    <div
      role="img"
      aria-label={`Sem foto de ${animal.nome}`}
      className={`${className} flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-green-50 to-amber-50 text-green-700/70`}
    >
      <Icone className="h-1/3 max-h-20 min-h-8 w-auto" strokeWidth={1.5} />
      <span className="text-xs font-medium text-stone-400">Sem foto</span>
    </div>
  )
}
