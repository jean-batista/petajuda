package com.petajuda.services;

import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public UsuarioAutenticacaoInfoResponse login(UsuarioCredenciaisRequest credenciais) {
        Authentication auth = authenticateUser(credenciais.email(), credenciais.senha());
        CustomUserDetails principal = (CustomUserDetails) auth.getPrincipal();
        
        // Obtém o perfil único diretamente do principal (ou do usuário)
        PerfilUsuario perfilUsuario = principal.getTipoPerfil(); // ou principal.getPerfil()

        return jwtTokenProvider.createToken(
                principal.getId(),
                principal.getFullName(),
                principal.getUsername(),
                perfilUsuario
        );
    }

    public UsuarioAutenticacaoInfoResponse refreshToken(String token) {
        if(token == null) throw new TokenInvalidoException("O token não pode ser nulo");
        if(!validateCurrentToken(token)) throw new TokenInvalidoException("Token inválido");
        return jwtTokenProvider.refreshToken(token);
    }

    private Authentication authenticateUser(String username, String password) {
        try {
            return authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
        } catch (DisabledException e) {
            // O Spring lança esta exceção se user.getActive() == false
            throw new UsuarioNaoAutorizadoException("Usuário inativo");

        } catch (BadCredentialsException e) {
            // O Spring lança esta exceção se a senha estiver errada ou o usuário não existir
            throw new UsuarioNaoAutorizadoException("Usuário ou senha inválidos");

        } catch (AuthenticationException e) {
            // Captura qualquer outro erro de segurança que possa ocorrer
            throw new UsuarioNaoAutorizadoException("Falha na autenticação");
        }
    }

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

    private String getCleanToken(String token) {
        if(!token.contains("Bearer ")) throw new TokenInvalidoException("Token inválido");
        return token.substring("Bearer ".length());
    }
}