import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { CIDADES_AMUREL } from '../../data/enums'
import { cadastrarUsuario } from "../../services/authService"
import { formatarTelefone, somenteDigitos } from '../../utils/format'
import { validarEmail } from '../../utils/validators'
import { LinkModal } from "../ui/LinkModal"
import Modal from '../ui/Modal'
import { botaoPrimario, Campo, inputClasse } from '../ui/Ui'

export function Cadastro() {
  const { cadastrar, abrirModal, fecharModal } = useAuth()
  
  const [f, setF] = useState({ 
    nome: '', sobrenome: '', email: '', telefone: '', nascimento: '',
    senha: '', confirmar: '', termos: false,
    estado: 'SC', cidade: '', bairro: '', rua: '', complemento: '' 
  })
  
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)
  
  const mudar = (campo) => (e) => setF({ 
    ...f, 
    [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value 
  })

  function validar() {
    const e = {}
    if (!f.nome.trim()) e.nome = 'Informe seu nome.'
    if (!f.sobrenome.trim()) e.sobrenome = 'Informe seu sobrenome.'
    if (!validarEmail(f.email)) e.email = 'Informe um e-mail válido.'
    if (somenteDigitos(f.telefone).length < 10) e.telefone = 'Informe DDD e número válido.'
    if (!f.nascimento) e.nascimento = 'Informe sua data de nascimento.'
    if (!f.cidade.trim()) e.cidade = 'Selecione sua cidade.'
    if (!f.bairro.trim()) e.bairro = 'Informe seu bairro.'
    if (!f.rua.trim()) e.rua = 'Informe sua rua.'
    if (f.senha.length < 8) e.senha = 'A senha precisa ter pelo menos 8 caracteres.'
    if (f.senha !== f.confirmar) e.confirmar = 'As senhas não coincidem.'
    if (!f.termos) e.termos = 'É preciso aceitar os termos para continuar.'
    return e
  }

  async function enviar(ev) {
    ev.preventDefault()
    const e = validar()
    setErros(e)
    if (Object.keys(e).length) return
    
    setEnviando(true)
    setErroGeral('')
    try {
      await cadastrarUsuario({ 
        nome: f.nome.trim(), 
        sobrenome: f.sobrenome.trim(), 
        email: f.email.trim(), 
        telefone: somenteDigitos(f.telefone), 
        nascimento: f.nascimento,
        senha: f.senha,
        endereco: {
          estado: f.estado,
          cidade: f.cidade,
          bairro: f.bairro.trim(),
          rua: f.rua.trim(),
          complemento: f.complemento.trim()
        }
      })
    } catch (err) {
      setErroGeral(err.message || 'Falha ao realizar cadastro.')
      setEnviando(false)
    }
  }

  return (
    <Modal titulo="Criar sua conta" onFechar={fecharModal}>
      <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo rotulo="Nome" erro={erros.nome}>{(id) => <input id={id} value={f.nome} onChange={mudar('nome')} className={inputClasse} autoComplete="given-name" />}</Campo>
          <Campo rotulo="Sobrenome" erro={erros.sobrenome}>{(id) => <input id={id} value={f.sobrenome} onChange={mudar('sobrenome')} className={inputClasse} autoComplete="family-name" />}</Campo>
        </div>
        
        <Campo rotulo="E-mail" erro={erros.email}>{(id) => <input id={id} type="email" value={f.email} onChange={mudar('email')} className={inputClasse} autoComplete="email" />}</Campo>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo rotulo="Telefone (WhatsApp)" erro={erros.telefone}>
            {(id) => <input id={id} value={f.telefone} onChange={(e) => setF({ ...f, telefone: formatarTelefone(e.target.value) })} placeholder="(48) 99999-9999" className={inputClasse} inputMode="tel" autoComplete="tel" />}
          </Campo>
          <Campo rotulo="Data de Nascimento" erro={erros.nascimento}>
            {(id) => <input id={id} type="date" value={f.nascimento} onChange={mudar('nascimento')} className={inputClasse} />}
          </Campo>
        </div>

        <div className="border-t border-stone-100 pt-3 mt-1">
          <p className="text-[11px] font-semibold text-stone-500 uppercase mb-3">Endereço Residencial</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Campo rotulo="Cidade" erro={erros.cidade}>
              {(id) => (
                <select id={id} value={f.cidade} onChange={mudar('cidade')} className={inputClasse}>
                  <option value="">Selecione a cidade</option>
                  {CIDADES_AMUREL.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </Campo>
            <Campo rotulo="Bairro" erro={erros.bairro}>{(id) => <input id={id} value={f.bairro} onChange={mudar('bairro')} className={inputClasse} />}</Campo>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo="Rua" erro={erros.rua}>{(id) => <input id={id} value={f.rua} onChange={mudar('rua')} className={inputClasse} />}</Campo>
            <Campo rotulo="Complemento">{(id) => <input id={id} value={f.complemento} onChange={mudar('complemento')} className={inputClasse} />}</Campo>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-2">
          <Campo rotulo="Senha" erro={erros.senha}>{(id) => <input id={id} type="password" value={f.senha} onChange={mudar('senha')} className={inputClasse} autoComplete="new-password" />}</Campo>
          <Campo rotulo="Confirmar senha" erro={erros.confirmar}>{(id) => <input id={id} type="password" value={f.confirmar} onChange={mudar('confirmar')} className={inputClasse} autoComplete="new-password" />}</Campo>
        </div>

        <div>
          <label className="flex items-start gap-2 text-sm text-stone-600 cursor-pointer">
            <input type="checkbox" checked={f.termos} onChange={mudar('termos')} className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-emerald-600" />
            <span>Li e concordo com os Termos de Uso e a Política de Privacidade (LGPD).</span>
          </label>
          {erros.termos && <p role="alert" className="mt-1 text-xs text-red-600">{erros.termos}</p>}
        </div>

        {erroGeral && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erroGeral}</p>}
        <button type="submit" disabled={enviando} className={botaoPrimario}>{enviando ? 'Criando conta...' : 'Concluir cadastro'}</button>
      </form>
      <p className="mt-5 text-center text-sm text-stone-600">
        Já tem conta? <LinkModal onClick={() => abrirModal('login')}>Entrar</LinkModal>
      </p>
    </Modal>
  )
}