/**
 * @file DenunciaForm.jsx
 * @description Componente para envio de denúncias anônimas e acompanhamento por protocolo.
 * Utiliza denunciaService.
 */

import { CheckCircle2, Search, ShieldCheck, Upload, X } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { STATUS_DENUNCIA } from '../../../data/enums'
import { consultarDenuncia, criarDenuncia } from '../../../services/denunciaService'
import { copiarTexto, formatarData } from '../../../utils/format'
import { Campo, Selo, botaoPrimario, botaoSecundario, inputClasse } from '../../ui/Ui'

const vazio = { descricao: '', cidade: '', bairro: '', rua: '', complemento: '' }

function Acompanhar() {
  const [protocolo, setProtocolo] = useState('')
  const [resultado, setResultado] = useState(undefined)

  async function consultar(e) {
    e.preventDefault()
    if (protocolo.trim()) setResultado(await consultarDenuncia(protocolo))
  }

  return (
    <form onSubmit={consultar} className="rounded-2xl border border-stone-200 bg-white p-5">
      <h3 className="font-semibold">Acompanhar uma denúncia</h3>
      <div className="mt-3 flex gap-2">
        <input value={protocolo} onChange={(e) => setProtocolo(e.target.value)} placeholder="Número do protocolo" aria-label="Protocolo" className={inputClasse} />
        <button className={botaoSecundario}><Search className="h-4 w-4" /> Consultar</button>
      </div>
      {resultado === null && <p className="mt-3 text-sm text-red-600">Protocolo não encontrado.</p>}
      {resultado && (
        <p className="mt-3 flex items-center gap-2 text-sm">
          Situação: <Selo classe={STATUS_DENUNCIA[resultado.status]?.classe}>{STATUS_DENUNCIA[resultado.status]?.label || resultado.status}</Selo>
          <span className="text-stone-500">· enviada em {formatarData(resultado.data)}</span>
        </p>
      )}
    </form>
  )
}

export default function DenunciaForm() {
  const toast = useToast()
  const [f, setF] = useState(vazio)
  const [fotoArquivo, setFotoArquivo] = useState(null)
  const [fotoPreview, setFotoPreview] = useState('')
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [protocolo, setProtocolo] = useState(null)

  const mudar = (campo) => (e) => setF({ ...f, [campo]: e.target.value })

  function escolherFoto(e) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    setFotoArquivo(arquivo)
    setFotoPreview(URL.createObjectURL(arquivo))
  }

  async function enviar(ev) {
    ev.preventDefault()
    const e = {}
    if (f.descricao.trim().length < 15) e.descricao = 'Descreva a situação com mais detalhes (mínimo 15 caracteres).'
    if (!f.cidade.trim()) e.cidade = 'Informe a cidade.'
    if (!f.bairro.trim()) e.bairro = 'Informe o bairro.'
    if (!f.rua.trim()) e.rua = 'Informe a rua ou um ponto de referência.'
    setErros(e)
    if (Object.keys(e).length) return

    setEnviando(true)
    try {
      const denuncia = await criarDenuncia({
        titulo: 'Denúncia de maus-tratos / abandono',
        descricao: f.descricao.trim(),
        endereco: {
          estado: 'SC',
          cidade: f.cidade.trim(),
          bairro: f.bairro.trim(),
          rua: f.rua.trim(),
          complemento: f.complemento.trim()
        }
      }, fotoArquivo)

      setEnviando(false)
      setProtocolo(denuncia.id)
      setF(vazio)
      setFotoArquivo(null)
      setFotoPreview('')
    } catch (err) {
      toast.erro(err.message || 'Falha ao registrar denúncia.')
      setEnviando(false)
    }
  }

  if (protocolo) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <p className="text-lg font-semibold">Denúncia enviada com sucesso</p>
          <p className="max-w-md text-sm text-stone-600">Ela será analisada pela administração. Guarde o protocolo para acompanhar:</p>
          <button onClick={async () => (await copiarTexto(protocolo)) && toast.sucesso('Protocolo copiado!')}
            className="rounded-xl bg-white px-4 py-2 font-mono font-bold text-green-800 shadow-sm">{protocolo}</button>
          <button onClick={() => setProtocolo(null)} className={`${botaoSecundario} mt-2`}>Fazer outra denúncia</button>
        </div>
        <Acompanhar />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-2xl bg-green-50 p-4 text-sm text-green-900">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        <p>Esta denúncia é <strong>100% anônima</strong> e será analisada apenas pelos administradores. Em emergências, ligue para a Polícia Militar (190).</p>
      </div>

      <form onSubmit={enviar} className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5" noValidate>
        <Campo rotulo="O que está acontecendo?" erro={erros.descricao}>
          {(id) => <textarea id={id} rows={4} value={f.descricao} onChange={mudar('descricao')} placeholder="Descreva a situação de maus-tratos ou abandono..." className={inputClasse} />}
        </Campo>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo rotulo="Cidade" erro={erros.cidade}>{(id) => <input id={id} value={f.cidade} onChange={mudar('cidade')} className={inputClasse} />}</Campo>
          <Campo rotulo="Bairro" erro={erros.bairro}>{(id) => <input id={id} value={f.bairro} onChange={mudar('bairro')} className={inputClasse} />}</Campo>
          <Campo rotulo="Rua" erro={erros.rua}>{(id) => <input id={id} value={f.rua} onChange={mudar('rua')} className={inputClasse} />}</Campo>
          <Campo rotulo="Ponto de referência (opcional)">{(id) => <input id={id} value={f.complemento} onChange={mudar('complemento')} className={inputClasse} />}</Campo>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-stone-700">Foto ou evidência <span className="text-rose-500">*</span></p>
          {fotoPreview ? (
            <div className="relative h-40 overflow-hidden rounded-xl border border-stone-300 bg-stone-100">
              <img src={fotoPreview} alt="Evidência anexada" className="h-full w-full object-contain" />
              <button type="button" onClick={() => { setFotoPreview(''); setFotoArquivo(null) }} aria-label="Remover foto" className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-stone-300 p-5 text-center hover:bg-stone-50">
              <Upload className="mx-auto h-8 w-8 text-stone-400" />
              <span className="mt-1 block text-sm text-stone-600">Clique para anexar uma imagem obrigatória de evidência</span>
              <input type="file" accept="image/*" onChange={escolherFoto} className="hidden" />
            </label>
          )}
        </div>

        <button type="submit" disabled={enviando} className={botaoPrimario}>{enviando ? 'Enviando...' : 'Enviar denúncia anônima'}</button>
      </form>

      <Acompanhar />
    </div>
  )
}