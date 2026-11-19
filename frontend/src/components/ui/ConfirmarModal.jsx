import Modal from './Modal'
import { botaoSecundario, botaoPerigo } from './Ui'

// "Tem certeza?" antes de ações sem volta, como excluir
export default function ConfirmarModal({ titulo, texto, rotuloConfirmar = 'Excluir', onConfirmar, onFechar, ocupado }) {
  return (
    <Modal titulo={titulo} onFechar={onFechar}>
      <p className="text-sm text-stone-600">{texto}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className={botaoSecundario} onClick={onFechar}>Cancelar</button>
        <button className={botaoPerigo} onClick={onConfirmar} disabled={ocupado}>{rotuloConfirmar}</button>
      </div>
    </Modal>
  )
}
