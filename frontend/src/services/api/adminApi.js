import { listarUsuarios } from './authApi'
import { listarOngs } from './ongApi'
import { listarPublicacoes } from './publicacaoApi'
import { listarDenuncias } from './denunciaApi'

export async function obterMetricas() {
  const [usuarios, ongs, pubs, denuncias] = await Promise.all([
    listarUsuarios().catch(() => []), listarOngs().catch(() => []),
    listarPublicacoes().catch(() => []), listarDenuncias().catch(() => []),
  ])
  return {
    totalUsuarios: usuarios.length,
    totalOngs: ongs.length,
    ongsPendentes: 0,
    publicacoesAtivas: pubs.filter((p) => p.status === 'ATIVO').length,
    animaisResolvidos: pubs.filter((p) => p.status === 'RESOLVIDO').length,
    denunciasPendentes: denuncias.filter((d) => d.status === 'PENDENTE').length,
  }
}
