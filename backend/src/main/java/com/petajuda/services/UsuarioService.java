package com.petajuda.services;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
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
import com.petajuda.exceptions.SenhaInvalidaException;
import com.petajuda.exceptions.UsuarioInativoException;
import com.petajuda.mappers.UsuarioMapper;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.UsuarioRepository;
import com.petajuda.security.jwt.JwtTokenProvider;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repositorio;

    @Autowired
    private UsuarioMapper mapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioInfoResponse salvar(UsuarioInfoRequest usuarioInfoRequest) {
        Optional<Usuario> optional = repositorio.findByEmail(usuarioInfoRequest.email());
        if(optional.isPresent()) {
            throw new EmailJaExistenteException("Email já utilizado, por favor utilize um email válido");
        }
        Usuario entidade = mapper.paraEntidade(usuarioInfoRequest);
        entidade.setSenha(passwordEncoder.encode(entidade.getSenha()));
        entidade.setAtivo(true);
        entidade.setDataCriacao(LocalDateTime.now());
        entidade.setTipoPerfil(PerfilUsuario.USUARIO_COMUN);
        return mapper.paraUsuarioInfo(repositorio.save(entidade));
    }

    public UsuarioInfoResponse buscarPorId(UUID id) {
        Usuario entidade = repositorio.findById(id).orElseThrow(
            () -> new RecursoNaoEncontradoException("Usuário não encontrado com o id " + id)
        );
        return mapper.paraUsuarioInfo(entidade);
    }

    public UsuarioInfoResponse buscarPorEmail(String email) {
        Usuario entity = repositorio.findByEmail(email).orElseThrow(
            () -> new RecursoNaoEncontradoException("Usuário não encontrado com o email " + email)
        );
        return mapper.paraUsuarioInfo(entity);
    }

    public Page<UsuarioInfoResponse> buscarTodos(Boolean ativo, Pageable pageable) {
        Page<Usuario> page = null;

        if (ativo == null) page = repositorio.findAll(pageable);
        if(ativo != null) page = repositorio.findAllByAtivo(ativo, pageable);

        return page.map(mapper::paraUsuarioInfo);
    }

    @Transactional
    public UsuarioInfoResponse atualizar(UUID id, AtualizarPerfilUsuarioRequest atualizarPerfilUsuarioRequest) {
        Usuario entidade = buscarUsuarioAtivoPorId(id);
        atualizar(entidade, atualizarPerfilUsuarioRequest);
        return mapper.paraUsuarioInfo(repositorio.save(entidade));
    }

    @Transactional
    public void atualizarSenha(UUID id, AtualizarSenhaUsuarioRequest atualizarSenhaUsuarioRequest) {
        Usuario entidade = buscarUsuarioAtivoPorId(id);

        if (!passwordEncoder.matches(atualizarSenhaUsuarioRequest.senhaAntiga(), entidade.getSenha())) {
            throw new SenhaInvalidaException("A senha atual está incorreta");
        }

        if (passwordEncoder.matches(atualizarSenhaUsuarioRequest.senhaNova(), entidade.getSenha())) {
            throw new SenhaInvalidaException("A nova senha não pode ser igual à senha atual");
        }

        entidade.setSenha(passwordEncoder.encode(atualizarSenhaUsuarioRequest.senhaNova()));
        repositorio.save(entidade);
    }

    @Transactional
    public UsuarioAutenticacaoInfoResponse atualizarEmail(UUID id, AtualizarEmailUsuarioRequest atualizarEmailUsuarioRequest) {
        Usuario entidade = buscarUsuarioAtivoPorId(id);

        if(entidade.getEmail().equals(atualizarEmailUsuarioRequest.email())) {
            throw new EmailInvalidoException("Não é possível alterar para o mesmo email");
        }

        Optional<Usuario> optional = repositorio.findByEmail(atualizarEmailUsuarioRequest.email());

        if(optional.isPresent()) {
            throw new EmailInvalidoException("Email já utilizado, por favor utilize um email válido");
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

    @Transactional
    public void desativar(UUID id) {
        Usuario entidade = repositorio.findById(id).orElseThrow(
                () -> new RecursoNaoEncontradoException("Usuário não encontrado com o id " + id)
        );

        if(!entidade.getAtivo()) throw new UsuarioInativoException("Usuário já desativado");

        entidade.setAtivo(false);
        repositorio.save(entidade);
    }

    @Transactional
    public void reativar(UUID id) {
        Usuario entidade = repositorio.findById(id).orElseThrow(
                () -> new RecursoNaoEncontradoException("Usuário não encontrado com o id " + id)
        );

        if(entidade.getAtivo()) throw new UsuarioInativoException("Usuário já ativo");

        entidade.setAtivo(true);
        repositorio.save(entidade);
    }

    private void atualizar(Usuario entidade, AtualizarPerfilUsuarioRequest dto) {
        entidade.setNome(dto.nome());
        entidade.setSobrenome(dto.sobrenome());
        entidade.setTelefone(dto.telefone());
    }

    private Usuario buscarUsuarioAtivoPorId(UUID id) {
        Usuario entidade = repositorio.findById(id).orElseThrow(
                () -> new RecursoNaoEncontradoException("Usuário não encontrado com o id " + id)
        );

        if (!entidade.getAtivo()) {
            throw new UsuarioInativoException("Usuário inativo");
        }
        return entidade;
    }

}
