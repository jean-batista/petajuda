import { Megaphone } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { atualizarStatusOngAdmin, listarOngsAdmin } from '../../../services/adminService'
import { botaoPerigo, botaoSecundario, Carregando, Selo, Vazio } from '../../ui/Ui'

export function AdminOngs() {
  const toast = useToast()
  const [lista, setLista] = useState(null)

  const carregar = useCallback(async () => {
    try {
      const dados = await listarOngsAdmin()
      setLista(dados)
    } catch (err) {
      toast.erro?.(err.message) || console.error(err)
      setLista([])
    }
  }, [toast])

  useEffect(() => { carregar() }, [carregar])

  async function alternarStatus(ong, novoStatus) {
    try {
      await atualizarStatusOngAdmin(ong.id, novoStatus)
      toast.sucesso?.('Status da ONG atualizado com sucesso.')
      carregar()
    } catch (err) {
      toast.erro?.(err.message) || console.error(err)
    }
  }

  if (lista === null) return <Carregando />
  if (lista.length === 0) return <Vazio icone={Megaphone} titulo="Nenhuma ONG cadastrada no sistema" />

  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
          <tr>
            <th className="px-4 py-3 font-medium">Nome</th>
            <th className="px-4 py-3 font-medium">CNPJ</th>
            <th className="px-4 py-3 font-medium">Cidade</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {lista.map((o) => (
            <tr key={o.id} className="hover:bg-stone-50 transition-colors">
              <td className="px-4 py-3 font-medium text-stone-800">{o.nome}</td>
              <td className="px-4 py-3 text-stone-600">{o.cnpj}</td>
              <td className="px-4 py-3 text-stone-600">{o.endereco?.cidade}</td>
              <td className="px-4 py-3">
                <Selo classe={`border ${o.status === 'APROVADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {o.status}
                </Selo>
              </td>
              <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                {o.status !== 'APROVADA' && (
                  <button onClick={() => alternarStatus(o, 'APROVADA')} className={`${botaoSecundario} !px-3 !py-1.5 text-emerald-700`}>Aprovar</button>
                )}
                {o.status !== 'REPROVADA' && (
                  <button onClick={() => alternarStatus(o, 'REPROVADA')} className={`${botaoPerigo} !px-3 !py-1.5`}>Reprovar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}