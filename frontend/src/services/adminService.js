import { USAR_API } from './http'
import * as api from './api/adminApi'
import dados, { esperar } from '../data/store'

// futuro: relatórios e estatísticas gerais (RF19)
export async function obterMetricas() {
  if (USAR_API) return api.obterMetricas(...arguments)
  await esperar(150)
  return {
    totalUsuarios: dados.usuarios.length,
    totalOngs: dados.ongs.filter((o) => o.status === 'APROVADA').length,
    ongsPendentes: dados.ongs.filter((o) => o.status === 'PENDENTE').length,
    publicacoesAtivas: dados.publicacoes.filter((p) => p.status === 'ATIVO').length,
    animaisResolvidos: dados.publicacoes.filter((p) => p.status === 'RESOLVIDO').length,
    denunciasPendentes: dados.denuncias.filter((d) => d.status === 'PENDENTE').length,
  }
}
