/**
 * @file PublicacaoForm.jsx
 * @description Orquestrador do formulário multi-etapas para criação e edição de publicações.
 */

import { useEffect, useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { listarMeusAnimais } from '../../../services/animalService'
import { atualizarPublicacao, criarPublicacao } from '../../../services/publicacaoService'
import { botaoPrimario, botaoSecundario } from '../../ui/Ui'
import EtapaAnimalPublicacao from './EtapaAnimalPublicacao'
import EtapaDadosPublicacao from './EtapaDadosPublicacao'

function valoresIniciais(p, usuario) {
  const temAnimalVinculado = Boolean(p?.animal?.id ?? p?.animalId)

  return {
    modoAnimal: temAnimalVinculado ? 'VINCULADO' : 'ENCONTRADO',
    animalId: p?.animal?.id ?? p?.animalId ?? '',

    // Dados do Animal
    nome: p?.animal?.nome ?? '',
    especie: p?.animal?.especie ?? p?.animal?.especieAnimal ?? 'CACHORRO',
    sexo: p?.animal?.sexo ?? 'MACHO',
    porte: p?.animal?.porte ?? p?.animal?.porteAnimal ?? 'MEDIO',
    idade: p?.animal?.idade ?? p?.animal?.idadeAnimal ?? 'ADULTO',
    corPredominante: p?.animal?.corPredominante ?? '',
    castrado: p?.animal?.castrado ?? false,
    vacinado: p?.animal?.vacinado ?? false,
    descricaoAnimal: p?.animal?.descricao ?? '',
    fotoUrlAnimal: p?.animal?.fotoUrl ?? '',
    fotoArquivoAnimal: null,

    // Dados da Publicação
    tipo: p?.tipo ?? p?.tipoPublicacao ?? (temAnimalVinculado ? (usuario?.perfil === 'ONG' ? 'ADOCAO' : 'PERDIDO') : 'ENCONTRADO'),
    titulo: p?.titulo ?? '',
    descricao: p?.descricao ?? '',

    // Endereço
    cidade: p?.endereco?.cidade ?? '',
    estado: p?.endereco?.estado ?? 'SC',
    bairro: p?.endereco?.bairro ?? '',
    rua: p?.endereco?.rua ?? '',
    complemento: p?.endereco?.complemento ?? '',

    fotoUrlPub: p?.fotoUrl ?? '',
    fotoArquivoPub: null,
  }
}

export default function PublicacaoForm({ usuario, publicacao, onSalvo, onCancelar, onIrParaCadastroAnimal }) {
  const toast = useToast()
  const [etapa, setEtapa] = useState(1)
  const [f, setF] = useState(() => valoresIniciais(publicacao, usuario))
  const [animaisCadastrados, setAnimaisCadastrados] = useState([])
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let ativo = true
    listarMeusAnimais()
      .then((lista) => {
        if (ativo) setAnimaisCadastrados(Array.isArray(lista) ? lista : (lista?.content || []))
      })
      .catch(() => {
        if (ativo) setAnimaisCadastrados([])
      })
    return () => { ativo = false }
  }, [])

  const mudar = (campo) => (e) => setF({
    ...f,
    [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  })

  function alterarModoAnimal(novoModo) {
    setErros({})
    setF((prev) => ({
      ...prev,
      modoAnimal: novoModo,
      animalId: '',
      nome: '',
      corPredominante: '',
      descricaoAnimal: '',
      fotoUrlAnimal: '',
      fotoArquivoAnimal: null,
      tipo: novoModo === 'ENCONTRADO'
        ? 'ENCONTRADO'
        : (usuario?.perfil === 'ONG' ? 'ADOCAO' : 'PERDIDO')
    }))
  }

  function selecionarAnimalExistente(e) {
    const idSelecionado = e.target.value
    if (!idSelecionado) {
      setF((prev) => ({
        ...prev,
        animalId: '',
        nome: '',
        corPredominante: '',
        descricaoAnimal: '',
        fotoUrlAnimal: '',
        fotoArquivoAnimal: null,
      }))
      return
    }

    const pet = animaisCadastrados.find((a) => String(a.id) === String(idSelecionado))
    if (pet) {
      setF((prev) => ({
        ...prev,
        animalId: pet.id,
        nome: pet.nome ?? '',
        especie: pet.especie ?? pet.especieAnimal ?? 'CACHORRO',
        sexo: pet.sexo ?? 'MACHO',
        porte: pet.porte ?? pet.porteAnimal ?? 'MEDIO',
        idade: pet.idade ?? pet.idadeAnimal ?? 'ADULTO',
        corPredominante: pet.corPredominante ?? '',
        castrado: Boolean(pet.castrado),
        vacinado: Boolean(pet.vacinado),
        descricaoAnimal: pet.descricao ?? '',
        fotoUrlAnimal: pet.fotoUrl ?? '',
        fotoArquivoAnimal: null,
      }))
      setErros({})
    }
  }

  function escolherFotoAnimal(e) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    setF({
      ...f,
      fotoArquivoAnimal: arquivo,
      fotoUrlAnimal: URL.createObjectURL(arquivo)
    })
  }

  function validarEtapa1() {
    const e = {}
    if (f.modoAnimal === 'VINCULADO') {
      if (!f.animalId) e.animalId = 'Selecione um animal da sua lista.'
      return e
    }

    if (!f.corPredominante.trim()) e.corPredominante = 'Informe a cor predominante.'
    if (!f.fotoUrlAnimal && !f.fotoArquivoAnimal && !publicacao) e.foto = 'A foto do animal é obrigatória.'
    return e
  }

  function validarEtapa2() {
    const e = {}
    if (f.titulo.trim().length < 5) e.titulo = 'Escreva um título (mínimo 5 caracteres).'
    if (f.descricao.trim().length < 10) e.descricao = 'Descreva o ocorrido (mínimo 10 caracteres).'
    if (!f.cidade.trim()) e.cidade = 'Informe a cidade.'
    if (!f.bairro.trim()) e.bairro = 'Informe o bairro.'
    return e
  }

  function avancar() {
    const e = validarEtapa1()
    setErros(e)
    if (!Object.keys(e).length) setEtapa(2)
  }

  async function enviar(ev) {
    ev.preventDefault()
    if (etapa === 1) return avancar()

    const e = validarEtapa2()
    setErros(e)
    if (Object.keys(e).length) return

    setEnviando(true)
    try {
      const formData = new FormData()
      const isVinculado = f.modoAnimal === 'VINCULADO' && Boolean(f.animalId)

      const payloadPublicacao = {
        titulo: f.titulo.trim(),
        descricao: f.descricao.trim(),
        tipo: f.tipo,
        animalId: isVinculado ? f.animalId : null,
        ...(!isVinculado ? {
          animal: {
            nome: f.nome.trim() || 'Animal encontrado (sem identificação)',
            especie: f.especie,
            sexo: f.sexo,
            porte: f.porte,
            idade: f.idade,
            corPredominante: f.corPredominante.trim(),
            castrado: f.castrado,
            vacinado: f.vacinado,
            descricao: f.descricaoAnimal.trim(),
          }
        } : {}),
        endereco: {
          estado: f.estado,
          cidade: f.cidade.trim(),
          bairro: f.bairro.trim(),
          rua: f.rua.trim(),
          complemento: f.complemento.trim()
        }
      }

      formData.append('dados', new Blob([JSON.stringify(payloadPublicacao)], { type: 'application/json' }))

      if (f.fotoArquivoPub) {
        formData.append('foto', f.fotoArquivoPub)
      } else if (f.fotoArquivoAnimal) {
        formData.append('foto', f.fotoArquivoAnimal)
      }

      const salva = publicacao
        ? await atualizarPublicacao(publicacao.id, formData)
        : await criarPublicacao(formData)

      toast.sucesso(publicacao ? 'Publicação atualizada com sucesso!' : 'Publicação criada e publicada no feed!')
      onSalvo?.(salva)
    } catch (err) {
      toast.erro(err.message || 'Erro ao salvar publicação.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5" noValidate>
      <ol className="flex gap-2 text-sm font-medium">
        {['Identificação do pet', 'Dados da publicação'].map((nome, i) => (
          <li
            key={nome}
            className={`flex-1 rounded-xl px-3 py-2 text-center transition-colors ${
              etapa === i + 1 ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'
            }`}
          >
            {i + 1}. {nome}
          </li>
        ))}
      </ol>

      {etapa === 1 ? (
        <EtapaAnimalPublicacao
          f={f}
          setF={setF}
          mudar={mudar}
          erros={erros}
          animaisCadastrados={animaisCadastrados}
          onAlterarModo={alterarModoAnimal}
          onSelecionarAnimal={selecionarAnimalExistente}
          onEscolherFoto={escolherFotoAnimal}
          onIrParaCadastroAnimal={onIrParaCadastroAnimal}
        />
      ) : (
        <EtapaDadosPublicacao
          f={f}
          setF={setF}
          mudar={mudar}
          erros={erros}
        />
      )}

      <div className="flex justify-between gap-3 pt-2">
        {etapa === 1 ? (
          onCancelar ? <button type="button" onClick={onCancelar} className={botaoSecundario}>Cancelar</button> : <span />
        ) : (
          <button type="button" onClick={() => setEtapa(1)} className={botaoSecundario}>Voltar</button>
        )}

        {etapa === 1 ? (
          <button type="button" onClick={avancar} className={botaoPrimario}>Próxima etapa</button>
        ) : (
          <button type="submit" disabled={enviando} className={botaoPrimario}>
            {enviando ? 'Salvando...' : publicacao ? 'Salvar alterações' : 'Publicar'}
          </button>
        )}
      </div>
    </form>
  )
}