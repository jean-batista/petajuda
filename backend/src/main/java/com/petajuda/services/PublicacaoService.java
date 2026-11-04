package com.petajuda.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.petajuda.dtos.request.PublicacaoRequest;
import com.petajuda.dtos.response.PublicacaoResponse;
import com.petajuda.enums.StatusPublicacao;
import com.petajuda.exceptions.RecursoNaoEncontradoException;
import com.petajuda.exceptions.UsuarioNaoAutorizadoException;
import com.petajuda.mappers.EnderecoMapper;
import com.petajuda.mappers.PublicacaoMapper;
import com.petajuda.model.Animal;
import com.petajuda.model.Publicacao;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.AnimalRepository;
import com.petajuda.repositories.PublicacaoRepository;
import com.petajuda.repositories.UsuarioRepository;

@Service
public class PublicacaoService {

    private final PublicacaoRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final AnimalRepository animalRepository;
    private final PublicacaoMapper mapper;
    private final EnderecoMapper enderecoMapper;

    // Injeção de dependências via construtor (Boa prática do Spring)
    public PublicacaoService(PublicacaoRepository repository, 
                             UsuarioRepository usuarioRepository, 
                             AnimalRepository animalRepository, 
                             PublicacaoMapper mapper,
                             EnderecoMapper enderecoMapper) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.animalRepository = animalRepository;
        this.mapper = mapper;
        this.enderecoMapper = enderecoMapper;
    }

    @Transactional
    public PublicacaoResponse salvar(UUID usuarioLogadoId, PublicacaoRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioLogadoId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Usuário não encontrado.")
        );

        Animal animal = animalRepository.findById(request.animalId()).orElseThrow(
            () -> new RecursoNaoEncontradoException("Animal não encontrado.")
        );

        if (!animal.getUsuario().getId().equals(usuarioLogadoId)) {
            throw new UsuarioNaoAutorizadoException("Você só pode criar publicações para animais cadastrados no seu perfil.");
        }

        Publicacao entidade = mapper.paraEntidade(request);
        entidade.setUsuario(usuario);
        entidade.setAnimal(animal);
        entidade.setStatus(StatusPublicacao.ATIVO);
        
        return mapper.paraDto(repository.save(entidade));
    }

    @Transactional(readOnly = true)
    public PublicacaoResponse buscarPorId(UUID id) {
        Publicacao publicacao = repository.findById(id).orElseThrow(
            () -> new RecursoNaoEncontradoException("Publicação não encontrada.")
        );
        return mapper.paraDto(publicacao);
    }

    @Transactional(readOnly = true)
    public List<PublicacaoResponse> buscarTodas() {
        return repository.findAll().stream().map(mapper::paraDto).toList();
    }

    @Transactional
    public PublicacaoResponse atualizar(UUID usuarioLogadoId, UUID publicacaoId, PublicacaoRequest request) {
        Publicacao entidade = repository.findById(publicacaoId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Publicação não encontrada.")
        );

        validarPosse(entidade, usuarioLogadoId);
        atualizarDados(entidade, request);

        return mapper.paraDto(repository.save(entidade));
    }

    @Transactional
    public PublicacaoResponse alterarStatus(UUID usuarioLogadoId, UUID publicacaoId, StatusPublicacao novoStatus) {
        Publicacao entidade = repository.findById(publicacaoId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Publicação não encontrada.")
        );

        validarPosse(entidade, usuarioLogadoId);
        
        entidade.setStatus(novoStatus); // Ex: Altera de ATIVO para RESOLVIDO
        return mapper.paraDto(repository.save(entidade));
    }

    @Transactional
    public void excluir(UUID usuarioLogadoId, UUID publicacaoId) {
        Publicacao entidade = repository.findById(publicacaoId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Publicação não encontrada.")
        );

        validarPosse(entidade, usuarioLogadoId);
        repository.delete(entidade);
    }

    private void validarPosse(Publicacao publicacao, UUID usuarioLogadoId) {
        if (!publicacao.getUsuario().getId().equals(usuarioLogadoId)) {
            throw new UsuarioNaoAutorizadoException("Você não tem permissão para modificar esta publicação.");
        }
    }

    private void atualizarDados(Publicacao entidade, PublicacaoRequest request) {
        if (request.titulo() != null) entidade.setTitulo(request.titulo());
        if (request.descricao() != null) entidade.setDescricao(request.descricao());
        if (request.tipo() != null) entidade.setTipo(request.tipo());
        if (request.endereco() != null) entidade.setEndereco(enderecoMapper.paraEntidade(request.endereco()));
    }
}