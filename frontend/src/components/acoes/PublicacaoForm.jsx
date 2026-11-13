/**
 * @file PublicacaoForm.jsx
 * @description Formulário multi-etapas para criação e edição de publicações com upload multipart/form-data.
 * Permite vincular um animal previamente cadastrado ou informar os dados de um novo pet.
 */

import { useEffect, useState } from 'react'
import { Upload, X, PawPrint } from 'lucide-react'
import { Campo, inputClasse, botaoPrimario, botaoSecundario } from '../ui'
import { TIPO_PUBLICACAO, ESPECIE_ANIMAL, PORTE_ANIMAL, IDADE_ANIMAL, SEXO_ANIMAL } from '../../data/enums'
import { criarPublicacao, atualizarPublicacao } from '../../services/publicacaoService'
import { listarMeusAnimais } from '../../services/animalService'
import { useToast } from '../Toast'

function valoresIniciais(p, usuario) {
  return {
    // Vínculo com animal existente
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
    tipo: p?.tipo ?? p?.tipoPublicacao ?? (usuario?.perfil === 'ONG' ? 'ADOCAO' : 'PERDIDO'),
    titulo: p?.titulo ?? '',
    descricao: p?.descricao ?? '',

    // Endereço livre (sem cidades fixas)
    cidade: p?.endereco?.cidade ?? '',
    estado: p?.endereco?.estado ?? 'SC',
    bairro: p?.endereco?.bairro ?? '',
    rua: p?.endereco?.rua ?? '',
    complemento: p?.endereco?.complemento ?? '',

    fotoUrlPub: p?.fotoUrl ?? '',
    fotoArquivoPub: null,
  }
}

export default function PublicacaoForm({ usuario, publicacao, onSalvo, onCancelar }) {
  const toast = useToast()
  const [etapa, setEtapa] = useState(1)
  const [f, setF] = useState(() => valoresIniciais(publicacao, usuario))
  const [animaisCadastrados, setAnimaisCadastrados] = useState([])
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)

  // Carrega os animais previamente cadastrados para permitir vínculo rápido
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

  // Preenche ou limpa os campos quando o usuário escolhe um pet já cadastrado
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
      setErros((prev) => ({ ...prev, nome: undefined, corPredominante: undefined, foto: undefined }))
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
    // Se vinculou um animal já existente, os dados dele já estão válidos no banco
    if (f.animalId) return e

    if (!f.nome.trim()) e.nome = 'Informe o nome ou apelido do animal.'
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

      const payloadPublicacao = {
        titulo: f.titulo.trim(),
        descricao: f.descricao.trim(),
        tipo: f.tipo,
        animalId: f.animalId || null,
        // Caso não haja animalId vinculado, envia os dados para criação conjunta (se suportado pelo endpoint)
        ...(!f.animalId ? {
          animal: {
            nome: f.nome.trim(),
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

  const select = (campo, opcoes, desabilitado = false) => (id) => (
    <select id={id} value={f[campo]} onChange={mudar(campo)} disabled={desabilitado} className={`${inputClasse} ${desabilitado ? 'bg-stone-100 text-stone-500' : ''}`}>
      {Object.entries(opcoes).map(([valor, rotulo]) => (
        <option key={valor} value={valor}>{typeof rotulo === 'string' ? rotulo : (rotulo.label || valor)}</option>
      ))}
    </select>
  )

  const vinculado = Boolean(f.animalId)

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5" noValidate>
      <ol className="flex gap-2 text-sm font-medium">
        {['Ficha do pet', 'Dados da publicação'].map((nome, i) => (
          <li key={nome} className={`flex-1 rounded-xl px-3 py-2 text-center transition-colors ${etapa === i + 1 ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
            {i + 1}. {nome}
          </li>
        ))}
      </ol>

      {etapa === 1 ? (
        <>
          {/* Seletor de Animal Previamente Cadastrado */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <label htmlFor="select-animal-existente" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-emerald-900">
              <PawPrint className="h-4 w-4 text-emerald-700" />
              Vincular animal já cadastrado (opcional)
            </label>
            <select
              id="select-animal-existente"
              value={f.animalId}
              onChange={selecionarAnimalExistente}
              className={inputClasse}
            >
              <option value="">+ Cadastrar um novo pet nesta publicação</option>
              {animaisCadastrados.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.nome} ({pet.especie || pet.especieAnimal} · {pet.corPredominante || 'Cor não inf.'})
                </option>
              ))}
            </select>
            {vinculado && (
              <p className="mt-1.5 text-xs text-emerald-700">
                Ficha preenchida automaticamente a partir do cadastro existente. Para editar os dados do pet, limpe a seleção acima.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome ou Apelido" erro={erros.nome}>
              {(id) => (
                <input
                  id={id}
                  value={f.nome}
                  onChange={mudar('nome')}
                  disabled={vinculado}
                  placeholder='Ex.: Thor, ou "Sem nome"'
                  className={`${inputClasse} ${vinculado ? 'bg-stone-100 text-stone-500' : ''}`}
                />
              )}
            </Campo>
            <Campo rotulo="Espécie">{select('especie', ESPECIE_ANIMAL, vinculado)}</Campo>
            <Campo rotulo="Sexo">{select('sexo', SEXO_ANIMAL, vinculado)}</Campo>
            <Campo rotulo="Porte">{select('porte', PORTE_ANIMAL, vinculado)}</Campo>
            <Campo rotulo="Idade aproximada">{select('idade', IDADE_ANIMAL, vinculado)}</Campo>
            <Campo rotulo="Cor predominante" erro={erros.corPredominante}>
              {(id) => (
                <input
                  id={id}
                  value={f.corPredominante}
                  onChange={mudar('corPredominante')}
                  disabled={vinculado}
                  placeholder="Ex.: Caramelo"
                  className={`${inputClasse} ${vinculado ? 'bg-stone-100 text-stone-500' : ''}`}
                />
              )}
            </Campo>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <label className={`flex items-center gap-2 ${vinculado ? 'cursor-not-allowed text-stone-400' : 'cursor-pointer'}`}>
              <input type="checkbox" checked={f.castrado} onChange={mudar('castrado')} disabled={vinculado} className="h-4 w-4 accent-emerald-600 rounded" /> Castrado
            </label>
            <label className={`flex items-center gap-2 ${vinculado ? 'cursor-not-allowed text-stone-400' : 'cursor-pointer'}`}>
              <input type="checkbox" checked={f.vacinado} onChange={mudar('vacinado')} disabled={vinculado} className="h-4 w-4 accent-emerald-600 rounded" /> Vacinado
            </label>
          </div>

          <Campo rotulo="Características e histórico (opcional)">
            {(id) => (
              <textarea
                id={id}
                rows={2}
                value={f.descricaoAnimal}
                onChange={mudar('descricaoAnimal')}
                disabled={vinculado}
                placeholder="Temperamento, marcas, coleira..."
                className={`${inputClasse} ${vinculado ? 'bg-stone-100 text-stone-500' : ''}`}
              />
            )}
          </Campo>

          <div>
            <p className="mb-1.5 text-sm font-medium text-stone-700">Foto do animal {!vinculado && <span className="text-rose-500">*</span>}</p>
            {f.fotoUrlAnimal ? (
              <div className="relative h-48 overflow-hidden rounded-xl border border-stone-300 bg-stone-100">
                <img src={f.fotoUrlAnimal} alt="Pré-visualização" className="h-full w-full object-contain" />
                {!vinculado && (
                  <button type="button" onClick={() => setF({ ...f, fotoUrlAnimal: '', fotoArquivoAnimal: null })} aria-label="Remover foto"
                    className="absolute right-2 top-2 rounded-full bg-rose-600 p-1 text-white hover:bg-rose-700">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <label className="block cursor-pointer rounded-xl border-2 border-dashed border-stone-300 p-6 text-center hover:bg-stone-50">
                <Upload className="mx-auto h-10 w-10 text-stone-400" />
                <span className="mt-1 block text-sm text-stone-600">Clique para escolher uma foto nítida (JPEG, PNG, WEBP)</span>
                <input type="file" accept="image/*" onChange={escolherFotoAnimal} className="hidden" />
              </label>
            )}
            {erros.foto && <p className="mt-1 text-xs text-rose-600">{erros.foto}</p>}
          </div>
        </>
      ) : (
        <>
          <div>
            <p className="mb-1.5 text-sm font-medium text-stone-700">Tipo de publicação</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TIPO_PUBLICACAO).map(([valor, tipo]) => (
                <button key={valor} type="button" onClick={() => setF({ ...f, tipo: valor })}
                  className={`rounded-xl border p-3 text-sm font-semibold transition ${
                    f.tipo === valor ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-stone-300 hover:bg-stone-50'
                  }`}>
                  {tipo.label}
                </button>
              ))}
            </div>
          </div>

          <Campo rotulo="Título" erro={erros.titulo}>
            {(id) => <input id={id} value={f.titulo} onChange={mudar('titulo')} placeholder="Ex.: Cão caramelo perdido no Centro" className={inputClasse} />}
          </Campo>
          <Campo rotulo="Descrição do ocorrido" erro={erros.descricao}>
            {(id) => <textarea id={id} rows={3} value={f.descricao} onChange={mudar('descricao')} placeholder="Onde e quando foi visto, como está..." className={inputClasse} />}
          </Campo>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo="Cidade" erro={erros.cidade}>
              {(id) => <input id={id} value={f.cidade} onChange={mudar('cidade')} placeholder="Digite o nome da cidade" className={inputClasse} />}
            </Campo>
            <Campo rotulo="Bairro" erro={erros.bairro}>
              {(id) => <input id={id} value={f.bairro} onChange={mudar('bairro')} placeholder="Ex.: Centro" className={inputClasse} />}
            </Campo>
            <Campo rotulo="Rua">
              {(id) => <input id={id} value={f.rua} onChange={mudar('rua')} placeholder="Nome da rua ou avenida" className={inputClasse} />}
            </Campo>
            <Campo rotulo="Ponto de referência (opcional)">
              {(id) => <input id={id} value={f.complemento} onChange={mudar('complemento')} placeholder="Próximo a..." className={inputClasse} />}
            </Campo>
          </div>
        </>
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