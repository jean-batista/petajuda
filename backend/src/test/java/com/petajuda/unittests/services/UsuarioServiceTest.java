package com.petajuda.unittests.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.AtualizarEmailUsuarioRequest;
import com.petajuda.dtos.request.AtualizarPerfilUsuarioRequest;
import com.petajuda.dtos.request.AtualizarSenhaUsuarioRequest;
import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.dtos.response.UsuarioAutenticacaoInfoResponse;
import com.petajuda.dtos.response.UsuarioInfoResponse;
import com.petajuda.enums.PerfilUsuario;
import com.petajuda.exceptions.EmailInvalidoException;
import com.petajuda.exceptions.EmailJaExistenteException;
import com.petajuda.exceptions.RecursoNaoEncontradoException;
import com.petajuda.exceptions.RegraDeNegocioException;
import com.petajuda.exceptions.SenhaInvalidaException;
import com.petajuda.exceptions.UsuarioInativoException;
import com.petajuda.mappers.EnderecoMapper;
import com.petajuda.mappers.UsuarioMapper;
import com.petajuda.model.Endereco;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.UsuarioRepository;
import com.petajuda.security.jwt.JwtTokenProvider;
import com.petajuda.services.UsuarioService;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository repositorio;

    @Mock
    private UsuarioMapper mapper;

    @Mock
    private EnderecoMapper enderecoMapper;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuario;
    private EnderecoDto enderecoDto;
    private UsuarioInfoRequest usuarioInfoRequest;
    private UsuarioInfoResponse usuarioInfoResponse;
    private UUID usuarioId;

    @BeforeEach
    void setUp() {
        usuarioId = UUID.randomUUID();
        LocalDate nascimentoPadrao = LocalDate.of(1995, 5, 15);

        Endereco endereco = new Endereco("SC", "Tubarão", "Centro", "Rua XV de Novembro", "Apto 101");
        enderecoDto = new EnderecoDto("SC", "Tubarão", "Centro", "Rua XV de Novembro", "Apto 101");

        usuario = new Usuario();
        usuario.setId(usuarioId);
        usuario.setNome("João");
        usuario.setSobrenome("Silva");
        usuario.setEmail("joao@email.com");
        usuario.setTelefone("48999999999");
        usuario.setNascimento(nascimentoPadrao);
        usuario.setEndereco(endereco);
        usuario.setSenha("senhaCodificada123");
        usuario.setAtivo(true);
        usuario.setTipoPerfil(PerfilUsuario.USUARIO_COMUM);
        usuario.setDataCriacao(LocalDateTime.now());

        // Ordem do record: nome, sobrenome, telefone, nascimento, email, senha, endereco
        usuarioInfoRequest = new UsuarioInfoRequest(
                "João", "Silva", "48999999999", nascimentoPadrao, "joao@email.com", "senha123", enderecoDto
        );

        // Ordem do record: id, nomeCompleto, email, telefone, nascimento, tipoPerfil, endereco, dataCriacao, ativo
        usuarioInfoResponse = new UsuarioInfoResponse(
                usuarioId, "João Silva", "joao@email.com", "48999999999", nascimentoPadrao,
                PerfilUsuario.USUARIO_COMUM, enderecoDto, LocalDateTime.now(), true
        );
    }

    // =========================================================================
    // SALVAR
    // =========================================================================

    @Test
    @DisplayName("Salvar: Deve salvar novo usuário com sucesso se email e telefone forem únicos")
    void deveSalvarNovoUsuarioComSucesso() {
        when(repositorio.existsByEmail(usuarioInfoRequest.email())).thenReturn(false);
        when(repositorio.existsByTelefone(usuarioInfoRequest.telefone())).thenReturn(false);

        when(mapper.paraEntidade(usuarioInfoRequest)).thenReturn(usuario);
        when(passwordEncoder.encode(usuario.getSenha())).thenReturn("senhaCodificada123");
        when(repositorio.save(usuario)).thenReturn(usuario);
        when(mapper.paraUsuarioInfo(usuario)).thenReturn(usuarioInfoResponse);

        UsuarioInfoResponse response = usuarioService.salvar(usuarioInfoRequest);

        assertThat(response).isNotNull();
        assertThat(response.email()).isEqualTo("joao@email.com");
        assertThat(response.nascimento()).isEqualTo(LocalDate.of(1995, 5, 15));
        assertThat(response.endereco().cidade()).isEqualTo("Tubarão");
        assertThat(usuario.getAtivo()).isTrue();
        assertThat(usuario.getTipoPerfil()).isEqualTo(PerfilUsuario.USUARIO_COMUM);
        verify(repositorio).save(usuario);
    }

    @Test
    @DisplayName("Salvar: Deve lançar EmailJaExistenteException se email já estiver em uso")
    void deveLancarExcecaoSeEmailJaExistirAoSalvar() {
        when(repositorio.existsByEmail(usuarioInfoRequest.email())).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.salvar(usuarioInfoRequest))
                .isInstanceOf(EmailJaExistenteException.class)
                .hasMessageContaining("E-mail já utilizado");

        verify(repositorio, never()).save(any());
    }

    @Test
    @DisplayName("Salvar: Deve lançar RegraDeNegocioException se telefone já estiver em uso")
    void deveLancarExcecaoSeTelefoneJaExistirAoSalvar() {
        when(repositorio.existsByEmail(usuarioInfoRequest.email())).thenReturn(false);
        when(repositorio.existsByTelefone(usuarioInfoRequest.telefone())).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.salvar(usuarioInfoRequest))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("Este número de telefone já está associado a outra conta");

        verify(repositorio, never()).save(any());
    }

    // =========================================================================
    // BUSCAR
    // =========================================================================

    @Test
    @DisplayName("BuscarPorId: Deve retornar usuário com sucesso")
    void deveBuscarPorIdComSucesso() {
        when(repositorio.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(mapper.paraUsuarioInfo(usuario)).thenReturn(usuarioInfoResponse);

        UsuarioInfoResponse response = usuarioService.buscarPorId(usuarioId);

        assertThat(response).isNotNull();
        verify(repositorio).findById(usuarioId);
    }

    @Test
    @DisplayName("BuscarPorId: Deve lançar RecursoNaoEncontradoException se não encontrar")
    void deveLancarExcecaoSeUsuarioNaoExistirAoBuscarPorId() {
        when(repositorio.findById(usuarioId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.buscarPorId(usuarioId))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    // =========================================================================
    // ATUALIZAR PERFIL
    // =========================================================================

    @Test
    @DisplayName("AtualizarPerfil: Deve atualizar dados básicos, nascimento e endereço se dados válidos")
    void deveAtualizarPerfilComSucesso() {
        LocalDate novoNascimento = LocalDate.of(1996, 8, 22);
        EnderecoDto novoEnderecoDto = new EnderecoDto("SC", "Laguna", "Magalhães", "Rua das Flores", "Casa 2");
        Endereco novoEndereco = new Endereco("SC", "Laguna", "Magalhães", "Rua das Flores", "Casa 2");

        AtualizarPerfilUsuarioRequest request = new AtualizarPerfilUsuarioRequest(
                "Carlos", "Silva", "48888888888", novoNascimento, novoEnderecoDto
        );

        when(repositorio.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(repositorio.existsByTelefone(request.telefone())).thenReturn(false); // Telefone novo está livre
        lenient().when(enderecoMapper.paraEntidade(novoEnderecoDto)).thenReturn(novoEndereco);
        when(repositorio.save(usuario)).thenReturn(usuario);

        // Simula o mapper retornando o DTO com os dados alterados
        UsuarioInfoResponse responseMock = new UsuarioInfoResponse(
                usuarioId, "Carlos Silva", "joao@email.com", "48888888888", novoNascimento,
                PerfilUsuario.USUARIO_COMUM, novoEnderecoDto, LocalDateTime.now(), true
        );
        when(mapper.paraUsuarioInfo(usuario)).thenReturn(responseMock);

        UsuarioInfoResponse response = usuarioService.atualizar(usuarioId, request);

        assertThat(response).isNotNull();
        assertThat(usuario.getNome()).isEqualTo("Carlos");
        assertThat(usuario.getTelefone()).isEqualTo("48888888888");
        assertThat(usuario.getNascimento()).isEqualTo(novoNascimento);
        assertThat(usuario.getEndereco()).isNotNull();
        verify(repositorio).save(usuario);
    }

    @Test
    @DisplayName("AtualizarPerfil: Deve lançar RegraDeNegocioException se novo telefone já pertencer a outro usuário")
    void deveLancarExcecaoSeNovoTelefoneEstiverEmUso() {
        AtualizarPerfilUsuarioRequest request = new AtualizarPerfilUsuarioRequest(
                "João", "Silva", "48888888888", LocalDate.of(1995, 5, 15), enderecoDto
        ); // Telefone diferente do atual

        when(repositorio.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(repositorio.existsByTelefone(request.telefone())).thenReturn(true); // Ocupado

        assertThatThrownBy(() -> usuarioService.atualizar(usuarioId, request))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("número de telefone já está em uso");

        verify(repositorio, never()).save(any());
    }

    // =========================================================================
    // ATUALIZAR SENHA
    // =========================================================================

    @Test
    @DisplayName("AtualizarSenha: Deve atualizar a senha com sucesso")
    void deveAtualizarSenhaComSucesso() {
        AtualizarSenhaUsuarioRequest request = new AtualizarSenhaUsuarioRequest("senhaAntiga123", "novaSenha123");

        when(repositorio.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(request.senhaAntiga(), usuario.getSenha())).thenReturn(true);
        when(passwordEncoder.matches(request.senhaNova(), usuario.getSenha())).thenReturn(false);
        when(passwordEncoder.encode(request.senhaNova())).thenReturn("novaSenhaCodificada");

        usuarioService.atualizarSenha(usuarioId, request);

        assertThat(usuario.getSenha()).isEqualTo("novaSenhaCodificada");
        verify(repositorio).save(usuario);
    }

    @Test
    @DisplayName("AtualizarSenha: Deve lançar SenhaInvalidaException se a senha antiga não bater")
    void deveLancarExcecaoSeSenhaAntigaIncorreta() {
        AtualizarSenhaUsuarioRequest request = new AtualizarSenhaUsuarioRequest("senhaErrada", "novaSenha123");

        when(repositorio.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(request.senhaAntiga(), usuario.getSenha())).thenReturn(false);

        assertThatThrownBy(() -> usuarioService.atualizarSenha(usuarioId, request))
                .isInstanceOf(SenhaInvalidaException.class)
                .hasMessageContaining("senha atual está incorreta");

        verify(repositorio, never()).save(any());
    }

    // =========================================================================
    // ATUALIZAR E-MAIL
    // =========================================================================

    @Test
    @DisplayName("AtualizarEmail: Deve atualizar e-mail e gerar novo token JWT")
    void deveAtualizarEmailEGerarNovoToken() {
        AtualizarEmailUsuarioRequest request = new AtualizarEmailUsuarioRequest("novoemail@email.com");

        when(repositorio.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(repositorio.findByEmail(request.email())).thenReturn(Optional.empty()); // E-mail está livre

        UsuarioAutenticacaoInfoResponse tokenResponse = new UsuarioAutenticacaoInfoResponse(
                usuarioId, "João Silva", "novoemail@email.com", PerfilUsuario.USUARIO_COMUM, "novo_token_jwt"
        );
        when(jwtTokenProvider.createToken(any(), any(), any(), any())).thenReturn(tokenResponse);

        UsuarioAutenticacaoInfoResponse response = usuarioService.atualizarEmail(usuarioId, request);

        assertThat(usuario.getEmail()).isEqualTo("novoemail@email.com");
        assertThat(response.token()).isEqualTo("novo_token_jwt");
        verify(repositorio).save(usuario);
    }

    @Test
    @DisplayName("AtualizarEmail: Deve lançar EmailInvalidoException se alterar para o mesmo e-mail")
    void deveLancarExcecaoAoAlterarParaOMesmoEmail() {
        AtualizarEmailUsuarioRequest request = new AtualizarEmailUsuarioRequest("joao@email.com"); // E-mail igual ao atual

        when(repositorio.findById(usuarioId)).thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> usuarioService.atualizarEmail(usuarioId, request))
                .isInstanceOf(EmailInvalidoException.class)
                .hasMessageContaining("Não é possível alterar para o mesmo e-mail");

        verify(repositorio, never()).save(any());
    }

    // =========================================================================
    // DESATIVAR / REATIVAR (ADMIN)
    // =========================================================================

    @Test
    @DisplayName("Desativar: Deve inativar usuário ativo com sucesso")
    void deveDesativarUsuarioComSucesso() {
        when(repositorio.findById(usuarioId)).thenReturn(Optional.of(usuario));

        usuarioService.desativar(usuarioId);

        assertThat(usuario.getAtivo()).isFalse();
        verify(repositorio).save(usuario);
    }

    @Test
    @DisplayName("Desativar: Deve lançar UsuarioInativoException se o usuário já estiver inativo")
    void deveLancarExcecaoAoDesativarUsuarioJaInativo() {
        usuario.setAtivo(false);
        when(repositorio.findById(usuarioId)).thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> usuarioService.desativar(usuarioId))
                .isInstanceOf(UsuarioInativoException.class);
    }

    @Test
    @DisplayName("Reativar: Deve reativar usuário inativo com sucesso")
    void deveReativarUsuarioComSucesso() {
        usuario.setAtivo(false);
        when(repositorio.findById(usuarioId)).thenReturn(Optional.of(usuario));

        usuarioService.reativar(usuarioId);

        assertThat(usuario.getAtivo()).isTrue();
        verify(repositorio).save(usuario);
    }
}