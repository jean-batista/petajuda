package com.petajuda.unittests.security.jwt;

import com.petajuda.dtos.response.UsuarioAutenticacaoInfoResponse;
import com.petajuda.enums.PerfilUsuario;
import com.petajuda.exceptions.TokenInvalidoException;
import com.petajuda.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {

    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private JwtTokenProvider tokenProvider;

    private final String secretKey = "secret-key-para-testes-unitarios-petajuda-amurel";
    private final Long validityTimeInMilliseconds = 3600000L; // 1 hora

    @BeforeEach
    void setUp() {
        // Injeta as propriedades anotadas com @Value
        ReflectionTestUtils.setField(tokenProvider, "key", secretKey);
        ReflectionTestUtils.setField(tokenProvider, "validityTimeInMilliseconds", validityTimeInMilliseconds);

        // Executa o método @PostConstruct protegido via reflexão do Spring Test
        ReflectionTestUtils.invokeMethod(tokenProvider, "init");

        // Configura um MockHttpServletRequest para o ServletUriComponentsBuilder não estourar exceção no createToken
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    @Test
    @DisplayName("createToken: Deve gerar token JWT valido com as claims corretas")
    void deveGerarTokenValido() {
        UUID id = UUID.randomUUID();
        String nomeCompleto = "João Silva";
        String email = "joao.silva@usuario.com";
        PerfilUsuario perfil = PerfilUsuario.USUARIO_COMUM;

        UsuarioAutenticacaoInfoResponse response = tokenProvider.createToken(id, nomeCompleto, email, perfil);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(id);
        assertThat(response.nomeCompleto()).isEqualTo(nomeCompleto);
        assertThat(response.email()).isEqualTo(email);
        assertThat(response.perfil()).isEqualTo(perfil);
        assertThat(response.token()).isNotBlank();

        // Valida se o token gerado é valido
        boolean isValid = tokenProvider.validateToken(response.token());
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("validateToken: Deve retornar true para token valido e false para token invalido ou adulterado")
    void deveValidarTokenComSucessoEIdentificarInvalido() {
        UUID id = UUID.randomUUID();
        UsuarioAutenticacaoInfoResponse response = tokenProvider.createToken(id, "Maria Silva", "maria@usuario.com", PerfilUsuario.USUARIO_COMUM);

        boolean tokenValido = tokenProvider.validateToken(response.token());
        boolean tokenInvalido = tokenProvider.validateToken("token_completamente_invalido_123");

        assertThat(tokenValido).isTrue();
        assertThat(tokenInvalido).isFalse();
    }

    @Test
    @DisplayName("getAuthentication: Deve extrair o usuario do token e carregar o UserDetails")
    void deveRetornarAuthenticationApartirDoToken() {
        UUID id = UUID.randomUUID();
        String email = "carlos@usuario.com";
        UsuarioAutenticacaoInfoResponse response = tokenProvider.createToken(id, "Carlos Santos", email, PerfilUsuario.USUARIO_COMUM);

        UserDetails userDetailsMock = mock(UserDetails.class);
        when(userDetailsService.loadUserByUsername(email)).thenReturn(userDetailsMock);

        Authentication auth = tokenProvider.getAuthentication(response.token());

        assertThat(auth).isNotNull();
        assertThat(auth.getPrincipal()).isEqualTo(userDetailsMock);
        verify(userDetailsService).loadUserByUsername(email);
    }

    @Test
    @DisplayName("refreshToken: Deve renovar token valido com sucesso")
    void deveRenovarTokenComSucesso() {
        UUID id = UUID.randomUUID();
        UsuarioAutenticacaoInfoResponse response = tokenProvider.createToken(id, "Ana Souza", "ana@usuario.com", PerfilUsuario.USUARIO_COMUM);
        String bearerToken = "Bearer " + response.token();

        UsuarioAutenticacaoInfoResponse renovado = tokenProvider.refreshToken(bearerToken);

        assertThat(renovado).isNotNull();
        assertThat(renovado.id()).isEqualTo(id);
        assertThat(renovado.email()).isEqualTo("ana@usuario.com");
        assertThat(renovado.token()).isNotBlank();
    }

    @Test
    @DisplayName("refreshToken: Deve lancar TokenInvalidoException quando o header nao contiver 'Bearer '")
    void deveLancarExcecaoQuandoHeaderRefreshTokenNaoContiverBearer() {
        assertThatThrownBy(() -> tokenProvider.refreshToken("token_sem_prefixo"))
                .isInstanceOf(TokenInvalidoException.class)
                .hasMessageContaining("Token JWT inválido");
    }
}