package com.petajuda.unittests.security.jwt;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

import com.petajuda.security.jwt.JwtTokenFilter;
import com.petajuda.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import jakarta.servlet.ServletException;

@ExtendWith(MockitoExtension.class)
class JwtTokenFilterTest {

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private JwtTokenFilter filter;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private MockFilterChain filterChain;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = new MockFilterChain();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("doFilter: Deve autenticar o usuario no SecurityContext quando o token for valido")
    void deveAutenticarUsuarioQuandoTokenForValido() throws IOException, ServletException {
        String token = "valid_jwt_token";
        request.addHeader("Authorization", "Bearer " + token);

        when(tokenProvider.validateToken(token)).thenReturn(true);
        when(tokenProvider.getAuthentication(token)).thenReturn(authentication);

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isEqualTo(authentication);
        verify(tokenProvider).validateToken(token);
        verify(tokenProvider).getAuthentication(token);
    }

    @Test
    @DisplayName("doFilter: Nao deve autenticar no SecurityContext quando o header Authorization for nulo ou invalido")
    void naoDeveAutenticarQuandoSemHeader() throws IOException, ServletException {
        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(tokenProvider, never()).validateToken("");
    }

    @Test
    @DisplayName("doFilter: Deve capturar UsernameNotFoundException e retornar HTTP 401 Unauthorized em JSON")
    void deveTratarUsernameNotFoundExceptionERetornar401() throws IOException, ServletException {
        String token = "token_usuario_inexistente";
        request.addHeader("Authorization", "Bearer " + token);

        when(tokenProvider.validateToken(token)).thenReturn(true);
        when(tokenProvider.getAuthentication(token)).thenThrow(new UsernameNotFoundException("Usuário não encontrado"));

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentType()).contains("application/json");
        assertThat(response.getContentAsString()).contains("Usuário não encontrado");
    }
}