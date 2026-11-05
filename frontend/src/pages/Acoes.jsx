import { Construction } from 'lucide-react'

// Tela 04 - será feita nas próximas etapas (abas por perfil: Usuário, ONG e Admin)
const planejado = [
  { perfil: 'Usuário comum', itens: ['Criar publicação', 'Minhas publicações', 'Denúncia anônima'] },
  { perfil: 'ONG / Protetor', itens: ['Gerenciar animais', 'Campanhas', 'Dados da instituição'] },
  { perfil: 'Administrador', itens: ['Métricas', 'Denúncias', 'Aprovar ONGs', 'Moderação'] },
]

export default function Acoes() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Central de Ações</h1>
        <p className="text-stone-500 mt-1">Área de gerenciamento, organizada de acordo com o perfil do usuário.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-3">
        <Construction className="w-6 h-6 text-amber-600 shrink-0" />
        <p className="text-sm text-stone-700">Em desenvolvimento. Abaixo estão as funcionalidades previstas para cada perfil.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {planejado.map((bloco) => (
          <div key={bloco.perfil} className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="font-semibold mb-3">{bloco.perfil}</h2>
            <ul className="text-sm text-stone-600 flex flex-col gap-2">
              {bloco.itens.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
