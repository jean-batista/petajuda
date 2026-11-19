package com.petajuda.services;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import com.petajuda.dtos.request.UsuarioCredenciaisRequest;
import com.petajuda.dtos.response.UsuarioAutenticacaoInfoResponse;
import com.petajuda.enums.PerfilUsuario;
import com.petajuda.exceptions.RecursoNaoEncontradoException;
import com.petajuda.exceptions.TokenInvalidoException;
import com.petajuda.exceptions.UsuarioNaoAutorizadoException;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.UsuarioRepository;
import com.petajuda.security.details.CustomUserDetails;
import com.petajuda.security.jwt.JwtTokenProvider;

@Service
public class AutenticacaoService {

    // Dependencias da classe
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtTokenProvider jwtTokenProvider;

    // Injecao das dependencias via construtor
    public AutenticacaoService(AuthenticationManager authenticationManager, 
                               UsuarioRepository usuarioRepository, 
                               JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // Autentica um Usuario no sistema
    public UsuarioAutenticacaoInfoResponse login(UsuarioCredenciaisRequest credenciais) {
        Authentication auth = authenticateUser(credenciais.email(), credenciais.senha());
        CustomUserDetails principal = (CustomUserDetails) auth.getPrincipal();
        
        PerfilUsuario perfilUsuario = principal.getTipoPerfil();

        return jwtTokenProvider.createToken(
                principal.getId(),
                principal.getFullName(),
                principal.getUsername(),
                perfilUsuario
        );
    }

    // Atualiza o token de um Usuario
    public UsuarioAutenticacaoInfoResponse refreshToken(String token) {
        if(token == null) throw new TokenInvalidoException("O token não pode ser nulo");
        if(!validateCurrentToken(token)) throw new TokenInvalidoException("Token inválido");
        return jwtTokenProvider.refreshToken(token);
    }

    // Metodo auxiliar que contem a logica de autenticacao
    private Authentication authenticateUser(String username, String password) {
        try {
            return authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
        } catch (DisabledException e) {
            throw new UsuarioNaoAutorizadoException("Usuário inativo");
        } catch (BadCredentialsException e) {
            throw new UsuarioNaoAutorizadoException("Usuário ou senha inválidos");
        } catch (AuthenticationException e) {
            throw new UsuarioNaoAutorizadoException("Falha na autenticação");
        }
    }

    // Metodo auxiliar para validar se um token esta valido
    private boolean validateCurrentToken(String token) {
        String tokenWithoutBearer = getCleanToken(token);
        if (!jwtTokenProvider.validateToken(tokenWithoutBearer)) return false;
        String username = jwtTokenProvider.getAuthentication(tokenWithoutBearer).getName();
        Usuario usuario = usuarioRepository.findByEmail(username).orElseThrow(
                () -> new RecursoNaoEncontradoException("Usuário não encontrado " + username)
        );
        if (!usuario.getAtivo()) throw new UsuarioNaoAutorizadoException("Usuário inativo");
        return true;
    }

    // Metodo auxiliar para limpar o `Bearer` do token
    private String getCleanToken(String token) {
        if(!token.contains("Bearer ")) throw new TokenInvalidoException("Token inválido");
        return token.substring("Bearer ".length());
    }
}