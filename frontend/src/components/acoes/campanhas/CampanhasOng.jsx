import { Megaphone, Pencil, PlusCircle, Power } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { atualizarCampanha, criarCampanha, listarCampanhasDaOng } from '../../../services/ongService'
import { formatarData } from '../../../utils/format'
import Modal from '../../ui/Modal'
import { botaoPrimario, botaoSecundario, Carregando, Selo, Vazio } from '../../ui/Ui'

export function CampanhasOng({ ongId }) {
  const toast = useToast()
  const [lista, setLista] = useState(null)
  const [editando, setEditando] = useState(null)

  const carregar = useCallback(() => listarCampanhasDaOng(ongId).then(setLista), [ongId])
  useEffect(() => { carregar() }, [carregar])

  async function salvar(dados) {
    try {
      if (editando === 'nova') await criarCampanha(ongId, dados)
      else await atualizarCampanha(editando.id, dados)
      toast.sucesso?.(editando === 'nova' ? 'Campanha publicada!' : 'Campanha atualizada!')
      setEditando(null)
      carregar()
    } catch (err) {
      toast.erro?.(err.message) || console.error(err)
    }
  }

  async function alternar(c) {
    try {
      await atualizarCampanha(c.id, { ativo: !c.ativo })
      toast.sucesso?.(c.ativo ? 'Campanha desativada.' : 'Campanha ativada.')
      carregar()
    } catch (err) {
      toast.erro?.(err.message || 'Falha ao alterar status da campanha.')
    }
  }

  if (lista === null) return <Carregando />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end mb-2">
        <button onClick={() => setEditando('nova')} className={`${botaoPrimario} flex items-center gap-2`}>
          <PlusCircle className="h-4 w-4" /> Nova campanha
        </button>
      </div>
      {lista.length === 0 ? (
        <Vazio icone={Megaphone} titulo="Nenhuma campanha ainda" texto="Divulgue feiras de adoção, vaquinhas e mutirões de castração." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((c) => (
            <li key={c.id} className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-stone-800 leading-tight">{c.titulo}</h4>
                <Selo classe={`border ${c.ativo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone-50 text-stone-600 border-stone-200'}`}>
                  {c.ativo ? 'Ativa' : 'Inativa'}
                </Selo>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed flex-1">{c.descricao}</p>
              <p className="text-[11px] font-medium text-stone-500 bg-stone-50 px-2.5 py-1.5 rounded-lg w-fit border border-stone-100">
                {formatarData(c.dataInicio)} até {formatarData(c.dataFim)}
              </p>
              <div className="mt-2 flex gap-2 pt-4 border-t border-stone-100">
                <button onClick={() => setEditando(c)} className={`${botaoSecundario} !px-3 !py-1.5 flex items-center justify-center gap-1.5 flex-1`}>
                  <Pencil className="h-4 w-4" /> Editar
                </button>
                <button onClick={() => alternar(c)} className={`${botaoSecundario} !px-3 !py-1.5 flex items-center justify-center gap-1.5 flex-1`}>
                  <Power className="h-4 w-4 text-stone-500" /> {c.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {editando && (
        <Modal titulo={editando === 'nova' ? 'Nova campanha' : 'Editar campanha'} onFechar={() => setEditando(null)}>
          <FormCampanha campanha={editando === 'nova' ? null : editando} onSalvar={salvar} onCancelar={() => setEditando(null)} />
        </Modal>
      )}
    </div>
  )
}