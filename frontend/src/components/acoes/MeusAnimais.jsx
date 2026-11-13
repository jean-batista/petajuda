/**
 * @file MeusAnimais.jsx
 * @description Gerenciamento de animais (pets) cadastrados pelo usuário ou ONG.
 */

import { useCallback, useEffect, useState } from 'react'
import { PawPrint, PlusCircle, Pencil, Check, X } from 'lucide-react'
import { listarMeusAnimais } from '../../services/animalService'
import { ESPECIE_ANIMAL, PORTE_ANIMAL, IDADE_ANIMAL, SEXO_ANIMAL } from '../../data/enums'
import FotoAnimal from '../FotoAnimal'
import Modal from '../Modal'
import CadastroAnimalForm from './CadastroAnimalForm'
import { Carregando, Selo, Vazio, botaoPrimario, botaoSecundario } from '../ui'
import { useToast } from '../Toast'

export default function MeusAnimais({ usuario }) {
  const toast = useToast()
  const [lista, setLista] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)

  const carregar = useCallback(async () => {
    try {
      const dados = await listarMeusAnimais()
      setLista(Array.isArray(dados) ? dados : (dados?.content || []))
    } catch (err) {
      toast.erro?.(err.message || 'Falha ao carregar animais cadastrados.')
      setLista([])
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  function abrirNovo() {
    setEditando(null)
    setModalAberto(true)
  }

  function abrirEdicao(animal) {
    setEditando(animal)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setEditando(null)
  }

  if (lista === null) return <Carregando texto="Carregando animais..." />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-stone-500">
          {lista.length} {lista.length === 1 ? 'animal cadastrado' : 'animais cadastrados'}
        </p>
        <button onClick={abrirNovo} className={`${botaoPrimario} flex items-center gap-2`}>
          <PlusCircle className="h-4 w-4" /> Cadastrar animal
        </button>
      </div>

      {lista.length === 0 ? (
        <Vazio
          icone={PawPrint}
          titulo="Nenhum animal cadastrado"
          texto="Cadastre seus pets aqui para vinculá-los rapidamente às publicações de adoção ou perda."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((pet) => {
            const especie = ESPECIE_ANIMAL[pet.especie || pet.especieAnimal] || pet.especie || pet.especieAnimal
            const porte = PORTE_ANIMAL[pet.porte || pet.porteAnimal] || pet.porte || pet.porteAnimal
            const idade = IDADE_ANIMAL[pet.idade || pet.idadeAnimal] || pet.idade || pet.idadeAnimal
            const sexo = SEXO_ANIMAL[pet.sexo] || pet.sexo

            return (
              <li
                key={pet.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-44 w-full bg-stone-100">
                  <FotoAnimal animal={pet} className="h-full w-full object-cover" />
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-stone-900 text-base">{pet.nome}</h4>
                      <p className="text-xs text-stone-500">
                        {especie} · {sexo} · {porte} · {idade}
                      </p>
                    </div>
                    {pet.corPredominante && (
                      <Selo classe="bg-stone-100 text-stone-700 border border-stone-200">
                        {pet.corPredominante}
                      </Selo>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-stone-600">
                    <span className="inline-flex items-center gap-1">
                      {pet.castrado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-stone-400" />}
                      Castrado
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {pet.vacinado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-stone-400" />}
                      Vacinado
                    </span>
                  </div>

                  {pet.descricao && (
                    <p className="line-clamp-2 text-xs text-stone-600">{pet.descricao}</p>
                  )}

                  <div className="mt-auto pt-3 border-t border-stone-100">
                    <button
                      onClick={() => abrirEdicao(pet)}
                      className={`${botaoSecundario} w-full !py-1.5 flex items-center justify-center gap-1.5 text-xs`}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar ficha
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {modalAberto && (
        <Modal
          titulo={editando ? `Editar ${editando.nome}` : 'Cadastrar novo animal'}
          tamanho="md"
          onFechar={fecharModal}
        >
          <CadastroAnimalForm
            usuario={usuario}
            animal={editando}
            onCancelar={fecharModal}
            onSalvo={() => {
              fecharModal()
              carregar()
            }}
          />
        </Modal>
      )}
    </div>
  )
}