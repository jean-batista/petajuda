/**
 * @file MinhasPublicacoes.jsx
 * @description Gestão de publicações do autor logado.
 * Utiliza publicacaoService.
 */

import { CheckCircle2, Eye, FileText, Pencil, PlusCircle, RotateCcw, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../../context/ToastContext'
import { ROTULO_RESOLVIDO, STATUS_PUBLICACAO, TIPO_PUBLICACAO } from '../../../data/enums'
import { alterarStatusPublicacao, excluirPublicacao, listarPublicacoesDoAutor } from '../../../services/publicacaoService'
import { formatarData } from '../../../utils/format'
import PublicacaoForm from '../publicacao/PublicacaoForm'
import { Carregando, Selo, Vazio, botaoPrimario } from '../../ui/Ui'
import ConfirmarModal from '../../ui/ConfirmarModal'
import FotoAnimal from '../../ui/FotoAnimal'
import Modal from '../../ui/Modal'

const botaoAcao = 'inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-stone-100 transition-colors'

export default function MinhasPublicacoes({ usuario, onNova }) {
  const toast = useToast()
  const [lista, setLista] = useState(null)
  const [editando, setEditando] = useState(null)
  const [excluindo, setExcluindo] = useState(null)

  const carregar = useCallback(async () => {
    try {
      const dados = await listarPublicacoesDoAutor(usuario.id)
      setLista(dados || [])
    } catch (err) {
      toast.erro?.(err.message || 'Falha ao carregar suas publicações.')
      setLista([])
    }
  }, [usuario.id, toast])

  useEffect(() => { carregar() }, [carregar])

  async function alternarStatus(p) {
    try {
      const novo = p.status === 'ATIVO' ? 'RESOLVIDO' : 'ATIVO'
      await alterarStatusPublicacao(p.id, novo)
      toast.sucesso(novo === 'RESOLVIDO' ? 'Publicação encerrada com sucesso!' : 'Publicação reativada no feed.')
      carregar()
    } catch (err) {
      toast.erro?.(err.message || 'Falha ao alterar status da publicação.')
    }
  }

  async function confirmarExclusao() {
    try {
      await excluirPublicacao(excluindo.id)
      setExcluindo(null)
      toast.sucesso('Publicação excluída com sucesso.')
      carregar()
    } catch (err) {
      toast.erro?.(err.message || 'Falha ao excluir publicação.')
    }
  }

  if (lista === null) return <Carregando />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-stone-500">
          {lista.length} {lista.length === 1 ? 'publicação cadastrada' : 'publicações cadastradas'}
        </p>
        <button onClick={onNova} className={botaoPrimario}>
          <PlusCircle className="h-4 w-4" /> Criar nova publicação
        </button>
      </div>

      {lista.length === 0 ? (
        <Vazio icone={FileText} titulo="Você ainda não publicou nada" texto="Cadastre um animal perdido, encontrado ou para adoção." />
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((p) => {
            const tipoInfo = TIPO_PUBLICACAO[p.tipo || p.tipoPublicacao] || { label: p.tipo || p.tipoPublicacao, classe: 'bg-stone-100 text-stone-800 border-stone-200' }
            const statusInfo = STATUS_PUBLICACAO[p.status] || { label: p.status, classe: 'bg-stone-100 text-stone-800 border-stone-200' }
            const rotuloResolvido = ROTULO_RESOLVIDO[p.tipo || p.tipoPublicacao] || 'Resolvido'

            return (
              <li key={p.id} className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center shadow-sm hover:shadow-md transition-shadow">
                <div className="h-20 w-full sm:w-28 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  <FotoAnimal animal={p.animal || { fotoUrl: p.fotoUrl, nome: p.titulo }} className="h-full w-full object-cover" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2 mb-1.5">
                    <Selo classe={`border ${tipoInfo.classe}`}>{tipoInfo.label}</Selo>
                    <Selo classe={`border ${statusInfo.classe}`}>{statusInfo.label}</Selo>
                  </div>
                  <h4 className="truncate font-semibold text-stone-900 text-base">{p.titulo}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {p.endereco?.cidade || 'Local não informado'} · {formatarData(p.data || p.dataCriacao)}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <Link to={`/publicacoes/${p.id}`} className={botaoAcao}>
                    <Eye className="h-4 w-4" /> Ver
                  </Link>
                  <button onClick={() => alternarStatus(p)} className={botaoAcao}>
                    {p.status === 'ATIVO' ? (
                      <><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Marcar como {rotuloResolvido}</>
                    ) : (
                      <><RotateCcw className="h-4 w-4 text-stone-600" /> Reativar</>
                    )}
                  </button>
                  <button onClick={() => setEditando(p)} className={botaoAcao}>
                    <Pencil className="h-4 w-4" /> Editar
                  </button>
                  <button onClick={() => setExcluindo(p)} className={`${botaoAcao} text-rose-600 hover:bg-rose-50 border-rose-200`}>
                    <Trash2 className="h-4 w-4" /> Excluir
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {editando && (
        <Modal titulo="Editar publicação" tamanho="md" onFechar={() => setEditando(null)}>
          <PublicacaoForm 
            usuario={usuario} 
            publicacao={editando} 
            onCancelar={() => setEditando(null)}
            onSalvo={() => { setEditando(null); carregar() }} 
          />
        </Modal>
      )}

      {excluindo && (
        <ConfirmarModal 
          titulo="Excluir publicação?" 
          texto={`"${excluindo.titulo}" será removida permanentemente do feed e as mídias da nuvem serão limpas. Esta ação não pode ser desfeita.`}
          onConfirmar={confirmarExclusao} 
          onFechar={() => setExcluindo(null)} 
        />
      )}
    </div>
  )
}