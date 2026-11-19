package com.petajuda.services;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import com.petajuda.model.Usuario;
import com.petajuda.repositories.UsuarioRepository;
import com.petajuda.security.jwt.JwtTokenProvider;

@Service
public class UsuarioService {

    // Dependencias da classe
    private final UsuarioRepository repositorio;
    private final UsuarioMapper mapper;
    private final EnderecoMapper enderecoMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    // Injecao das dependencias via construtor
    public UsuarioService(UsuarioRepository repositorio,
                          UsuarioMapper mapper,
                          EnderecoMapper enderecoMapper,
                          JwtTokenProvider jwtTokenProvider,
                          PasswordEncoder passwordEncoder) {
        this.repositorio = repositorio;
        this.mapper = mapper;
        this.enderecoMapper = enderecoMapper;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    // Cadastra um Usuario
    @Transactional
    public UsuarioInfoResponse salvar(UsuarioInfoRequest usuarioInfoRequest) {
        // Valida se o email já existe
        if (repositorio.existsByEmail(usuarioInfoRequest.email())) {
            throw new EmailJaExistenteException("E-mail já utilizado, por favor utilize um e-mail válido.");
        }

        // Valida se o telefone já existe para evitar conflito de chave única no banco
        if (repositorio.existsByTelefone(usuarioInfoRequest.telefone())) {
            throw new RegraDeNegocioException("Este número de telefone já está associado a outra conta.");
        }

        Usuario entidade = mapper.paraEntidade(usuarioInfoRequest);

        entidade.setSenha(passwordEncoder.encode(entidade.getSenha())); // Criptografa a senha do Usuario e salva como hash
        entidade.setAtivo(true); // Define o Usuario como ativo
        entidade.setDataCriacao(LocalDateTime.now()); // Define a data de cadastro do Usuario

        // Define o perfil do Usuario
        entidade.setTipoPerfil(PerfilUsuario.USUARIO_COMUM);

        return mapper.paraUsuarioInfo(repositorio.save(entidade));
    }

    // Busca um Usuario pelo seu id
    @Transactional(readOnly = true)
    public UsuarioInfoResponse buscarPorId(UUID id) {
        Usuario entidade = repositorio.findById(id).orElseThrow(
                () -> new RecursoNaoEncontradoException("Usuário não encontrado com o id " + id)
        );
        return mapper.paraUsuarioInfo(entidade);
    }

    // Busca um Usuario pelo seu email
    @Transactional(readOnly = true)
    public UsuarioInfoResponse buscarPorEmail(String email) {
        Usuario entity = repositorio.findByEmail(email).orElseThrow(
                () -> new RecursoNaoEncontradoException("Usuário não encontrado com o email " + email)
        );
        return mapper.paraUsuarioInfo(entity);
    }

    // Busca todos os Usuarios cadastrados
    @Transactional(readOnly = true)
    public Page<UsuarioInfoResponse> buscarTodos(Boolean ativo, Pageable pageable) {
        Page<Usuario> page;

        if (ativo == null) {
            page = repositorio.findAll(pageable); // Busca todos os Usuarios independente se estao ativos ou nao
        } else {
            page = repositorio.findAllByAtivo(ativo, pageable); // Busca todos os Usuarios que estao ativos
        }

        return page.map(mapper::paraUsuarioInfo);
    }

    // Atualiza os dados basicos do Usuario
    @Transactional
    public UsuarioInfoResponse atualizar(UUID id, AtualizarPerfilUsuarioRequest atualizarPerfilUsuarioRequest) {
        Usuario entidade = buscarUsuarioAtivoPorId(id);

        // Se o telefone foi alterado, valida se já não pertence a outro usuário
        if (atualizarPerfilUsuarioRequest.telefone() != null &&
                !atualizarPerfilUsuarioRequest.telefone().equals(entidade.getTelefone())) {

            if (repositorio.existsByTelefone(atualizarPerfilUsuarioRequest.telefone())) {
                throw new RegraDeNegocioException("Este número de telefone já está em uso por outro usuário.");
            }
        }

        atualizarDadosEntidade(entidade, atualizarPerfilUsuarioRequest);
        return mapper.paraUsuarioInfo(repositorio.save(entidade));
    }

    // Atualiza a senha do Usuario
    @Transactional
    public void atualizarSenha(UUID id, AtualizarSenhaUsuarioRequest atualizarSenhaUsuarioRequest) {
        Usuario entidade = buscarUsuarioAtivoPorId(id);

        // Compara os hashes entre a senha passada e a senha salva no banco, verificando se a senha esta correta
        if (!passwordEncoder.matches(atualizarSenhaUsuarioRequest.senhaAntiga(), entidade.getSenha())) {
            throw new SenhaInvalidaException("A senha atual está incorreta.");
        }

        // Compara os hashes entre a senha passada e a senha salva no banco, verificando se nao sao iguais
        if (passwordEncoder.matches(atualizarSenhaUsuarioRequest.senhaNova(), entidade.getSenha())) {
            throw new SenhaInvalidaException("A nova senha não pode ser igual à senha atual.");
        }

        // Criptografa a nova senha
        entidade.setSenha(passwordEncoder.encode(atualizarSenhaUsuarioRequest.senhaNova()));
        repositorio.save(entidade); // Salva a nova senha no banco
    }

    // Atualiza o email do Usuario
    @Transactional
    public UsuarioAutenticacaoInfoResponse atualizarEmail(UUID id, AtualizarEmailUsuarioRequest atualizarEmailUsuarioRequest) {
        Usuario entidade = buscarUsuarioAtivoPorId(id);

        // Verifica se o novo email e igual ao email ja cadastrado
        if (entidade.getEmail().equals(atualizarEmailUsuarioRequest.email())) {
            throw new EmailInvalidoException("Não é possível alterar para o mesmo e-mail.");
        }

        // Verifica se o novo email ja esta sendo utilizado por outro Usuario
        Optional<Usuario> optional = repositorio.findByEmail(atualizarEmailUsuarioRequest.email());
        if (optional.isPresent()) {
            throw new EmailInvalidoException("E-mail já utilizado, por favor utilize um e-mail válido.");
        }

        entidade.setEmail(atualizarEmailUsuarioRequest.email());
        repositorio.save(entidade);

        return jwtTokenProvider.createToken(
                entidade.getId(),
                entidade.getNome() + " " + entidade.getSobrenome(),
                entidade.getEmail(),
                entidade.getTipoPerfil()
        );
    }

    // Desativa um Usuario
    @Transactional
    public void desativar(UUID id) {
        Usuario entidade = repositorio.findById(id).orElseThrow(
                () -> new RecursoNaoEncontradoException("Usuário não encontrado com o id " + id)
        );

        // Verifica se o Usuario ja esta desativado
        if (!entidade.getAtivo()) {
            throw new UsuarioInativoException("Usuário já se encontra desativado.");
        }

        entidade.setAtivo(false);
        repositorio.save(entidade);
    }

    // Reativa um Usuario
    @Transactional
    public void reativar(UUID id) {
        Usuario entidade = repositorio.findById(id).orElseThrow(
                () -> new RecursoNaoEncontradoException("Usuário não encontrado com o id " + id)
        );

        // Verifica se o Usuario ja esta ativo
        if (entidade.getAtivo()) {
            throw new UsuarioInativoException("Usuário já se encontra ativo.");
        }

        entidade.setAtivo(true);
        repositorio.save(entidade);
    }

    // Metodo auxiliar para atualizar os dados dos Usuarios
    private void atualizarDadosEntidade(Usuario entidade, AtualizarPerfilUsuarioRequest dto) {
        if (dto.nome() != null) entidade.setNome(dto.nome());
        if (dto.sobrenome() != null) entidade.setSobrenome(dto.sobrenome());
        if (dto.telefone() != null) entidade.setTelefone(dto.telefone());
        if (dto.nascimento() != null) entidade.setNascimento(dto.nascimento());
        if (dto.endereco() != null) entidade.setEndereco(enderecoMapper.paraEntidade(dto.endereco()));
    }

    // Metodo auxiliar para facilitar a busca de um Usuario usando o seu id
    private Usuario buscarUsuarioAtivoPorId(UUID id) {
        Usuario entidade = repositorio.findById(id).orElseThrow(
                () -> new RecursoNaoEncontradoException("Usuário não encontrado com o id " + id)
        );

        if (!entidade.getAtivo()) {
            throw new UsuarioInativoException("Usuário inativo.");
        }
        return entidade;
    }
}