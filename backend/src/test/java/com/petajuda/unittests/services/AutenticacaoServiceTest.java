package com.petajuda.unittests.services;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;

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
import com.petajuda.services.AutenticacaoService;

@ExtendWith(MockitoExtension.class)
class AutenticacaoServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AutenticacaoService autenticacaoService;

    private UsuarioCredenciaisRequest credenciais;
    private UsuarioAutenticacaoInfoResponse tokenResponse;
    private Usuario usuarioAtivo;
    private CustomUserDetails customUserDetails;

    @BeforeEach
    void setUp() {
        UUID usuarioId = UUID.randomUUID();
        credenciais = new UsuarioCredenciaisRequest("joao@email.com", "senha123");

        usuarioAtivo = new Usuario();
        usuarioAtivo.setId(usuarioId);
        usuarioAtivo.setNome("João");
        usuarioAtivo.setSobrenome("Silva");
        usuarioAtivo.setEmail("joao@email.com");
        usuarioAtivo.setSenha("senha123");
        usuarioAtivo.setAtivo(true);
        usuarioAtivo.setTipoPerfil(PerfilUsuario.USUARIO_COMUM);

        customUserDetails = new CustomUserDetails(usuarioAtivo);

        tokenResponse = new UsuarioAutenticacaoInfoResponse(
                usuarioId, "João Silva", "joao@email.com", PerfilUsuario.USUARIO_COMUM, "valid_jwt_token"
        );
    }

    // =========================================================================
    // LOGIN
    // =========================================================================

    @Test
    @DisplayName("Login: Deve autenticar o usuário e retornar o token JWT com sucesso")
    void deveFazerLoginComSucesso() {
        Authentication authMock = mock(Authentication.class);
        
        when(authenticationManager.authenticate(any())).thenReturn(authMock);
        when(authMock.getPrincipal()).thenReturn(customUserDetails);
        when(jwtTokenProvider.createToken(
                customUserDetails.getId(),
                customUserDetails.getFullName(),
                customUserDetails.getUsername(),
                customUserDetails.getTipoPerfil()
        )).thenReturn(tokenResponse);

        UsuarioAutenticacaoInfoResponse response = autenticacaoService.login(credenciais);

        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo("valid_jwt_token");
        verify(authenticationManager).authenticate(any());
        verify(jwtTokenProvider).createToken(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Login: Deve lançar exceção se o usuário estiver inativo (DisabledException)")
    void deveLancarExcecaoAoLogarUsuarioInativo() {
        when(authenticationManager.authenticate(any())).thenThrow(new DisabledException("Inativo"));

        assertThatThrownBy(() -> autenticacaoService.login(credenciais))
                .isInstanceOf(UsuarioNaoAutorizadoException.class)
                .hasMessageContaining("Usuário inativo");
    }

    @Test
    @DisplayName("Login: Deve lançar exceção para credenciais inválidas (BadCredentialsException)")
    void deveLancarExcecaoAoLogarComCredenciaisInvalidas() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Inválido"));

        assertThatThrownBy(() -> autenticacaoService.login(credenciais))
                .isInstanceOf(UsuarioNaoAutorizadoException.class)
                .hasMessageContaining("Usuário ou senha inválidos");
    }

    @Test
    @DisplayName("Login: Deve lançar exceção para falha genérica de autenticação (AuthenticationException)")
    void deveLancarExcecaoGenericaDeAutenticacao() {
        when(authenticationManager.authenticate(any())).thenThrow(new AuthenticationException("Falha") {});

        assertThatThrownBy(() -> autenticacaoService.login(credenciais))
                .isInstanceOf(UsuarioNaoAutorizadoException.class)
                .hasMessageContaining("Falha na autenticação");
    }

    // =========================================================================
    // REFRESH TOKEN
    // =========================================================================

    @Test
    @DisplayName("RefreshToken: Deve renovar o token com sucesso quando o token for válido e o usuário ativo")
    void deveRenovarTokenComSucesso() {
        String tokenComBearer = "Bearer valid_jwt_token";
        String tokenSemBearer = "valid_jwt_token";
        Authentication authMock = mock(Authentication.class);

        when(jwtTokenProvider.validateToken(tokenSemBearer)).thenReturn(true);
        when(jwtTokenProvider.getAuthentication(tokenSemBearer)).thenReturn(authMock);
        when(authMock.getName()).thenReturn("joao@email.com");
        when(usuarioRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(usuarioAtivo));
        when(jwtTokenProvider.refreshToken(tokenComBearer)).thenReturn(tokenResponse);

        UsuarioAutenticacaoInfoResponse response = autenticacaoService.refreshToken(tokenComBearer);

        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo("valid_jwt_token");
        verify(jwtTokenProvider).refreshToken(tokenComBearer);
    }

    @Test
    @DisplayName("RefreshToken: Deve lançar exceção se o token for nulo")
    void deveLancarExcecaoSeTokenNulo() {
        assertThatThrownBy(() -> autenticacaoService.refreshToken(null))
                .isInstanceOf(TokenInvalidoException.class)
                .hasMessageContaining("O token não pode ser nulo");
    }

    @Test
    @DisplayName("RefreshToken: Deve lançar exceção se o token não possuir o prefixo Bearer")
    void deveLancarExcecaoSeTokenSemBearer() {
        assertThatThrownBy(() -> autenticacaoService.refreshToken("token_sem_bearer"))
                .isInstanceOf(TokenInvalidoException.class)
                .hasMessageContaining("Token inválido");
    }

    @Test
    @DisplayName("RefreshToken: Deve lançar exceção se a validação do token falhar")
    void deveLancarExcecaoSeTokenInvalidoPeloProvider() {
        String tokenComBearer = "Bearer token_invalido";
        String tokenSemBearer = "token_invalido";

        when(jwtTokenProvider.validateToken(tokenSemBearer)).thenReturn(false);

        assertThatThrownBy(() -> autenticacaoService.refreshToken(tokenComBearer))
                .isInstanceOf(TokenInvalidoException.class)
                .hasMessageContaining("Token inválido");
    }

    @Test
    @DisplayName("RefreshToken: Deve lançar exceção se o usuário extraído do token não existir mais no banco")
    void deveLancarExcecaoSeUsuarioNaoExistirAoRenovar() {
        String tokenComBearer = "Bearer valid_jwt_token";
        String tokenSemBearer = "valid_jwt_token";
        Authentication authMock = mock(Authentication.class);

        when(jwtTokenProvider.validateToken(tokenSemBearer)).thenReturn(true);
        when(jwtTokenProvider.getAuthentication(tokenSemBearer)).thenReturn(authMock);
        when(authMock.getName()).thenReturn("fantasma@email.com");
        when(usuarioRepository.findByEmail("fantasma@email.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> autenticacaoService.refreshToken(tokenComBearer))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining("Usuário não encontrado fantasma@email.com");
    }

    @Test
    @DisplayName("RefreshToken: Deve lançar exceção se o usuário estiver inativo na hora de renovar")
    void deveLancarExcecaoSeUsuarioInativoAoRenovar() {
        String tokenComBearer = "Bearer valid_jwt_token";
        String tokenSemBearer = "valid_jwt_token";
        Authentication authMock = mock(Authentication.class);

        usuarioAtivo.setAtivo(false); // Inativa o usuário

        when(jwtTokenProvider.validateToken(tokenSemBearer)).thenReturn(true);
        when(jwtTokenProvider.getAuthentication(tokenSemBearer)).thenReturn(authMock);
        when(authMock.getName()).thenReturn("joao@email.com");
        when(usuarioRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(usuarioAtivo));

        assertThatThrownBy(() -> autenticacaoService.refreshToken(tokenComBearer))
                .isInstanceOf(UsuarioNaoAutorizadoException.class)
                .hasMessageContaining("Usuário inativo");
    }
}