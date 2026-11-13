import { useState } from 'react'
import { Eye, EyeOff, MailCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Modal from '../Modal'
import { Campo, inputClasse, botaoPrimario, botaoSecundario } from '../ui'
import { CIDADES_AMUREL } from '../../data/enums'
import { formatarTelefone, formatarCnpj, somenteDigitos } from '../../utils/format'
import * as authService from '../../services/authService'

// link com aparência de texto, para trocar de janela (ex.: "Criar conta")
function LinkModal({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="font-semibold text-green-700 hover:text-green-800 hover:underline">
      {children}
    </button>
  )
}

const emailValido = (v) => /^\S+@\S+\.\S+$/.test(v)

// ---------- LOGIN ----------
function Login() {
  const { entrar, abrirModal, fecharModal } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [ver, setVer] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await entrar(email, senha)
    } catch (err) {
      setErro(err.message)
      setEnviando(false)
    }
  }

  const contasDemo = [
    ['Usuário', 'usuario@petajuda.com'],
    ['ONG', 'ong@petajuda.com'],
    ['Admin', 'admin@petajuda.com'],
  ]

  return (
    <Modal titulo="Entrar no Pet Ajuda" onFechar={fecharModal}>
      <img src="/logo-completa.png" alt="" className="mx-auto mb-4 h-20 w-auto" />
      <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <Campo rotulo="E-mail">
          {(id) => (
            <input id={id} type="email" autoComplete="email" value={email} required
              onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" className={inputClasse} />
          )}
        </Campo>

        <Campo rotulo="Senha">
          {(id) => (
            <div className="relative">
              <input id={id} type={ver ? 'text' : 'password'} autoComplete="current-password" value={senha} required
                onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" className={`${inputClasse} pr-11`} />
              <button type="button" onClick={() => setVer(!ver)} aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-500 hover:bg-stone-100">
                {ver ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}
        </Campo>

        <div className="text-right text-sm">
          <LinkModal onClick={() => abrirModal('recuperar')}>Esqueci minha senha</LinkModal>
        </div>

        {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</p>}

        <button type="submit" disabled={enviando || !email || !senha} className={botaoPrimario}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-stone-600">
        Não tem conta? <LinkModal onClick={() => abrirModal('cadastro')}>Criar conta</LinkModal>
        <span className="mx-2 text-stone-300">|</span>
        <LinkModal onClick={() => abrirModal('ong')}>Cadastrar minha ONG</LinkModal>
      </p>

      <div className="mt-5 rounded-2xl bg-stone-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Contas de demonstração · senha 123456</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {contasDemo.map(([nome, mail]) => (
            <button key={mail} type="button" onClick={() => { setEmail(mail); setSenha('123456'); setErro('') }}
              className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-stone-700 hover:bg-green-50 hover:text-green-700">
              {nome}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}

// ---------- CADASTRO DE USUÁRIO ----------
function Cadastro() {
  const { cadastrar, abrirModal, fecharModal } = useAuth()
  const [f, setF] = useState({ nome: '', sobrenome: '', email: '', telefone: '', senha: '', confirmar: '', termos: false })
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const mudar = (campo) => (e) => setF({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  function validar() {
    const e = {}
    if (!f.nome.trim()) e.nome = 'Informe seu nome.'
    if (!f.sobrenome.trim()) e.sobrenome = 'Informe seu sobrenome.'
    if (!emailValido(f.email)) e.email = 'Informe um e-mail válido.'
    if (somenteDigitos(f.telefone).length < 10) e.telefone = 'Informe DDD e número.'
    if (f.senha.length < 6) e.senha = 'A senha precisa ter pelo menos 6 caracteres.'
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
      await cadastrar({ nome: f.nome.trim(), sobrenome: f.sobrenome.trim(), email: f.email, telefone: somenteDigitos(f.telefone), senha: f.senha })
    } catch (err) {
      setErroGeral(err.message)
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
        <Campo rotulo="Telefone (WhatsApp)" erro={erros.telefone}>
          {(id) => <input id={id} value={f.telefone} onChange={(e) => setF({ ...f, telefone: formatarTelefone(e.target.value) })} placeholder="(48) 99999-9999" className={inputClasse} inputMode="tel" autoComplete="tel" />}
        </Campo>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo rotulo="Senha" erro={erros.senha}>{(id) => <input id={id} type="password" value={f.senha} onChange={mudar('senha')} className={inputClasse} autoComplete="new-password" />}</Campo>
          <Campo rotulo="Confirmar senha" erro={erros.confirmar}>{(id) => <input id={id} type="password" value={f.confirmar} onChange={mudar('confirmar')} className={inputClasse} autoComplete="new-password" />}</Campo>
        </div>

        <div>
          <label className="flex items-start gap-2 text-sm text-stone-600">
            <input type="checkbox" checked={f.termos} onChange={mudar('termos')} className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-green-600" />
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

// ---------- CADASTRO INSTITUCIONAL (ONG / PROTETOR) ----------
function CadastroOng() {
  const { cadastrarOng, abrirModal, fecharModal } = useAuth()
  const [passo, setPasso] = useState(1)
  const [r, setR] = useState({ nome: '', sobrenome: '', email: '', telefone: '', senha: '' })
  const [o, setO] = useState({ nome: '', razaoSocial: '', cnpj: '', chavePix: '', descricao: '', cidade: 'Tubarão', bairro: '', rua: '', complemento: '' })
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)

  function validarPasso1() {
    const e = {}
    if (!r.nome.trim()) e.nome = 'Informe o nome.'
    if (!r.sobrenome.trim()) e.sobrenome = 'Informe o sobrenome.'
    if (!emailValido(r.email)) e.email = 'Informe um e-mail válido.'
    if (somenteDigitos(r.telefone).length < 10) e.telefone = 'Informe DDD e número.'
    if (r.senha.length < 6) e.senha = 'Mínimo de 6 caracteres.'
    return e
  }
  function validarPasso2() {
    const e = {}
    if (!o.nome.trim()) e.nome = 'Informe o nome da instituição.'
    if (!o.razaoSocial.trim()) e.razaoSocial = 'Informe a razão social.'
    if (somenteDigitos(o.cnpj).length !== 14) e.cnpj = 'O CNPJ precisa ter 14 números.'
    if (!o.chavePix.trim()) e.chavePix = 'Informe a chave Pix para doações.'
    if (o.descricao.trim().length < 20) e.descricao = 'Conte um pouco mais (mínimo 20 caracteres).'
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
        responsavel: { ...r, nome: r.nome.trim(), sobrenome: r.sobrenome.trim(), telefone: somenteDigitos(r.telefone) },
        ong: {
          nome: o.nome.trim(), razaoSocial: o.razaoSocial.trim(), cnpj: somenteDigitos(o.cnpj),
          chavePix: o.chavePix.trim(), descricao: o.descricao.trim(),
          endereco: { estado: 'SC', cidade: o.cidade, bairro: o.bairro.trim(), rua: o.rua.trim(), complemento: o.complemento.trim() },
        },
      })
    } catch (err) {
      setErroGeral(err.message)
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
          <Campo rotulo="E-mail" erro={erros.email}>{(id) => <input id={id} type="email" value={r.email} onChange={(e) => setR({ ...r, email: e.target.value })} className={inputClasse} />}</Campo>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo="Cidade">{(id) => (
              <select id={id} value={o.cidade} onChange={(e) => setO({ ...o, cidade: e.target.value })} className={inputClasse}>
                {CIDADES_AMUREL.map((c) => <option key={c}>{c}</option>)}
              </select>
            )}</Campo>
            <Campo rotulo="Bairro" erro={erros.bairro}>{(id) => <input id={id} value={o.bairro} onChange={(e) => setO({ ...o, bairro: e.target.value })} className={inputClasse} />}</Campo>
            <Campo rotulo="Rua" erro={erros.rua}>{(id) => <input id={id} value={o.rua} onChange={(e) => setO({ ...o, rua: e.target.value })} className={inputClasse} />}</Campo>
            <Campo rotulo="Complemento">{(id) => <input id={id} value={o.complemento} onChange={(e) => setO({ ...o, complemento: e.target.value })} className={inputClasse} />}</Campo>
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

// ---------- RECUPERAR SENHA ----------
function Recuperar() {
  const { abrirModal, fecharModal } = useAuth()
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function enviar(ev) {
    ev.preventDefault()
    if (!emailValido(email)) return setErro('Informe um e-mail válido.')
    setErro('')
    setEnviando(true)
    await authService.recuperarSenha(email)
    setEnviado(true)
    setEnviando(false)
  }

  return (
    <Modal titulo="Recuperar senha" onFechar={fecharModal}>
      {enviado ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <MailCheck className="h-12 w-12 text-green-600" />
          <p className="font-semibold text-stone-800">Confira seu e-mail</p>
          <p className="text-sm text-stone-600">
            Se houver uma conta com <strong>{email}</strong>, enviamos o link para criar uma nova senha.
          </p>
          <button onClick={() => abrirModal('login')} className={`${botaoPrimario} mt-2`}>Voltar para o login</button>
        </div>
      ) : (
        <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
          <p className="text-sm text-stone-600">Informe o e-mail da sua conta e enviaremos um link para redefinir a senha.</p>
          <Campo rotulo="E-mail" erro={erro}>{(id) => <input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasse} autoComplete="email" />}</Campo>
          <button type="submit" disabled={enviando} className={botaoPrimario}>{enviando ? 'Enviando...' : 'Enviar link'}</button>
          <p className="text-center text-sm"><LinkModal onClick={() => abrirModal('login')}>Voltar para o login</LinkModal></p>
        </form>
      )}
    </Modal>
  )
}

// escolhe qual janela mostrar (vem do AuthContext)
export default function AuthModals() {
  const { modal } = useAuth()
  if (modal === 'login') return <Login />
  if (modal === 'cadastro') return <Cadastro />
  if (modal === 'ong') return <CadastroOng />
  if (modal === 'recuperar') return <Recuperar />
  return null
}
