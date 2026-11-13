import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { CIDADES_AMUREL } from '../../data/enums'
import { formatarCnpj, formatarTelefone, somenteDigitos } from '../../utils/format'
import Modal from '../Modal'
import { botaoPrimario, botaoSecundario, Campo, inputClasse } from '../ui'
import { LinkModal } from "../LinkModal"
import { emailValido } from '../../utils/emailValidator'
import { cadastrarOng } from '../../services/authService'

export function CadastroInstitucional() {
  const { cadastrarOng, abrirModal, fecharModal } = useAuth()
  const [passo, setPasso] = useState(1)
  
  const [r, setR] = useState({ nome: '', sobrenome: '', email: '', telefone: '', nascimento: '', senha: '' })
  const [o, setO] = useState({ nome: '', razaoSocial: '', cnpj: '', chavePix: '', descricao: '', cidade: '', bairro: '', rua: '', complemento: '' })
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)

  function validarPasso1() {
    const e = {}
    if (!r.nome.trim()) e.nome = 'Informe o nome.'
    if (!r.sobrenome.trim()) e.sobrenome = 'Informe o sobrenome.'
    if (!emailValido(r.email)) e.email = 'Informe um e-mail válido.'
    if (somenteDigitos(r.telefone).length < 10) e.telefone = 'Informe DDD e número.'
    if (!r.nascimento) e.nascimento = 'Informe sua data de nascimento.'
    if (r.senha.length < 8) e.senha = 'Mínimo de 8 caracteres.'
    return e
  }
  
  function validarPasso2() {
    const e = {}
    if (!o.nome.trim()) e.nome = 'Informe o nome da instituição.'
    if (!o.razaoSocial.trim()) e.razaoSocial = 'Informe a razão social.'
    if (somenteDigitos(o.cnpj).length !== 14) e.cnpj = 'O CNPJ precisa ter 14 números.'
    if (!o.chavePix.trim()) e.chavePix = 'Informe a chave Pix para doações.'
    if (o.descricao.trim().length < 20) e.descricao = 'Conte um pouco mais (mínimo 20 caracteres).'
    if (!o.cidade.trim()) e.cidade = 'Selecione a cidade.'
    if (!o.bairro.trim()) e.bairro = 'Informe o bairro.'
    if (!o.rua.trim()) e.rua = 'Informe a rua.'
    return e
  }

  function avancar(ev) {
    ev.preventDefault()
    const e = validarPasso1()
    setErros(e)
    if (!Object.keys(e).length) setPasso(2)
  }

  async function enviar(ev) {
    ev.preventDefault()
    const e = validarPasso2()
    setErros(e)
    if (Object.keys(e).length) return
    
    setEnviando(true)
    setErroGeral('')
    try {
      await cadastrarOng({
        responsavel: { 
          ...r, 
          nome: r.nome.trim(), 
          sobrenome: r.sobrenome.trim(), 
          telefone: somenteDigitos(r.telefone)
        },
        ong: {
          nome: o.nome.trim(), 
          razaoSocial: o.razaoSocial.trim(), 
          cnpj: somenteDigitos(o.cnpj),
          chavePix: o.chavePix.trim(), 
          descricao: o.descricao.trim(),
          endereco: { 
            estado: 'SC', 
            cidade: o.cidade, 
            bairro: o.bairro.trim(), 
            rua: o.rua.trim(), 
            complemento: o.complemento.trim() 
          },
        },
      })
    } catch (err) {
      setErroGeral(err.message || 'Falha ao cadastrar instituição.')
      setEnviando(false)
    }
  }

  return (
    <Modal titulo="Cadastrar ONG ou protetor" tamanho="md" onFechar={fecharModal}>
      <p className="mb-4 text-sm font-medium text-stone-500">
        Passo {passo} de 2 · {passo === 1 ? 'Dados do responsável' : 'Dados da instituição'}
      </p>

      {passo === 1 ? (
        <form onSubmit={avancar} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome" erro={erros.nome}>{(id) => <input id={id} value={r.nome} onChange={(e) => setR({ ...r, nome: e.target.value })} className={inputClasse} />}</Campo>
            <Campo rotulo="Sobrenome" erro={erros.sobrenome}>{(id) => <input id={id} value={r.sobrenome} onChange={(e) => setR({ ...r, sobrenome: e.target.value })} className={inputClasse} />}</Campo>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo="E-mail" erro={erros.email}>{(id) => <input id={id} type="email" value={r.email} onChange={(e) => setR({ ...r, email: e.target.value })} className={inputClasse} />}</Campo>
            <Campo rotulo="Data de Nascimento" erro={erros.nascimento}>{(id) => <input id={id} type="date" value={r.nascimento} onChange={(e) => setR({ ...r, nascimento: e.target.value })} className={inputClasse} />}</Campo>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo="Telefone (WhatsApp)" erro={erros.telefone}>{(id) => <input id={id} value={r.telefone} onChange={(e) => setR({ ...r, telefone: formatarTelefone(e.target.value) })} placeholder="(48) 99999-9999" className={inputClasse} />}</Campo>
            <Campo rotulo="Senha" erro={erros.senha}>{(id) => <input id={id} type="password" value={r.senha} onChange={(e) => setR({ ...r, senha: e.target.value })} className={inputClasse} autoComplete="new-password" />}</Campo>
          </div>
          <button type="submit" className={botaoPrimario}>Próximo passo</button>
        </form>
      ) : (
        <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome da instituição" erro={erros.nome}>{(id) => <input id={id} value={o.nome} onChange={(e) => setO({ ...o, nome: e.target.value })} className={inputClasse} />}</Campo>
            <Campo rotulo="Razão social" erro={erros.razaoSocial}>{(id) => <input id={id} value={o.razaoSocial} onChange={(e) => setO({ ...o, razaoSocial: e.target.value })} className={inputClasse} />}</Campo>
            <Campo rotulo="CNPJ" erro={erros.cnpj}>{(id) => <input id={id} value={o.cnpj} onChange={(e) => setO({ ...o, cnpj: formatarCnpj(e.target.value) })} placeholder="00.000.000/0000-00" className={inputClasse} inputMode="numeric" />}</Campo>
            <Campo rotulo="Chave Pix" erro={erros.chavePix}>{(id) => <input id={id} value={o.chavePix} onChange={(e) => setO({ ...o, chavePix: e.target.value })} className={inputClasse} />}</Campo>
          </div>
          <Campo rotulo="Descrição da instituição" erro={erros.descricao}>
            {(id) => <textarea id={id} rows={3} value={o.descricao} onChange={(e) => setO({ ...o, descricao: e.target.value })} className={inputClasse} />}
          </Campo>
          <div className="border-t border-stone-100 pt-3 mt-1">
             <p className="text-[11px] font-semibold text-stone-500 uppercase mb-3">Endereço da Sede</p>
             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
               <Campo rotulo="Cidade" erro={erros.cidade}>
                 {(id) => (
                   <select id={id} value={o.cidade} onChange={(e) => setO({ ...o, cidade: e.target.value })} className={inputClasse}>
                     <option value="">Selecione a cidade</option>
                     {CIDADES_AMUREL.map((c) => <option key={c} value={c}>{c}</option>)}
                   </select>
                 )}
               </Campo>
               <Campo rotulo="Bairro" erro={erros.bairro}>{(id) => <input id={id} value={o.bairro} onChange={(e) => setO({ ...o, bairro: e.target.value })} className={inputClasse} />}</Campo>
             </div>
             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
               <Campo rotulo="Rua" erro={erros.rua}>{(id) => <input id={id} value={o.rua} onChange={(e) => setO({ ...o, rua: e.target.value })} className={inputClasse} />}</Campo>
               <Campo rotulo="Complemento">{(id) => <input id={id} value={o.complemento} onChange={(e) => setO({ ...o, complemento: e.target.value })} className={inputClasse} />}</Campo>
             </div>
          </div>

          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            O perfil passará por análise da administração antes de ser exibido publicamente.
          </p>
          {erroGeral && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erroGeral}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={() => setPasso(1)} className={botaoSecundario}>Voltar</button>
            <button type="submit" disabled={enviando} className={`${botaoPrimario} flex-1`}>{enviando ? 'Enviando...' : 'Enviar cadastro'}</button>
          </div>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-stone-600">
        Já tem conta? <LinkModal onClick={() => abrirModal('login')}>Entrar</LinkModal>
      </p>
    </Modal>
  )
}