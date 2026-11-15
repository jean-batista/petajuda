/**
 * @file api.js
 * @description Cliente HTTP centralizado utilizando o fetch nativo com tratamento seguro de headers.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

async function tratarErroResponse(res, mensagemPadrao) {
  try {
    const errorData = await res.json()
    throw new Error(errorData.detail || errorData.message || mensagemPadrao)
  } catch (err) {
    if (err.message && err.message !== mensagemPadrao) throw err
    throw new Error(mensagemPadrao)
  }
}

/**
 * Função interna base de requisição
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('petajuda_token')

  // 1. Normaliza os headers recebidos para garantir que sejam um objeto plano e seguro
  let headersObj = {}
  if (options.headers) {
    if (Array.isArray(options.headers)) {
      headersObj = Object.fromEntries(options.headers)
    } else if (typeof options.headers === 'object') {
      // Filtra chaves numéricas acidentais (como '0', '1') caso tenham sido passadas por engano
      Object.entries(options.headers).forEach(([key, value]) => {
        if (isNaN(Number(key))) {
          headersObj[key] = value
        }
      })
    }
  }

  // 2. Constrói os headers finais
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headersObj,
  }

  // 3. Trata o corpo da requisição (se for FormData, remove o Content-Type para o browser gerar o boundary)
  let body = options.body
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    body = JSON.stringify(body)
  }
  
  if (body instanceof FormData) {
    delete finalHeaders['Content-Type']
  }

  const config = {
    ...options,
    headers: finalHeaders,
    body,
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config)

    if (!res.ok) {
      await tratarErroResponse(res, 'Ocorreu um erro na requisição.')
    }

    if (res.status === 204) {
      return null
    }

    const contentType = res.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await res.json()
    }

    return await res.text()
  } catch (err) {
    throw err
  }
}

// Exportação híbrida (suporta tanto api('/url') quanto api.get('/url'))
export const api = Object.assign(request, {
  get: (endpoint, headers) => request(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) => request(endpoint, { method: 'POST', body, headers }),
  put: (endpoint, body, headers) => request(endpoint, { method: 'PUT', body, headers }),
  patch: (endpoint, body, headers) => request(endpoint, { method: 'PATCH', body, headers }),
  delete: (endpoint, headers) => request(endpoint, { method: 'DELETE', headers }),
})