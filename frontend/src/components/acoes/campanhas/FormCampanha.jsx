import { useState } from 'react'
import { botaoPrimario, botaoSecundario, Campo, inputClasse } from '../../ui/Ui'

function paraInputDate(valor, fallback) {
  if (!valor) return fallback
  return String(valor).slice(0, 10)
}

function formatarInicioIso(dataStr) {
  const agora = new Date()
  const hojeStr = agora.toISOString().slice(0, 10)
  if (dataStr === hojeStr) {
    // Adiciona 2 minutos de margem para passar no @FutureOrPresent do LocalDateTime.now()
    const margem = new Date(agora.getTime() + 2 * 60 * 1000)
    const hh = String(margem.getHours()).padStart(2, '0')
    const mm = String(margem.getMinutes()).padStart(2, '0')
    const ss = String(margem.getSeconds()).padStart(2, '0')
    return `${dataStr}T${hh}:${mm}:${ss}`
  }
  return `${dataStr}T00:00:00`
}

function formatarFimIso(dataStr) {
  return `${dataStr}T23:59:59`
}

export function FormCampanha({ campanha, onSalvar, onCancelar }) {
  const hoje = () => new Date().toISOString().slice(0, 10)

  const [f, setF] = useState({
    titulo: campanha?.titulo ?? '',
    descricao: campanha?.descricao ?? '',
    inicio: paraInputDate(campanha?.inicio ?? campanha?.dataInicio, hoje()),
    fim: paraInputDate(campanha?.fim ?? campanha?.dataFim, hoje()),
    ativo: campanha?.ativo ?? true,
  })
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)

  async function enviar(ev) {
    ev.preventDefault()
    const dataHoje = hoje()
    const e = {}

    if (f.titulo.trim().length < 5) e.titulo = 'Informe o título da ação (mínimo 5 caracteres).'
    if (f.descricao.trim().length < 10) e.descricao = 'Descreva a necessidade (mínimo 10 caracteres).'
    if (!f.inicio) {
      e.inicio = 'Informe a data de início.'
    } else if (!campanha && f.inicio < dataHoje) {
      e.inicio = 'A data de início não pode ser no passado.'
    }
    if (!f.fim || f.fim < f.inicio) {
      e.fim = 'A data de término não pode ser antes do início.'
    } else if (f.fim < dataHoje) {
      e.fim = 'A data de término deve ser no futuro.'
    }

    setErros(e)
    if (Object.keys(e).length) return

    setEnviando(true)
    try {
      await onSalvar({
        titulo: f.titulo.trim(),
        descricao: f.descricao.trim(),
        inicio: formatarInicioIso(f.inicio),
        fim: formatarFimIso(f.fim),
        ativo: f.ativo,
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <Campo rotulo="Título da ação" erro={erros.titulo}>
        {(id) => (
          <input
            id={id}
            value={f.titulo}
            onChange={(e) => setF({ ...f, titulo: e.target.value })}
            placeholder="Ex.: Feira de adoção no sábado"
            className={inputClasse}
          />
        )}
      </Campo>

      <Campo rotulo="Descrição da necessidade" erro={erros.descricao}>
        {(id) => (
          <textarea
            id={id}
            rows={3}
            value={f.descricao}
            onChange={(e) => setF({ ...f, descricao: e.target.value })}
            className={inputClasse}
          />
        )}
      </Campo>

      <div className="grid grid-cols-2 gap-4">
        <Campo rotulo="Início" erro={erros.inicio}>
          {(id) => (
            <input
              id={id}
              type="date"
              value={f.inicio}
              onChange={(e) => setF({ ...f, inicio: e.target.value })}
              className={inputClasse}
            />
          )}
        </Campo>
        <Campo rotulo="Término" erro={erros.fim}>
          {(id) => (
            <input
              id={id}
              type="date"
              value={f.fim}
              onChange={(e) => setF({ ...f, fim: e.target.value })}
              className={inputClasse}
            />
          )}
        </Campo>
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          checked={f.ativo}
          onChange={(e) => setF({ ...f, ativo: e.target.checked })}
          className="h-4 w-4 accent-emerald-600 rounded border-stone-300"
        />
        Campanha ativa (aparece na página pública da ONG)
      </label>

      <div className="flex justify-end gap-3 mt-2">
        <button type="button" onClick={onCancelar} className={botaoSecundario}>
          Cancelar
        </button>
        <button type="submit" disabled={enviando} className={botaoPrimario}>
          {enviando ? 'Salvando...' : 'Salvar campanha'}
        </button>
      </div>
    </form>
  )
}