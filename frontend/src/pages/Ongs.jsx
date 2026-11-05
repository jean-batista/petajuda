import { useEffect, useState } from 'react'
import { MapPin, Copy, Check, CalendarDays, HeartHandshake } from 'lucide-react'
import { listarOngs, listarCampanhas } from '../services/ongService'
import { CIDADES_AMUREL } from '../data/enums'

export default function Ongs() {
  const [cidade, setCidade] = useState('')
  const [ongs, setOngs] = useState([])
  const [campanhas, setCampanhas] = useState([])
  const [pixCopiado, setPixCopiado] = useState(null) // id da ONG cujo Pix foi copiado

  useEffect(() => {
    listarOngs({ cidade }).then(setOngs)
  }, [cidade])

  useEffect(() => {
    listarCampanhas().then(setCampanhas)
  }, [])

  function copiarPix(ong) {
    navigator.clipboard.writeText(ong.chavePix)
    setPixCopiado(ong.id)
    setTimeout(() => setPixCopiado(null), 2000) // volta ao normal depois de 2s
  }

  const formatarData = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">ONGs e protetores</h1>
          <p className="text-stone-500 mt-1">Instituições validadas que cuidam dos animais da AMUREL.</p>
        </div>
        <select
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Todas as cidades</option>
          {CIDADES_AMUREL.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {ongs.length === 0 && <p className="text-stone-500">Nenhuma ONG cadastrada nesta cidade.</p>}
        {ongs.map((ong) => (
          <article key={ong.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                <HeartHandshake className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">{ong.nome}</h2>
                <p className="text-sm text-stone-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {ong.endereco.bairro}, {ong.endereco.cidade}
                </p>
              </div>
            </div>

            <p className="text-stone-600 text-sm">{ong.descricao}</p>

            <div className="mt-auto bg-stone-50 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-stone-500">Chave Pix para doações</p>
                <p className="font-mono text-sm truncate">{ong.chavePix}</p>
              </div>
              <button
                onClick={() => copiarPix(ong)}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-2 rounded-lg shrink-0"
              >
                {pixCopiado === ong.id ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar</>}
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Campanhas ativas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {campanhas.map((c) => {
            const ong = ongs.find((o) => o.id === c.ongId)
            return (
              <article key={c.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h3 className="font-semibold">{c.titulo}</h3>
                <p className="text-sm text-stone-600 mt-1">{c.descricao}</p>
                <p className="text-sm text-stone-500 mt-3 flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  {formatarData(c.dataInicio)}
                  {c.dataFim !== c.dataInicio && ` até ${formatarData(c.dataFim)}`}
                  {ong && ` · ${ong.nome}`}
                </p>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
