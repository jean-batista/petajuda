/**
 * @file SeletorLocalidade.jsx
 * @description Par de selects padronizados (Estado e Cidade) alimentados pela API do IBGE.
 */

import { useEffect, useState } from 'react'
import { listarCidadesPorEstado, listarEstados } from '../../services/ibgeService'
import { Campo, inputClasse } from './Ui'

export default function SeletorLocalidade({
  estado,
  cidade,
  onMudarEstado,
  onMudarCidade,
  erroEstado,
  erroCidade,
  permitirTodos = false,
}) {
  const [estados, setEstados] = useState([])
  const [cidades, setCidades] = useState([])
  const [carregandoCidades, setCarregandoCidades] = useState(false)

  useEffect(() => {
    let ativo = true
    listarEstados()
      .then((lista) => { if (ativo) setEstados(lista) })
      .catch(() => { if (ativo) setEstados([]) })
    return () => { ativo = false }
  }, [])

  useEffect(() => {
    if (!estado) {
      setCidades([])
      return
    }
    let ativo = true
    setCarregandoCidades(true)
    listarCidadesPorEstado(estado)
      .then((lista) => {
        if (ativo) {
          setCidades(lista)
          setCarregandoCidades(false)
        }
      })
      .catch(() => {
        if (ativo) {
          setCidades([])
          setCarregandoCidades(false)
        }
      })
    return () => { ativo = false }
  }, [estado])

  function handleEstado(e) {
    const novaUf = e.target.value
    onMudarEstado(novaUf)
    onMudarCidade('')
  }

  return (
    <>
      <Campo rotulo="Estado (UF)" erro={erroEstado}>
        {(id) => (
          <select id={id} value={estado} onChange={handleEstado} className={inputClasse}>
            <option value="">{permitirTodos ? 'Todos os estados' : 'Selecione o estado...'}</option>
            {estados.map((uf) => (
              <option key={uf.sigla} value={uf.sigla}>
                {uf.nome} ({uf.sigla})
              </option>
            ))}
          </select>
        )}
      </Campo>

      <Campo rotulo="Cidade" erro={erroCidade}>
        {(id) => (
          <select
            id={id}
            value={cidade}
            onChange={(e) => onMudarCidade(e.target.value)}
            disabled={!estado || carregandoCidades}
            className={`${inputClasse} disabled:bg-stone-100 disabled:text-stone-400`}
          >
            <option value="">
              {!estado
                ? 'Selecione um estado primeiro'
                : carregandoCidades
                  ? 'Carregando cidades...'
                  : permitirTodos
                    ? 'Todas as cidades'
                    : 'Selecione a cidade...'}
            </option>
            {cidades.map((nomeCidade) => (
              <option key={nomeCidade} value={nomeCidade}>
                {nomeCidade}
              </option>
            ))}
          </select>
        )}
      </Campo>
    </>
  )
}