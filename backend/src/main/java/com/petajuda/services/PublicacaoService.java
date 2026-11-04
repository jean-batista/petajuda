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

    // Dependencias da classe
    private final PublicacaoRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final AnimalRepository animalRepository;
    private final PublicacaoMapper mapper;
    private final EnderecoMapper enderecoMapper;

    // Injeção das dependências via construtor
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

    // Salva uma publicacao
    @Transactional
    public PublicacaoResponse salvar(UUID usuarioLogadoId, PublicacaoRequest request) {

        // Verifica se o Usuario existe
        Usuario usuario = usuarioRepository.findById(usuarioLogadoId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Usuário não encontrado.")
        );

        // Verifica se o Animal existe
        Animal animal = animalRepository.findById(request.animalId()).orElseThrow(
            () -> new RecursoNaoEncontradoException("Animal não encontrado.")
        );

        // Verifica se o Animal esta cadastrado no perfil utilizado para criar a publicacao
        if (!animal.getUsuario().getId().equals(usuarioLogadoId)) {
            throw new UsuarioNaoAutorizadoException("Você só pode criar publicações para animais cadastrados no seu perfil.");
        }

        Publicacao entidade = mapper.paraEntidade(request);
        entidade.setUsuario(usuario);
        entidade.setAnimal(animal);
        entidade.setStatus(StatusPublicacao.ATIVO);
        
        return mapper.paraDto(repository.save(entidade));
    }

    // Busca uma Publicacao pelo id
    @Transactional(readOnly = true)
    public PublicacaoResponse buscarPorId(UUID id) {
        
        // Verifica se a Publicacao existe
        Publicacao publicacao = repository.findById(id).orElseThrow(
            () -> new RecursoNaoEncontradoException("Publicação não encontrada.")
        );
        return mapper.paraDto(publicacao);
    }

    // Busca todas as Publicacoes
    @Transactional(readOnly = true)
    public List<PublicacaoResponse> buscarTodas() {
        return repository.findAll().stream().map(mapper::paraDto).toList();
    }

    // Atualiza uma Publicacao
    @Transactional
    public PublicacaoResponse atualizar(UUID usuarioLogadoId, UUID publicacaoId, PublicacaoRequest request) {

        // Verifica se a Publicacao existe
        Publicacao entidade = repository.findById(publicacaoId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Publicação não encontrada.")
        );

        validarPosse(entidade, usuarioLogadoId);
        atualizarDados(entidade, request);

        return mapper.paraDto(repository.save(entidade));
    }

    // Altera o status da Publicacao
    @Transactional
    public PublicacaoResponse alterarStatus(UUID usuarioLogadoId, UUID publicacaoId, StatusPublicacao novoStatus) {

        // Verifica se a Publicacao existe
        Publicacao entidade = repository.findById(publicacaoId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Publicação não encontrada.")
        );

        validarPosse(entidade, usuarioLogadoId);
        
        entidade.setStatus(novoStatus); // Ex: Altera de ATIVO para RESOLVIDO
        return mapper.paraDto(repository.save(entidade));
    }

    // Excluir uma Publicacao
    @Transactional
    public void excluir(UUID usuarioLogadoId, UUID publicacaoId) {

        // verifica se a Publicacao existe
        Publicacao entidade = repository.findById(publicacaoId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Publicação não encontrada.")
        );

        validarPosse(entidade, usuarioLogadoId);
        repository.delete(entidade);
    }

    // Metodo auxiliar para validar a posse de uma Publicacao
    private void validarPosse(Publicacao publicacao, UUID usuarioLogadoId) {

        // Verifica se o Usuario possui permissao para modificar a Publicacao
        if (!publicacao.getUsuario().getId().equals(usuarioLogadoId)) {
            throw new UsuarioNaoAutorizadoException("Você não tem permissão para modificar esta publicação.");
        }
    }

    // Metodo auxiliar para atualizar os dados da Publicacao
    private void atualizarDados(Publicacao entidade, PublicacaoRequest request) {
        if (request.titulo() != null) entidade.setTitulo(request.titulo());
        if (request.descricao() != null) entidade.setDescricao(request.descricao());
        if (request.tipo() != null) entidade.setTipo(request.tipo());
        if (request.endereco() != null) entidade.setEndereco(enderecoMapper.paraEntidade(request.endereco()));
    }
}