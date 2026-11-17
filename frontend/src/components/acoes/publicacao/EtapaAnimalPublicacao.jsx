/**
 * @file EtapaAnimalPublicacao.jsx
 * @description Etapa 1 do formulário de publicação: identificação do pet (encontrado na rua ou já cadastrado).
 */

import { Info, Search, Upload, UserCheck, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ESPECIE_ANIMAL, IDADE_ANIMAL, PORTE_ANIMAL, SEXO_ANIMAL } from '../../../data/enums'
import { Campo, inputClasse } from '../../ui/Ui'

const OPCOES_IDENTIFICACAO = [
  { id: 'ENCONTRADO', titulo: 'Encontrado na rua', desc: 'Animal sem vínculo (achado na rua)', icone: Search },
  { id: 'VINCULADO', titulo: 'Animal já cadastrado', desc: 'Usar pet cadastrado no meu perfil', icone: UserCheck },
]

export default function EtapaAnimalPublicacao({
  f,
  setF,
  mudar,
  erros,
  animaisCadastrados,
  onAlterarModo,
  onSelecionarAnimal,
  onEscolherFoto,
  onIrParaCadastroAnimal,
}) {
  const vinculado = f.modoAnimal === 'VINCULADO'
  const camposTravados = vinculado && Boolean(f.animalId)

  const select = (campo, opcoes, desabilitado = false) => (id) => (
    <select
      id={id}
      value={f[campo]}
      onChange={mudar(campo)}
      disabled={desabilitado}
      className={`${inputClasse} ${desabilitado ? 'bg-stone-100 text-stone-500' : ''}`}
    >
      {Object.entries(opcoes).map(([valor, rotulo]) => (
        <option key={valor} value={valor}>
          {typeof rotulo === 'string' ? rotulo : (rotulo.label || valor)}
        </option>
      ))}
    </select>
  )

  return (
    <>
      {/* Seletor de Situação / Origem do Pet */}
      <div>
        <p className="mb-2 text-sm font-semibold text-stone-800">Qual a situação do animal?</p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {OPCOES_IDENTIFICACAO.map((op) => {
            const Icone = op.icone
            const ativo = f.modoAnimal === op.id
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => onAlterarModo(op.id)}
                className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                  ativo
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-1 ring-emerald-600'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Icone className={`h-4 w-4 ${ativo ? 'text-emerald-600' : 'text-stone-400'}`} />
                  {op.titulo}
                </div>
                <span className="mt-1 text-xs text-stone-500">{op.desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Aviso orientativo para publicações de Perdido ou Adoção */}
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="leading-relaxed">
          Para publicar um animal <strong>perdido</strong> ou disponível para <strong>adoção</strong>, é necessário que ele esteja previamente cadastrado na plataforma.{' '}
          {onIrParaCadastroAnimal ? (
            <button
              type="button"
              onClick={onIrParaCadastroAnimal}
              className="font-semibold text-emerald-700 underline hover:text-emerald-800"
            >
              Cadastrar animal agora
            </button>
          ) : (
            <Link
              to="/acoes?aba=animais"
              className="font-semibold text-emerald-700 underline hover:text-emerald-800"
            >
              Ir para cadastro de animais
            </Link>
          )}
        </p>
      </div>

      {/* Dropdown exibido quando o usuário escolhe "Animal já cadastrado" */}
      {vinculado && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <label htmlFor="select-animal-existente" className="mb-1.5 block text-sm font-semibold text-emerald-900">
            Selecione o animal cadastrado
          </label>
          <select
            id="select-animal-existente"
            value={f.animalId}
            onChange={onSelecionarAnimal}
            className={inputClasse}
          >
            <option value="">Escolha um animal da lista...</option>
            {animaisCadastrados.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.nome} ({pet.especie || pet.especieAnimal} · {pet.corPredominante || 'Cor não inf.'})
              </option>
            ))}
          </select>
          {erros.animalId && <p className="mt-1 text-xs text-rose-600">{erros.animalId}</p>}
        </div>
      )}

      {/* Campos da ficha do pet */}
      {(!vinculado || f.animalId) && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo={vinculado ? 'Nome do animal' : 'Nome ou apelido (opcional)'}>
              {(id) => (
                <input
                  id={id}
                  value={f.nome}
                  onChange={mudar('nome')}
                  disabled={camposTravados}
                  placeholder={vinculado ? '' : 'Deixe em branco se não souber'}
                  className={`${inputClasse} ${camposTravados ? 'bg-stone-100 text-stone-500' : ''}`}
                />
              )}
            </Campo>
            <Campo rotulo="Espécie">{select('especie', ESPECIE_ANIMAL, camposTravados)}</Campo>
            <Campo rotulo="Sexo">{select('sexo', SEXO_ANIMAL, camposTravados)}</Campo>
            <Campo rotulo="Porte">{select('porte', PORTE_ANIMAL, camposTravados)}</Campo>
            <Campo rotulo="Idade aproximada">{select('idade', IDADE_ANIMAL, camposTravados)}</Campo>
            <Campo rotulo="Cor predominante" erro={erros.corPredominante}>
              {(id) => (
                <input
                  id={id}
                  value={f.corPredominante}
                  onChange={mudar('corPredominante')}
                  disabled={camposTravados}
                  placeholder="Ex.: Caramelo"
                  className={`${inputClasse} ${camposTravados ? 'bg-stone-100 text-stone-500' : ''}`}
                />
              )}
            </Campo>
          </div>

          {vinculado && (
            <div className="flex flex-wrap gap-6 text-sm">
              <label className="flex cursor-not-allowed items-center gap-2 text-stone-400">
                <input type="checkbox" checked={f.castrado} disabled className="h-4 w-4 rounded accent-emerald-600" /> Castrado
              </label>
              <label className="flex cursor-not-allowed items-center gap-2 text-stone-400">
                <input type="checkbox" checked={f.vacinado} disabled className="h-4 w-4 rounded accent-emerald-600" /> Vacinado
              </label>
            </div>
          )}

          <Campo rotulo="Características observadas (opcional)">
            {(id) => (
              <textarea
                id={id}
                rows={2}
                value={f.descricaoAnimal}
                onChange={mudar('descricaoAnimal')}
                disabled={camposTravados}
                placeholder="Coleira, manchas, comportamento, ferimentos..."
                className={`${inputClasse} ${camposTravados ? 'bg-stone-100 text-stone-500' : ''}`}
              />
            )}
          </Campo>

          <div>
            <p className="mb-1.5 text-sm font-medium text-stone-700">
              Foto do animal {!camposTravados && <span className="text-rose-500">*</span>}
            </p>
            {f.fotoUrlAnimal ? (
              <div className="relative h-48 overflow-hidden rounded-xl border border-stone-300 bg-stone-100">
                <img src={f.fotoUrlAnimal} alt="Pré-visualização" className="h-full w-full object-contain" />
                {!camposTravados && (
                  <button
                    type="button"
                    onClick={() => setF({ ...f, fotoUrlAnimal: '', fotoArquivoAnimal: null })}
                    aria-label="Remover foto"
                    className="absolute right-2 top-2 rounded-full bg-rose-600 p-1 text-white hover:bg-rose-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <label className="block cursor-pointer rounded-xl border-2 border-dashed border-stone-300 p-6 text-center hover:bg-stone-50">
                <Upload className="mx-auto h-10 w-10 text-stone-400" />
                <span className="mt-1 block text-sm text-stone-600">
                  Clique para escolher uma foto nítida (JPEG, PNG, WEBP)
                </span>
                <input type="file" accept="image/*" onChange={onEscolherFoto} className="hidden" />
              </label>
            )}
            {erros.foto && <p className="mt-1 text-xs text-rose-600">{erros.foto}</p>}
          </div>
        </>
      )}
    </>
  )
}