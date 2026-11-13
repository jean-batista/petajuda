/**
 * @file CadastroAnimalForm.jsx
 * @description Formulário dedicado para cadastro e edição independente de animais (pets).
 * Comunica-se com animalService.js via multipart/form-data.
 */

import { useState } from 'react'
import { Upload, X, PawPrint } from 'lucide-react'
import { Campo, inputClasse, botaoPrimario, botaoSecundario } from '../ui'
import { ESPECIE_ANIMAL, PORTE_ANIMAL, IDADE_ANIMAL, SEXO_ANIMAL } from '../../data/enums'
import { criarAnimal, atualizarAnimal } from '../../services/animalService'
import { useToast } from '../Toast'

function valoresIniciais(animal) {
  return {
    nome: animal?.nome ?? '',
    especie: animal?.especie ?? animal?.especieAnimal ?? 'CACHORRO',
    sexo: animal?.sexo ?? 'MACHO',
    porte: animal?.porte ?? animal?.porteAnimal ?? 'MEDIO',
    idade: animal?.idade ?? animal?.idadeAnimal ?? 'ADULTO',
    corPredominante: animal?.corPredominante ?? '',
    castrado: Boolean(animal?.castrado),
    vacinado: Boolean(animal?.vacinado),
    descricao: animal?.descricao ?? '',
    fotoUrl: animal?.fotoUrl ?? '',
    fotoArquivo: null,
  }
}

export default function CadastroAnimalForm({ usuario, animal, onSalvo, onCancelar }) {
  const toast = useToast()
  const [f, setF] = useState(() => valoresIniciais(animal))
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)

  const mudar = (campo) => (e) => setF({
    ...f,
    [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  })

  function escolherFoto(e) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    setF({
      ...f,
      fotoArquivo: arquivo,
      fotoUrl: URL.createObjectURL(arquivo)
    })
  }

  function validar() {
    const e = {}
    if (!f.nome.trim()) e.nome = 'Informe o nome ou apelido do animal.'
    if (!f.corPredominante.trim()) e.corPredominante = 'Informe a cor predominante.'
    if (!f.fotoUrl && !f.fotoArquivo && !animal) {
      e.foto = 'A foto do animal é obrigatória.'
    }
    return e
  }

  async function enviar(ev) {
    ev.preventDefault()
    const e = validar()
    setErros(e)
    if (Object.keys(e).length) return

    setEnviando(true)
    try {
      const payload = {
        nome: f.nome.trim(),
        especie: f.especie,
        sexo: f.sexo,
        porte: f.porte,
        idade: f.idade,
        corPredominante: f.corPredominante.trim(),
        castrado: f.castrado,
        vacinado: f.vacinado,
        descricao: f.descricao.trim(),
        ...(usuario?.ongId ? { ongId: usuario.ongId } : {})
      }

      let salvo
      if (animal?.id) {
        salvo = await atualizarAnimal(animal.id, payload)
      } else {
        const formData = new FormData()
        formData.append('dados', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
        if (f.fotoArquivo) {
          formData.append('foto', f.fotoArquivo)
        }
        salvo = await criarAnimal(formData)
      }

      toast.sucesso(animal ? 'Dados do animal atualizados!' : 'Animal cadastrado com sucesso!')
      onSalvo?.(salvo)
    } catch (err) {
      toast.erro(err.message || 'Erro ao salvar cadastro do animal.')
      setEnviando(false)
    }
  }

  const select = (campo, opcoes) => (id) => (
    <select id={id} value={f[campo]} onChange={mudar(campo)} className={inputClasse}>
      {Object.entries(opcoes).map(([valor, rotulo]) => (
        <option key={valor} value={valor}>
          {typeof rotulo === 'string' ? rotulo : (rotulo.label || valor)}
        </option>
      ))}
    </select>
  )

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5" noValidate>
      <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <PawPrint className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-stone-900">
            {animal ? `Editar ficha de ${animal.nome}` : 'Cadastrar novo animal'}
          </h3>
          <p className="text-xs text-stone-500">
            Após cadastrar, você poderá vincular este pet em publicações de adoção ou perda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome ou Apelido" erro={erros.nome}>
          {(id) => (
            <input
              id={id}
              value={f.nome}
              onChange={mudar('nome')}
              placeholder='Ex.: Pipoca, Thor, ou "Sem nome"'
              className={inputClasse}
            />
          )}
        </Campo>
        <Campo rotulo="Espécie">{select('especie', ESPECIE_ANIMAL)}</Campo>
        <Campo rotulo="Sexo">{select('sexo', SEXO_ANIMAL)}</Campo>
        <Campo rotulo="Porte">{select('porte', PORTE_ANIMAL)}</Campo>
        <Campo rotulo="Idade aproximada">{select('idade', IDADE_ANIMAL)}</Campo>
        <Campo rotulo="Cor predominante" erro={erros.corPredominante}>
          {(id) => (
            <input
              id={id}
              value={f.corPredominante}
              onChange={mudar('corPredominante')}
              placeholder="Ex.: Caramelo, Preto e branco"
              className={inputClasse}
            />
          )}
        </Campo>
      </div>

      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2 cursor-pointer text-stone-700">
          <input
            type="checkbox"
            checked={f.castrado}
            onChange={mudar('castrado')}
            className="h-4 w-4 accent-emerald-600 rounded"
          />
          Castrado
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-stone-700">
          <input
            type="checkbox"
            checked={f.vacinado}
            onChange={mudar('vacinado')}
            className="h-4 w-4 accent-emerald-600 rounded"
          />
          Vacinado
        </label>
      </div>

      <Campo rotulo="Características e histórico (opcional)">
        {(id) => (
          <textarea
            id={id}
            rows={3}
            value={f.descricao}
            onChange={mudar('descricao')}
            placeholder="Temperamento, marcas particulares, uso de medicamentos, coleira..."
            className={inputClasse}
          />
        )}
      </Campo>

      <div>
        <p className="mb-1.5 text-sm font-medium text-stone-700">
          Foto do animal {!animal && <span className="text-rose-500">*</span>}
        </p>
        {f.fotoUrl ? (
          <div className="relative h-48 overflow-hidden rounded-xl border border-stone-300 bg-stone-100">
            <img src={f.fotoUrl} alt="Pré-visualização do animal" className="h-full w-full object-contain" />
            {!animal && (
              <button
                type="button"
                onClick={() => setF({ ...f, fotoUrl: '', fotoArquivo: null })}
                aria-label="Remover foto"
                className="absolute right-2 top-2 rounded-full bg-rose-600 p-1 text-white hover:bg-rose-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <label className="block cursor-pointer rounded-xl border-2 border-dashed border-stone-300 p-6 text-center hover:bg-stone-50 transition-colors">
            <Upload className="mx-auto h-10 w-10 text-stone-400" />
            <span className="mt-1 block text-sm text-stone-600">
              Clique para escolher uma foto nítida (JPEG, PNG, WEBP)
            </span>
            <input type="file" accept="image/*" onChange={escolherFoto} className="hidden" />
          </label>
        )}
        {erros.foto && <p className="mt-1 text-xs text-rose-600">{erros.foto}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-stone-100">
        {onCancelar && (
          <button type="button" onClick={onCancelar} className={botaoSecundario}>
            Cancelar
          </button>
        )}
        <button type="submit" disabled={enviando} className={botaoPrimario}>
          {enviando ? 'Salvando...' : animal ? 'Salvar alterações' : 'Cadastrar animal'}
        </button>
      </div>
    </form>
  )
}