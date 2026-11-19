/**
 * @file AuthModals.jsx
 * @description Modais de autenticação (Login, Cadastro de Usuário, Cadastro de ONG e Recuperação de Senha).
 * Alinhado com as especificações e validações do backend Spring Boot.
 */

import { useAuth } from '../../context/AuthContext'
import { Cadastro } from './Cadastro'
import { CadastroInstitucional } from './CadastroInstitucional'
import { Login } from './Login'
import { RecuperarSenha } from './RecuperarSenha'

export default function AuthModals() {
  const { modal } = useAuth()
  if (modal === 'login') return <Login />
  if (modal === 'cadastro') return <Cadastro />
  if (modal === 'ong') return <CadastroInstitucional />
  if (modal === 'recuperar') return <RecuperarSenha />
  return null
}