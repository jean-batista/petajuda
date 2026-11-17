/**
 * @file EtapaDadosPublicacao.jsx
 * @description Etapa 2 do formulário de publicação: categoria, título, descrição do ocorrido e endereço.
 */

import { TIPO_PUBLICACAO } from '../../../data/enums'
import SeletorLocalidade from '../../ui/SeletorLocalidade'
import { Campo, inputClasse } from '../../ui/Ui'

export default function EtapaDadosPublicacao({ f, setF, mudar, erros }) {
  const vinculado = f.modoAnimal === 'VINCULADO'

  const tiposDisponiveis = Object.entries(TIPO_PUBLICACAO).filter(([valor]) =>
    vinculado ? valor !== 'ENCONTRADO' : valor === 'ENCONTRADO'
  )

  const listaTipos = tiposDisponiveis.length > 0 ? tiposDisponiveis : Object.entries(TIPO_PUBLICACAO)

  return (
    <>
      <div>
        <p className="mb-1.5 text-sm font-medium text-stone-700">Tipo de publicação</p>
        <div className={`grid gap-2 ${listaTipos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {listaTipos.map(([valor, tipo]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setF({ ...f, tipo: valor })}
              className={`rounded-xl border p-3 text-sm font-semibold transition ${
                f.tipo === valor
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-stone-300 hover:bg-stone-50'
              }`}
            >
              {tipo.label}
            </button>
          ))}
        </div>
      </div>

      <Campo rotulo="Título" erro={erros.titulo}>
        {(id) => (
          <input
            id={id}
            value={f.titulo}
            onChange={mudar('titulo')}
            placeholder={
              !vinculado
                ? 'Ex.: Cachorro caramelo encontrado próximo à praça'
                : 'Ex.: Cão perdido no Centro'
            }
            className={inputClasse}
          />
        )}
      </Campo>

      <Campo rotulo="Descrição do ocorrido" erro={erros.descricao}>
        {(id) => (
          <textarea
            id={id}
            rows={3}
            value={f.descricao}
            onChange={mudar('descricao')}
            placeholder="Onde e quando foi visto, se está abrigado ou na rua..."
            className={inputClasse}
          />
        )}
      </Campo>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SeletorLocalidade
          estado={f.estado}
          cidade={f.cidade}
          onMudarEstado={(estado) => setF((prev) => ({ ...prev, estado }))}
          onMudarCidade={(cidade) => setF((prev) => ({ ...prev, cidade }))}
          erroEstado={erros.estado}
          erroCidade={erros.cidade}
        />
        <Campo rotulo="Bairro" erro={erros.bairro}>
          {(id) => (
            <input
              id={id}
              value={f.bairro}
              onChange={mudar('bairro')}
              placeholder="Ex.: Centro"
              className={inputClasse}
            />
          )}
        </Campo>
        <Campo rotulo="Rua">
          {(id) => (
            <input
              id={id}
              value={f.rua}
              onChange={mudar('rua')}
              placeholder="Nome da rua ou avenida"
              className={inputClasse}
            />
          )}
        </Campo>
        <Campo rotulo="Ponto de referência (opcional)">
          {(id) => (
            <input
              id={id}
              value={f.complemento}
              onChange={mudar('complemento')}
              placeholder="Próximo a..."
              className={inputClasse}
            />
          )}
        </Campo>
      </div>
    </>
  )
}