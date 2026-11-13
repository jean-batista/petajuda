import { useState } from 'react'
import { botaoPrimario, botaoSecundario, Campo, inputClasse } from '../ui'

function FormCampanha({ campanha, onSalvar, onCancelar }) {
    const hoje = () => new Date().toISOString().slice(0, 10)

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
        <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={f.ativo} onChange={(e) => setF({ ...f, ativo: e.target.checked })} className="h-4 w-4 accent-emerald-600 rounded border-stone-300" />
            Campanha ativa (aparece na página pública da ONG)
        </label>
        <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={onCancelar} className={botaoSecundario}>Cancelar</button>
            <button type="submit" disabled={enviando} className={botaoPrimario}>{enviando ? 'Salvando...' : 'Salvar campanha'}</button>
        </div>
        </form>
    )
}