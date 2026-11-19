// Funções pequenas de formatação usadas em várias telas

export const somenteDigitos = (texto = '') => String(texto).replace(/\D/g, '')

export function formatarData(iso) {
  if (!iso) return ''
  // datas só com dia (2026-11-15) recebem horário para não "voltar um dia" por fuso
  const data = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
  return data.toLocaleDateString('pt-BR')
}

// link do WhatsApp: wa.me/55 + DDD + número
export function linkWhatsApp(telefone, mensagem = '') {
  let numero = somenteDigitos(telefone)
  if (numero.length <= 11) numero = `55${numero}`
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : ''
  return `https://wa.me/${numero}${texto}`
}

// (48) 99999-9999
export function formatarTelefone(valor = '') {
  const d = somenteDigitos(valor).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

// 00.000.000/0000-00
export function formatarCnpj(valor = '') {
  const d = somenteDigitos(valor).slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

// copia texto mesmo em páginas sem HTTPS (onde navigator.clipboard pode não existir)
export async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    const campo = document.createElement('textarea')
    campo.value = texto
    campo.style.position = 'fixed'
    campo.style.opacity = '0'
    document.body.appendChild(campo)
    campo.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { ok = false }
    document.body.removeChild(campo)
    return ok
  }
}

// reduz a foto escolhida (máx. 800px) e devolve uma data URL leve
export function lerImagem(arquivo, maxLado = 800) {
  return new Promise((resolve, reject) => {
    if (!arquivo || !arquivo.type.startsWith('image/')) return reject(new Error('Escolha um arquivo de imagem.'))
    const leitor = new FileReader()
    leitor.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    leitor.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Imagem inválida.'))
      img.onload = () => {
        const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * escala)
        canvas.height = Math.round(img.height * escala)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = leitor.result
    }
    leitor.readAsDataURL(arquivo)
  })
}
