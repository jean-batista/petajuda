import { MapPin, ShieldAlert } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { atualizarStatusDenuncia, listarDenunciasAdmin } from '../../../services/adminService'
import { formatarData } from '../../../utils/format'
import Modal from '../../ui/Modal'
import { botaoPrimario, botaoSecundario, Carregando, inputClasse, Selo, Vazio } from '../../ui/Ui'

export function AdminDenuncias() {
  const toast = useToast()
  const [lista, setLista] = useState(null)
  const [aberta, setAberta] = useState(null)
  const [novoStatus, setNovoStatus] = useState('')

  const STATUS_DENUNCIA = {
    PENDENTE: { label: 'Pendente', classe: 'bg-amber-100 text-amber-800 border-amber-200' },
    EM_ANALISE: { label: 'Em Análise', classe: 'bg-blue-100 text-blue-800 border-blue-200' },
    CONCLUIDA: { label: 'Concluída', classe: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    RESOLVIDO: { label: 'Resolvido', classe: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    DESCARTADA: { label: 'Descartada', classe: 'bg-stone-100 text-stone-800 border-stone-200' }
  }

  const carregar = useCallback(async () => {
    try {
      const dados = await listarDenunciasAdmin()
      setLista(dados)
    } catch (err) {
      toast.erro?.(err.message) || console.error(err)
      setLista([])
    }
  }, [toast])

  useEffect(() => { carregar() }, [carregar])

  async function salvar() {
    try {
      await atualizarStatusDenuncia(aberta.id, novoStatus)
      toast.sucesso?.('Status da denúncia atualizado com sucesso.')
      setAberta(null)
      carregar()
    } catch (err) {
      toast.erro?.(err.message) || console.error(err)
    }
  }

  if (lista === null) return <Carregando />
  if (lista.length === 0) return <Vazio icone={ShieldAlert} titulo="Nenhuma denúncia registrada no sistema" />

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Local</th>
              <th className="px-4 py-3 font-medium">Relato / Título</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {lista.map((d) => {
              const infoStatus = STATUS_DENUNCIA[d.status] || STATUS_DENUNCIA.PENDENTE
              return (
                <tr key={d.id} className="hover:bg-stone-50 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3">{formatarData(d.data || d.dataRegistro)}</td>
                  <td className="px-4 py-3 truncate max-w-[150px]">{d.endereco?.bairro}, {d.endereco?.cidade}</td>
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-stone-700">{d.titulo}</td>
                  <td className="px-4 py-3"><Selo classe={`border ${infoStatus.classe}`}>{infoStatus.label}</Selo></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setAberta(d); setNovoStatus(d.status) }} className={`${botaoSecundario} !px-3 !py-1.5`}>Analisar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {aberta && (
        <Modal titulo="Analisar Denúncia" tamanho="md" onFechar={() => setAberta(null)}>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-mono text-stone-400 mb-1">Protocolo: {aberta.id}</p>
              <h3 className="font-bold text-lg text-stone-800 leading-tight">{aberta.titulo}</h3>
            </div>
            
            <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">{aberta.descricao}</p>
            
            <div className="rounded-xl bg-emerald-50/50 p-3 border border-emerald-100/50">
              <p className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span className="text-stone-700">{aberta.endereco?.rua}, {aberta.endereco?.bairro} · {aberta.endereco?.cidade}/{aberta.endereco?.estado}
                  {aberta.endereco?.complemento && <span className="block text-stone-500 mt-0.5 text-xs">{aberta.endereco.complemento}</span>}</span>
              </p>
            </div>

            {aberta.fotoUrl ? (
              <img src={aberta.fotoUrl} alt="Evidência fotográfica" className="max-h-72 w-full rounded-xl object-contain bg-stone-100 border border-stone-200" />
            ) : (
              <div className="flex h-24 items-center justify-center rounded-xl bg-stone-50 border border-dashed border-stone-300">
                <p className="text-sm text-stone-400">Nenhuma evidência fotográfica anexada.</p>
              </div>
            )}
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end mt-2 pt-4 border-t border-stone-100">
              <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-stone-700">
                Alterar status de triagem
                <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)} className={inputClasse}>
                  {Object.entries(STATUS_DENUNCIA).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                </select>
              </label>
              <button onClick={salvar} className={botaoPrimario}>Salvar Alteração</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}