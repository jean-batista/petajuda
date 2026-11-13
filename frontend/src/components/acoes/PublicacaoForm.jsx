import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Campo, inputClasse, botaoPrimario, botaoSecundario } from '../ui'
import { TIPO_PUBLICACAO, ESPECIE, PORTE, IDADE, SEXO, CIDADES_AMUREL } from '../../data/enums'
import { lerImagem } from '../../utils/format'
import { criarPublicacao, atualizarPublicacao } from '../../services/publicacaoService'
import { useToast } from '../Toast'

// valores iniciais: vazio para nova publicação, ou os dados atuais ao editar
function valoresIniciais(p, usuario) {
  return {
    nome: p?.animal.nome ?? '',
    especieAnimal: p?.animal.especieAnimal ?? 'CACHORRO',
    sexo: p?.animal.sexo ?? 'MACHO',
    porteAnimal: p?.animal.porteAnimal ?? 'MEDIO',
    idadeAnimal: p?.animal.idadeAnimal ?? 'ADULTO',
    corPredominante: p?.animal.corPredominante ?? '',
    castrado: p?.animal.castrado ?? false,
    vacinado: p?.animal.vacinado ?? false,
    descricaoAnimal: p?.animal.descricao ?? '',
    fotoUrl: p?.animal.fotoUrl ?? '',
    tipoPublicacao: p?.tipoPublicacao ?? (usuario.perfil === 'ONG' ? 'ADOCAO' : 'PERDIDO'),
    titulo: p?.titulo ?? '',
    descricao: p?.descricao ?? '',
    cidade: p?.endereco.cidade ?? 'Tubarão',
    bairro: p?.endereco.bairro ?? '',
    rua: p?.endereco.rua ?? '',
    complemento: p?.endereco.complemento ?? '',
    exibirTelefone: p?.autor.exibirTelefone ?? true,
  }
}

// Formulário em 2 etapas (Tela 12): 1) ficha do pet  2) dados da publicação
export default function PublicacaoForm({ usuario, publicacao, onSalvo, onCancelar }) {
  const toast = useToast()
  const [etapa, setEtapa] = useState(1)
  const [f, setF] = useState(() => valoresIniciais(publicacao, usuario))
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)
  const mudar = (campo) => (e) => setF({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  async function escolherFoto(e) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    try {
      setF({ ...f, fotoUrl: await lerImagem(arquivo) })
    } catch (err) {
      toast.erro(err.message)
    }
  }

  function validarEtapa1() {
    const e = {}
    if (!f.nome.trim()) e.nome = 'Informe o nome ou "Sem nome".'
    if (!f.corPredominante.trim()) e.corPredominante = 'Informe a cor predominante.'
    return e
  }
  function validarEtapa2() {
    const e = {}
    if (f.titulo.trim().length < 5) e.titulo = 'Escreva um título (mínimo 5 caracteres).'
    if (f.descricao.trim().length < 10) e.descricao = 'Descreva o ocorrido (mínimo 10 caracteres).'
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

    // monta o objeto no formato da API (Animal + Publicação + Endereço)
    const dto = {
      titulo: f.titulo.trim(),
      descricao: f.descricao.trim(),
      tipoPublicacao: f.tipoPublicacao,
      exibirTelefone: f.exibirTelefone,
      animal: {
        nome: f.nome.trim(), sexo: f.sexo, corPredominante: f.corPredominante.trim(),
        castrado: f.castrado, vacinado: f.vacinado, descricao: f.descricaoAnimal.trim(),
        fotoUrl: f.fotoUrl, idadeAnimal: f.idadeAnimal, porteAnimal: f.porteAnimal, especieAnimal: f.especieAnimal,
      },
      endereco: { cidade: f.cidade, bairro: f.bairro.trim(), rua: f.rua.trim(), complemento: f.complemento.trim() },
    }

    setEnviando(true)
    try {
      const salva = publicacao ? await atualizarPublicacao(publicacao.id, dto) : await criarPublicacao(dto, usuario)
      toast.sucesso(publicacao ? 'Publicação atualizada!' : 'Publicação criada! Ela já aparece no feed.')
      onSalvo?.(salva)
    } catch (err) {
      toast.erro(err.message)
      setEnviando(false)
    }
  }

  const select = (campo, opcoes) => (id) => (
    <select id={id} value={f[campo]} onChange={mudar(campo)} className={inputClasse}>
      {Object.entries(opcoes).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
    </select>
  )

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5" noValidate>
      {/* indicador de etapas */}
      <ol className="flex gap-2 text-sm font-medium">
        {['Ficha do pet', 'Dados da publicação'].map((nome, i) => (
          <li key={nome} className={`flex-1 rounded-xl px-3 py-2 ${etapa === i + 1 ? 'bg-green-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
            {i + 1}. {nome}
          </li>
        ))}
      </ol>

      {etapa === 1 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome ou apelido" erro={erros.nome}>{(id) => <input id={id} value={f.nome} onChange={mudar('nome')} placeholder='Ex.: Thor, ou "Sem nome"' className={inputClasse} />}</Campo>
            <Campo rotulo="Espécie">{select('especieAnimal', ESPECIE)}</Campo>
            <Campo rotulo="Sexo">{select('sexo', SEXO)}</Campo>
            <Campo rotulo="Porte">{select('porteAnimal', PORTE)}</Campo>
            <Campo rotulo="Idade aproximada">{select('idadeAnimal', IDADE)}</Campo>
            <Campo rotulo="Cor predominante" erro={erros.corPredominante}>{(id) => <input id={id} value={f.corPredominante} onChange={mudar('corPredominante')} placeholder="Ex.: Caramelo" className={inputClasse} />}</Campo>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.castrado} onChange={mudar('castrado')} className="h-4 w-4 accent-green-600" /> Castrado</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.vacinado} onChange={mudar('vacinado')} className="h-4 w-4 accent-green-600" /> Vacinado</label>
          </div>

          <Campo rotulo="Características (opcional)">{(id) => <textarea id={id} rows={2} value={f.descricaoAnimal} onChange={mudar('descricaoAnimal')} placeholder="Temperamento, marcas, coleira..." className={inputClasse} />}</Campo>

          <div>
            <p className="mb-1.5 text-sm font-medium text-stone-700">Foto do animal</p>
            {f.fotoUrl ? (
              <div className="relative h-48 overflow-hidden rounded-xl border border-stone-300 bg-stone-100">
                <img src={f.fotoUrl} alt="Pré-visualização" className="h-full w-full object-contain" />
                <button type="button" onClick={() => setF({ ...f, fotoUrl: '' })} aria-label="Remover foto"
                  className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer rounded-xl border-2 border-dashed border-stone-300 p-6 text-center hover:bg-stone-50">
                <Upload className="mx-auto h-10 w-10 text-stone-400" />
                <span className="mt-1 block text-sm text-stone-600">Clique para escolher uma foto nítida</span>
                <input type="file" accept="image/*" onChange={escolherFoto} className="hidden" />
              </label>
            )}
          </div>
        </>
      ) : (
        <>
          <div>
            <p className="mb-1.5 text-sm font-medium text-stone-700">Tipo de publicação</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TIPO_PUBLICACAO).map(([valor, tipo]) => (
                <button key={valor} type="button" onClick={() => setF({ ...f, tipoPublicacao: valor })}
                  className={`rounded-xl border p-3 text-sm font-semibold transition ${
                    f.tipoPublicacao === valor ? 'border-green-600 bg-green-50 text-green-700' : 'border-stone-300 hover:bg-stone-50'
                  }`}>
                  {tipo.label}
                </button>
              ))}
            </div>
          </div>

          <Campo rotulo="Título" erro={erros.titulo}>{(id) => <input id={id} value={f.titulo} onChange={mudar('titulo')} placeholder="Ex.: Cão caramelo perdido no Centro" className={inputClasse} />}</Campo>
          <Campo rotulo="Descrição do ocorrido" erro={erros.descricao}>{(id) => <textarea id={id} rows={3} value={f.descricao} onChange={mudar('descricao')} placeholder="Onde e quando foi visto, como está..." className={inputClasse} />}</Campo>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo="Cidade">{(id) => (
              <select id={id} value={f.cidade} onChange={mudar('cidade')} className={inputClasse}>
                {CIDADES_AMUREL.map((c) => <option key={c}>{c}</option>)}
              </select>
            )}</Campo>
            <Campo rotulo="Bairro" erro={erros.bairro}>{(id) => <input id={id} value={f.bairro} onChange={mudar('bairro')} className={inputClasse} />}</Campo>
            <Campo rotulo="Rua (opcional)">{(id) => <input id={id} value={f.rua} onChange={mudar('rua')} className={inputClasse} />}</Campo>
            <Campo rotulo="Ponto de referência (opcional)">{(id) => <input id={id} value={f.complemento} onChange={mudar('complemento')} className={inputClasse} />}</Campo>
          </div>

          <label className="flex items-start gap-2 rounded-xl bg-stone-50 p-3 text-sm text-stone-700">
            <input type="checkbox" checked={f.exibirTelefone} onChange={mudar('exibirTelefone')} className="mt-0.5 h-4 w-4 accent-green-600" />
            <span>Mostrar meu WhatsApp nesta publicação para que as pessoas possam me chamar (LGPD).</span>
          </label>
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
