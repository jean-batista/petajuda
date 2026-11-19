import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { cadastrarOng } from '../../../services/authService'
import { buscarOngPorUsuario } from '../../../services/ongService'
import { formatarCnpj, somenteDigitos } from '../../../utils/format'
import SeletorLocalidade from '../../ui/SeletorLocalidade'
import { botaoPrimario, Campo, inputClasse } from '../../ui/Ui'

export function OngForm() {
  const navigate = useNavigate()
  const { user, usuario } = useAuth()
  const usuarioAtual = usuario || user

  const [o, setO] = useState({
    nome: '',
    razaoSocial: '',
    cnpj: '',
    chavePix: '',
    descricao: '',
    estado: 'SC',
    cidade: '',
    bairro: '',
    rua: '',
    complemento: ''
  })

  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [enviando, setEnviando] = useState(false)

  const [verificando, setVerificando] = useState(true)
  const [possuiOng, setPossuiOng] = useState(false)
  const [dadosOngExistente, setDadosOngExistente] = useState(null)

  useEffect(() => {
    async function verificarInstituicao() {
      const usuarioId = usuarioAtual?.id || usuarioAtual?.usuarioId
      if (!usuarioId) {
        setVerificando(false)
        return
      }

      try {
        setVerificando(true)
        const resposta = await buscarOngPorUsuario(usuarioId)
        if (resposta) {
          setPossuiOng(true)
          setDadosOngExistente(resposta)
        }
      } catch {
        setPossuiOng(false)
      } finally {
        setVerificando(false)
      }
    }

    verificarInstituicao()
  }, [usuarioAtual])

  function validarFormulario() {
    const e = {}
    if (!o.nome.trim()) e.nome = 'Informe o nome da instituição.'
    if (!o.razaoSocial.trim()) e.razaoSocial = 'Informe a razão social.'

    if (somenteDigitos(o.cnpj).length !== 14) {
      e.cnpj = 'O CNPJ deve conter exatamente 14 números.'
    }

    if (!o.chavePix.trim()) e.chavePix = 'Informe a chave Pix para doações.'
    if (o.descricao.trim().length < 20) {
      e.descricao = 'A descrição deve ter no mínimo 20 caracteres.'
    }
    if (!o.estado) e.estado = 'Selecione o estado.'
    if (!o.cidade.trim()) e.cidade = 'Selecione a cidade.'
    if (!o.bairro.trim()) e.bairro = 'Informe o bairro.'
    if (!o.rua.trim()) e.rua = 'Informe a rua.'

    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validarFormulario()
    setErros(e)
    if (Object.keys(e).length) return

    setEnviando(true)
    setErroGeral('')
    setSucesso('')

    try {
      await cadastrarOng({
        nome: o.nome.trim(),
        razaoSocial: o.razaoSocial.trim(),
        cnpj: somenteDigitos(o.cnpj),
        chavePix: o.chavePix.trim(),
        descricao: o.descricao.trim(),
        endereco: {
          estado: o.estado,
          cidade: o.cidade.trim(),
          bairro: o.bairro.trim(),
          rua: o.rua.trim(),
          complemento: o.complemento.trim()
        }
      })

      setSucesso('Instituição cadastrada com sucesso!')
      setPossuiOng(true)

      setTimeout(() => {
        navigate('/acoes')
      }, 1500)
    } catch (err) {
      setErroGeral(err.message || 'Falha ao cadastrar a instituição. Verifique os dados.')
      setEnviando(false)
    }
  }

  if (verificando) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm border border-stone-100 text-center py-12">
        <p className="text-sm text-stone-500 animate-pulse">Carregando informações da instituição...</p>
      </div>
    )
  }

  if (possuiOng) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm border border-stone-100 text-center py-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          ✓
        </div>
        <h2 className="text-xl font-bold text-stone-800 mb-2">Instituição já cadastrada</h2>
        <p className="text-sm text-stone-600 mb-6">
          Você já possui a ONG <span className="font-semibold">{dadosOngExistente?.nome}</span> vinculada à sua conta. Cada usuário gerencia uma instituição por perfil.
        </p>
        <button onClick={() => navigate('/acoes')} className={botaoPrimario}>
          Voltar para a Central de Ações
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
      <div className="mb-6 border-b border-stone-100 pb-4">
        <h2 className="text-xl font-bold text-stone-800">Cadastrar Instituição / Protetor</h2>
        <p className="text-sm text-stone-500">
          Preencha os dados abaixo para registrar sua ONG na plataforma e gerenciar ações e resgates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo rotulo="Nome da instituição" erro={erros.nome}>
            {(id) => <input id={id} value={o.nome} onChange={(e) => setO({ ...o, nome: e.target.value })} className={inputClasse} />}
          </Campo>

          <Campo rotulo="Razão social" erro={erros.razaoSocial}>
            {(id) => <input id={id} value={o.razaoSocial} onChange={(e) => setO({ ...o, razaoSocial: e.target.value })} className={inputClasse} />}
          </Campo>

          <Campo rotulo="CNPJ" erro={erros.cnpj}>
            {(id) => <input id={id} value={o.cnpj} onChange={(e) => setO({ ...o, cnpj: formatarCnpj(e.target.value) })} placeholder="00.000.000/0000-00" className={inputClasse} inputMode="numeric" />}
          </Campo>

          <Campo rotulo="Chave Pix" erro={erros.chavePix}>
            {(id) => <input id={id} value={o.chavePix} onChange={(e) => setO({ ...o, chavePix: e.target.value })} placeholder="E-mail, CPF, CNPJ ou Aleatória" className={inputClasse} />}
          </Campo>
        </div>

        <Campo rotulo="Descrição da instituição" erro={erros.descricao}>
          {(id) => <textarea id={id} rows={3} value={o.descricao} onChange={(e) => setO({ ...o, descricao: e.target.value })} placeholder="Conte um pouco sobre o trabalho da ONG..." className={inputClasse} />}
        </Campo>

        <div className="border-t border-stone-100 pt-4 mt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">Endereço da Sede</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <SeletorLocalidade
              estado={o.estado}
              cidade={o.cidade}
              onMudarEstado={(estado) => setO((prev) => ({ ...prev, estado }))}
              onMudarCidade={(cidade) => setO((prev) => ({ ...prev, cidade }))}
              erroEstado={erros.estado}
              erroCidade={erros.cidade}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Campo rotulo="Bairro" erro={erros.bairro}>
              {(id) => <input id={id} value={o.bairro} onChange={(e) => setO({ ...o, bairro: e.target.value })} className={inputClasse} />}
            </Campo>

            <Campo rotulo="Rua" erro={erros.rua}>
              {(id) => <input id={id} value={o.rua} onChange={(e) => setO({ ...o, rua: e.target.value })} className={inputClasse} />}
            </Campo>
          </div>

          <Campo rotulo="Complemento">
            {(id) => <input id={id} value={o.complemento} onChange={(e) => setO({ ...o, complemento: e.target.value })} placeholder="Sala, Bloco, etc. (Opcional)" className={inputClasse} />}
          </Campo>
        </div>

        {erroGeral && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erroGeral}</p>}
        {sucesso && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{sucesso}</p>}

        <div className="mt-4 flex justify-end gap-3">
          <button type="submit" disabled={enviando} className={`${botaoPrimario} w-full sm:w-auto px-6`}>
            {enviando ? 'Cadastrando instituição...' : 'Finalizar cadastro da ONG'}
          </button>
        </div>
      </form>
    </div>
  )
}