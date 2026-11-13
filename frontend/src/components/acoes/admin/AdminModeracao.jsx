import { CheckCircle, Search, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { alternarStatusUsuarioAdmin, listarUsuariosAdmin } from '../../../services/adminService'
import { botaoPerigo, botaoSecundario, Carregando, inputClasse, Selo } from '../../ui/Ui'

export function AdminModeracao() {
  const toast = useToast()
  const { usuario: eu } = useAuth()
  const [busca, setBusca] = useState('')
  const [usuarios, setUsuarios] = useState(null)

  const PERFIL = {
    USUARIO_COMUM: 'Usuário Comum',
    ADMIN: 'Administrador'
  }

  const carregar = useCallback(async () => {
    try {
      const lista = await listarUsuariosAdmin()
      setUsuarios(lista)
    } catch (err) {
      toast.erro?.(err.message) || console.error(err)
      setUsuarios([])
    }
  }, [toast])

  useEffect(() => { carregar() }, [carregar])

  async function alternarUsuario(u) {
    try {
      const novoAtivo = !u.ativo
      await alternarStatusUsuarioAdmin(u.id, novoAtivo)
      toast.sucesso?.(u.ativo ? `${u.nomeCompleto} foi suspenso da plataforma.` : `${u.nomeCompleto} teve a conta restaurada.`)
      carregar()
    } catch (err) {
      toast.erro?.(err.message) || console.error(err)
    }
  }

  if (usuarios === null) return <Carregando />
  
  const termo = busca.trim().toLowerCase()
  const usersFiltrados = usuarios.filter((u) => `${u.nomeCompleto} ${u.email}`.toLowerCase().includes(termo))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row mb-2">
        <label className="relative flex-1">
          <span className="sr-only">Pesquisar contas</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar por nome ou e-mail..." className={`${inputClasse} pl-9`} />
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 font-medium">Nome Completo</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Perfil</th>
              <th className="px-4 py-3 font-medium">Situação</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {usersFiltrados.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-stone-500">Nenhum resultado para a busca.</td></tr>
            ) : (
              usersFiltrados.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-stone-800">{u.nomeCompleto}</td>
                  <td className="px-4 py-3 text-stone-600">{u.email}</td>
                  <td className="px-4 py-3 text-stone-600">{PERFIL[u.tipoPerfil] || u.tipoPerfil}</td>
                  <td className="px-4 py-3">
                    <Selo classe={`border ${u.ativo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {u.ativo ? 'Ativo' : 'Suspenso'}
                    </Selo>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== eu?.id && (
                      <button onClick={() => alternarUsuario(u)} className={`${u.ativo ? botaoPerigo : botaoSecundario} !px-3 !py-1.5 flex items-center justify-center gap-1.5 ml-auto`}>
                        {u.ativo ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        {u.ativo ? 'Suspender' : 'Reativar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}