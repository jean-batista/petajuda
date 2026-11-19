import { CheckCircle, FileText, ShieldAlert, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { obterMetricas } from '../../../services/adminService'
import { Carregando } from '../../ui/Ui'

export function AdminMetricas() {
  const toast = useToast()
  const [metricas, setMetricas] = useState(null)

  const carregar = useCallback(async () => {
    try {
      const data = await obterMetricas()
      setMetricas(data)
    } catch (err) {
      toast.erro?.('Falha ao carregar métricas do sistema.')
      setMetricas({ totalUsuarios: 0, usuariosAtivos: 0, totalDenuncias: 0, denunciasPendentes: 0 })
    }
  }, [toast])

  useEffect(() => { carregar() }, [carregar])

  if (!metricas) return <Carregando />

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm flex items-center gap-4">
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600"><Users className="h-6 w-6" /></div>
        <div>
          <p className="text-xs text-stone-500 font-medium">Usuários Totais</p>
          <p className="text-2xl font-bold text-stone-800">{metricas.totalUsuarios}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm flex items-center gap-4">
        <div className="rounded-xl bg-blue-50 p-3 text-blue-600"><CheckCircle className="h-6 w-6" /></div>
        <div>
          <p className="text-xs text-stone-500 font-medium">Usuários Ativos</p>
          <p className="text-2xl font-bold text-stone-800">{metricas.usuariosAtivos}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm flex items-center gap-4">
        <div className="rounded-xl bg-amber-50 p-3 text-amber-600"><ShieldAlert className="h-6 w-6" /></div>
        <div>
          <p className="text-xs text-stone-500 font-medium">Denúncias Registradas</p>
          <p className="text-2xl font-bold text-stone-800">{metricas.totalDenuncias}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm flex items-center gap-4">
        <div className="rounded-xl bg-rose-50 p-3 text-rose-600"><FileText className="h-6 w-6" /></div>
        <div>
          <p className="text-xs text-stone-500 font-medium">Pendentes Triagem</p>
          <p className="text-2xl font-bold text-stone-800">{metricas.denunciasPendentes}</p>
        </div>
      </div>
    </div>
  )
}