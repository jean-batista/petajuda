import { useState } from 'react'
import { Dog, Cat, Bird, Shield, Rabbit, Turtle, HelpCircle } from 'lucide-react'

// Mapeamento completo de ícones sincronizado com o enum EspecieAnimal do Backend
const icones = { 
  CACHORRO: Dog, 
  GATO: Cat, 
  PASSARO: Bird,
  EQUINO: Shield, // Substituído de Horse para Shield (evita erro de exportação do lucide-react)
  ROEDOR: Rabbit,
  REPTEIS: Turtle,
  OUTRO: HelpCircle
}

/**
 * Componente unificado para exibição de fotos de animais e publicações.
 * Se a foto falhar ao carregar ou estiver ausente, exibe um placeholder estilizado 
 * com ícone dinâmico baseado na espécie do animal.
 */
export default function FotoAnimal({ animal, className = 'h-48 w-full' }) {
  const [urlComErro, setUrlComErro] = useState(null)
  
  // Extrai a URL considerando propriedades diretas ou aninhadas
  const fotoUrl = animal?.fotoUrl || animal?.animalFotoUrl || ''
  const nome = animal?.nome || animal?.titulo || 'Animal'
  const especie = animal?.especie || animal?.especieAnimal || 'CACHORRO'

  const falhou = urlComErro === fotoUrl

  if (fotoUrl && !falhou) {
    return (
      <img
        src={fotoUrl}
        alt={`Foto de ${nome}`}
        loading="lazy"
        onError={() => setUrlComErro(fotoUrl)}
        className={`${className} bg-stone-100 object-cover`}
      />
    )
  }

  const Icone = icones[especie] ?? Dog

  return (
    <div
      role="img"
      aria-label={`Sem foto de ${nome}`}
      className={`${className} flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-emerald-50 to-amber-50 text-emerald-700/70 p-4`}
    >
      <Icone className="h-10 w-10 shrink-0 stroke-[1.5]" />
      <span className="text-xs font-medium text-stone-400">Sem foto</span>
    </div>
  )
}