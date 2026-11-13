// "Banco de dados" do modo demonstração.
// Guarda tudo no localStorage para o que foi criado não sumir ao recarregar a página.
// Quando o backend Spring estiver pronto, este arquivo deixa de ser usado.
import * as seed from './mockData'

const CHAVE = 'petajuda:dados:v1'
const copia = (valor) => JSON.parse(JSON.stringify(valor))

function dadosIniciais() {
  return {
    publicacoes: copia(seed.publicacoes),
    ongs: copia(seed.ongs),
    campanhas: copia(seed.campanhas),
    usuarios: copia(seed.usuarios),
    denuncias: copia(seed.denuncias),
  }
}

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (bruto) return JSON.parse(bruto)
  } catch { /* localStorage indisponível: usa só a memória */ }
  return dadosIniciais()
}

const dados = carregar()

export function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados))
  } catch { /* sem espaço ou bloqueado: continua em memória */ }
}

// volta tudo ao estado original (útil para testar a apresentação de novo)
export function restaurarDemonstracao() {
  Object.assign(dados, dadosIniciais())
  salvar()
}

export const gerarId = (prefixo) => `${prefixo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const esperar = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

export default dados
