package com.petajuda.unittests.security.details;

import com.petajuda.enums.PerfilUsuario;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.UsuarioRepository;
import com.petajuda.security.details.CustomUserDetails;
import com.petajuda.security.details.CustomUserDetailsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    @Test
    @DisplayName("loadUserByUsername: Deve retornar CustomUserDetails quando o e-mail existir no banco")
    void deveRetornarCustomUserDetailsQuandoUsuarioExistir() {
        // Arrange
        String email = "joao.silva@usuario.com";
        UUID userId = UUID.randomUUID();

        Usuario usuario = new Usuario();
        usuario.setId(userId);
        usuario.setNome("João");
        usuario.setSobrenome("Silva");
        usuario.setEmail(email);
        usuario.setSenha("senhaEncodada123");
        usuario.setAtivo(true);
        usuario.setTipoPerfil(PerfilUsuario.USUARIO_COMUM);

        when(usuarioRepository.findByEmail(email)).thenReturn(Optional.of(usuario));

        // Act
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        // Assert
        assertThat(userDetails).isNotNull();
        assertThat(userDetails).isInstanceOf(CustomUserDetails.class);

        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
        assertThat(customUserDetails.getId()).isEqualTo(userId);
        assertThat(customUserDetails.getUsername()).isEqualTo(email);
        assertThat(customUserDetails.getPassword()).isEqualTo("senhaEncodada123");
        assertThat(customUserDetails.getFullName()).isEqualTo("João Silva");
        assertThat(customUserDetails.getTipoPerfil()).isEqualTo(PerfilUsuario.USUARIO_COMUM);
        assertThat(customUserDetails.isEnabled()).isTrue();
        assertThat(customUserDetails.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_USUARIO_COMUM");

        verify(usuarioRepository).findByEmail(email);
    }

    @Test
    @DisplayName("loadUserByUsername: Deve lançar UsernameNotFoundException quando o e-mail não for encontrado")
    void deveLancarExcecaoQuandoUsuarioNaoExistir() {
        // Arrange
        String email = "naoexistente@usuario.com";
        when(usuarioRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userDetailsService.loadUserByUsername(email))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("Usuário não encontrado " + email);

        verify(usuarioRepository).findByEmail(email);
    }
}