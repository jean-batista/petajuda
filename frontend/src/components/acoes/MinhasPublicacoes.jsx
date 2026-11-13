import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, CheckCircle2, RotateCcw, Eye, PlusCircle, FileText } from 'lucide-react'
import { listarPublicacoesDoAutor, alterarStatusPublicacao, excluirPublicacao } from '../../services/publicacaoService'
import { TIPO_PUBLICACAO, STATUS_PUBLICACAO, ROTULO_RESOLVIDO } from '../../data/enums'
import { formatarData } from '../../utils/format'
import FotoAnimal from '../FotoAnimal'
import Modal from '../Modal'
import ConfirmarModal from '../ConfirmarModal'
import PublicacaoForm from './PublicacaoForm'
import { Carregando, Selo, Vazio, botaoPrimario } from '../ui'
import { useToast } from '../Toast'

const botaoAcao = 'inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-stone-100'

// Tela 11: lista das publicações do usuário logado, com resolver / editar / excluir
export default function MinhasPublicacoes({ usuario, onNova }) {
  const toast = useToast()
  const [lista, setLista] = useState(null)
  const [editando, setEditando] = useState(null)
  const [excluindo, setExcluindo] = useState(null)

  const carregar = useCallback(() => listarPublicacoesDoAutor(usuario.id).then(setLista), [usuario.id])
  useEffect(() => { carregar() }, [carregar])

  async function alternarStatus(p) {
    const novo = p.status === 'ATIVO' ? 'RESOLVIDO' : 'ATIVO'
    await alterarStatusPublicacao(p.id, novo)
    toast.sucesso(novo === 'RESOLVIDO' ? 'Publicação encerrada. Que bom!' : 'Publicação reativada no feed.')
    carregar()
  }

  async function confirmarExclusao() {
    await excluirPublicacao(excluindo.id)
    setExcluindo(null)
    toast.sucesso('Publicação excluída.')
    carregar()
  }

  if (lista === null) return <Carregando />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-stone-500">{lista.length} {lista.length === 1 ? 'publicação' : 'publicações'}</p>
        <button onClick={onNova} className={botaoPrimario}><PlusCircle className="h-4 w-4" /> Criar nova publicação</button>
      </div>

      {lista.length === 0 ? (
        <Vazio icone={FileText} titulo="Você ainda não publicou nada" texto="Cadastre um animal perdido, encontrado ou para adoção." />
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((p) => (
            <li key={p.id} className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center">
              <FotoAnimal animal={p.animal} className="h-20 w-full shrink-0 rounded-xl sm:w-28" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <Selo classe={TIPO_PUBLICACAO[p.tipoPublicacao].classe}>{TIPO_PUBLICACAO[p.tipoPublicacao].label}</Selo>
                  <Selo classe={STATUS_PUBLICACAO[p.status].classe}>{STATUS_PUBLICACAO[p.status].label}</Selo>
                </div>
                <p className="mt-1 truncate font-semibold">{p.titulo}</p>
                <p className="text-sm text-stone-500">{p.endereco.cidade} · {formatarData(p.data)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/publicacoes/${p.id}`} className={botaoAcao}><Eye className="h-4 w-4" /> Ver</Link>
                <button onClick={() => alternarStatus(p)} className={botaoAcao}>
                  {p.status === 'ATIVO'
                    ? <><CheckCircle2 className="h-4 w-4 text-green-600" /> Marcar como {ROTULO_RESOLVIDO[p.tipoPublicacao]}</>
                    : <><RotateCcw className="h-4 w-4" /> Reativar</>}
                </button>
                <button onClick={() => setEditando(p)} className={botaoAcao}><Pencil className="h-4 w-4" /> Editar</button>
                <button onClick={() => setExcluindo(p)} className={`${botaoAcao} text-red-600 hover:bg-red-50`}><Trash2 className="h-4 w-4" /> Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editando && (
        <Modal titulo="Editar publicação" tamanho="md" onFechar={() => setEditando(null)}>
          <PublicacaoForm usuario={usuario} publicacao={editando} onCancelar={() => setEditando(null)}
            onSalvo={() => { setEditando(null); carregar() }} />
        </Modal>
      )}
      {excluindo && (
        <ConfirmarModal titulo="Excluir publicação?" texto={`"${excluindo.titulo}" será removida do feed. Esta ação não pode ser desfeita.`}
          onConfirmar={confirmarExclusao} onFechar={() => setExcluindo(null)} />
      )}
    </div>
  )
}

