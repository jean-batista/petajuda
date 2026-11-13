import { useCallback, useEffect, useState } from 'react'
import { PlusCircle, Pencil, Megaphone, Power } from 'lucide-react'
import { listarCampanhasDaOng, criarCampanha, atualizarCampanha } from '../../services/ongService'
import { formatarData } from '../../utils/format'
import Modal from '../Modal'
import { Campo, Carregando, Selo, Vazio, inputClasse, botaoPrimario, botaoSecundario } from '../ui'
import { useToast } from '../Toast'

const hoje = () => new Date().toISOString().slice(0, 10)

// Tela 13: criar e editar campanhas (feiras, vaquinhas, mutirões)
function FormCampanha({ campanha, onSalvar, onCancelar }) {
  const [f, setF] = useState({
    titulo: campanha?.titulo ?? '', descricao: campanha?.descricao ?? '',
    dataInicio: campanha?.dataInicio ?? hoje(), dataFim: campanha?.dataFim ?? hoje(), ativo: campanha?.ativo ?? true,
  })
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)

  async function enviar(ev) {
    ev.preventDefault()
    const e = {}
    if (f.titulo.trim().length < 5) e.titulo = 'Informe o título da ação.'
    if (f.descricao.trim().length < 10) e.descricao = 'Descreva a necessidade (mínimo 10 caracteres).'
    if (!f.dataInicio) e.dataInicio = 'Informe a data de início.'
    if (!f.dataFim || f.dataFim < f.dataInicio) e.dataFim = 'A data de término não pode ser antes do início.'
    setErros(e)
    if (Object.keys(e).length) return
    setEnviando(true)
    await onSalvar({ ...f, titulo: f.titulo.trim(), descricao: f.descricao.trim() })
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <Campo rotulo="Título da ação" erro={erros.titulo}>{(id) => <input id={id} value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} placeholder="Ex.: Feira de adoção no sábado" className={inputClasse} />}</Campo>
      <Campo rotulo="Descrição da necessidade" erro={erros.descricao}>{(id) => <textarea id={id} rows={3} value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} className={inputClasse} />}</Campo>
      <div className="grid grid-cols-2 gap-4">
        <Campo rotulo="Início" erro={erros.dataInicio}>{(id) => <input id={id} type="date" value={f.dataInicio} onChange={(e) => setF({ ...f, dataInicio: e.target.value })} className={inputClasse} />}</Campo>
        <Campo rotulo="Término" erro={erros.dataFim}>{(id) => <input id={id} type="date" value={f.dataFim} onChange={(e) => setF({ ...f, dataFim: e.target.value })} className={inputClasse} />}</Campo>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.ativo} onChange={(e) => setF({ ...f, ativo: e.target.checked })} className="h-4 w-4 accent-green-600" /> Campanha ativa (aparece na página de ONGs)</label>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancelar} className={botaoSecundario}>Cancelar</button>
        <button type="submit" disabled={enviando} className={botaoPrimario}>{enviando ? 'Salvando...' : 'Salvar campanha'}</button>
      </div>
    </form>
  )
}

export default function CampanhasOng({ ongId }) {
  const toast = useToast()
  const [lista, setLista] = useState(null)
  const [editando, setEditando] = useState(null) // objeto da campanha, ou 'nova'

  const carregar = useCallback(() => listarCampanhasDaOng(ongId).then(setLista), [ongId])
  useEffect(() => { carregar() }, [carregar])

  async function salvar(dados) {
    if (editando === 'nova') await criarCampanha(ongId, dados)
    else await atualizarCampanha(editando.id, dados)
    toast.sucesso(editando === 'nova' ? 'Campanha publicada!' : 'Campanha atualizada!')
    setEditando(null)
    carregar()
  }

  async function alternar(c) {
    await atualizarCampanha(c.id, { ativo: !c.ativo })
    toast.sucesso(c.ativo ? 'Campanha desativada.' : 'Campanha ativada.')
    carregar()
  }

  if (lista === null) return <Carregando />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button onClick={() => setEditando('nova')} className={botaoPrimario}><PlusCircle className="h-4 w-4" /> Nova campanha</button>
      </div>
      {lista.length === 0 ? (
        <Vazio icone={Megaphone} titulo="Nenhuma campanha ainda" texto="Divulgue feiras de adoção, vaquinhas e mutirões de castração." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lista.map((c) => (
            <li key={c.id} className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{c.titulo}</p>
                <Selo classe={c.ativo ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-600'}>{c.ativo ? 'Ativa' : 'Inativa'}</Selo>
              </div>
              <p className="text-sm text-stone-600">{c.descricao}</p>
              <p className="text-xs text-stone-500">{formatarData(c.dataInicio)} até {formatarData(c.dataFim)}</p>
              <div className="mt-1 flex gap-2">
                <button onClick={() => setEditando(c)} className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-stone-100"><Pencil className="h-4 w-4" /> Editar</button>
                <button onClick={() => alternar(c)} className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-stone-100"><Power className="h-4 w-4" /> {c.ativo ? 'Desativar' : 'Ativar'}</button>
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
