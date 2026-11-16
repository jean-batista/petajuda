// Cliente HTTP da API Spring Boot.
// A API só é usada quando VITE_API_URL está definida (arquivo .env.local).
// Sem ela, o site usa os dados de demonstração (data/store.js).
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const USAR_API = Boolean(BASE)

const CHAVE_TOKEN = 'petajuda:token'

export function salvarToken(token) {
  try {
    if (token) localStorage.setItem(CHAVE_TOKEN, token)
    else localStorage.removeItem(CHAVE_TOKEN)
  } catch { /* ignora */ }
}

export function lerToken() {
  try { return localStorage.getItem(CHAVE_TOKEN) } catch { return null }
}

// Erro com a mensagem que o backend mandou (ExceptionResponse.message)
export class ErroApi extends Error {
  constructor(status, mensagem, corpo) {
    super(mensagem)
    this.status = status
    this.resposta = corpo
  }
}

function mensagemAmigavel(status, corpo) {
  let msg = corpo?.message || ''
  msg = msg.replace(/^Validation Failed:\s*/i, '')
  if (msg) return msg
  if (status === 401 || status === 403) return 'Sua sessão expirou ou você não tem permissão. Entre novamente.'
  if (status === 404) return 'Registro não encontrado.'
  if (status >= 500) return 'O servidor teve um problema. Tente novamente em instantes.'
  return 'Não foi possível concluir a operação.'
}

// requisicao('/api/v1/publicacoes', { metodo: 'POST', json: {...} })
// requisicao('/api/v1/animais', { metodo: 'POST', form: formData })
export async function requisicao(caminho, { metodo = 'GET', json, form, params } = {}) {
  const url = new URL(BASE + caminho)
  if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && v !== '' && url.searchParams.set(k, v))

  const headers = { Accept: 'application/json' }
  const token = lerToken()
  if (token) headers.Authorization = `Bearer ${token}`
  let body
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(json)
  } else if (form) {
    body = form // o navegador define o Content-Type multipart com o boundary
  }

  let resposta
  try {
    resposta = await fetch(url, { method: metodo, headers, body })
  } catch {
    throw new ErroApi(0, 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
  }

  const texto = await resposta.text()
  let corpo = null
  try { corpo = texto ? JSON.parse(texto) : null } catch { corpo = { message: texto } }

  if (!resposta.ok) throw new ErroApi(resposta.status, mensagemAmigavel(resposta.status, corpo), corpo)
  return corpo
}

// monta o multipart/form-data que os endpoints com foto esperam:
// parte "dados" (JSON) + parte "foto" (arquivo)
export function formularioComFoto(dados, fotoDataUrl) {
  const form = new FormData()
  form.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (fotoDataUrl && fotoDataUrl.startsWith('data:')) form.append('foto', dataUrlParaBlob(fotoDataUrl), 'foto.jpg')
  return form
}

function dataUrlParaBlob(dataUrl) {
  const [cabecalho, base64] = dataUrl.split(',')
  const tipo = cabecalho.match(/data:(.*?);/)?.[1] || 'image/jpeg'
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: tipo })
}
