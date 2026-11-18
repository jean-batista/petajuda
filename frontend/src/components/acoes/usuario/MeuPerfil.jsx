/**
 * @file MeuPerfil.jsx
 * @description Gestão de perfil do usuário logado e dados institucionais de ONG.
 * Utiliza authService e ongService.
 */

import { useAuth } from '../../../context/AuthContext'
import { Carregando } from '../../ui/Ui'
import { DadosInstituicao } from './DadosInstituicao'
import { DadosPessoais } from './DadosPessoais'
import { TrocarSenha } from './TrocarSenha'

export default function MeuPerfil() {
  const { usuario } = useAuth()
  if (!usuario) return <Carregando />

  const ongId = usuario.ongId || usuario.ong?.id

  return (
    <div className="flex flex-col gap-5">
      {ongId && <DadosInstituicao ongId={ongId} />}
      <DadosPessoais />
      <TrocarSenha />
    </div>
  )
}