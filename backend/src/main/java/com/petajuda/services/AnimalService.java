package com.petajuda.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.petajuda.dtos.request.AnimalRequest;
import com.petajuda.dtos.response.AnimalResponse;
import com.petajuda.exceptions.RecursoNaoEncontradoException;
import com.petajuda.exceptions.AnimalNaoEcontradoException;
import com.petajuda.exceptions.UsuarioNaoAutorizadoException;
import com.petajuda.mappers.AnimalMapper;
import com.petajuda.model.Animal;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.AnimalRepository;
import com.petajuda.repositories.UsuarioRepository;

@Service 
public class AnimalService {

    private final AnimalRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final AnimalMapper mapper;

    public AnimalService(AnimalRepository repository, UsuarioRepository usuarioRepository, AnimalMapper mapper) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.mapper = mapper;
    }

    @Transactional
    public AnimalResponse salvar(UUID usuarioId, AnimalRequest animalDto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário inexistente com o id: " + usuarioId));
        
        Animal entidade = mapper.paraEntidade(animalDto);
        entidade.setUsuario(usuario);
        
        return mapper.paraDto(repository.save(entidade));
    }

    @Transactional(readOnly = true)
    public AnimalResponse buscarPorId(UUID animalId) {
        Animal animal = repository.findById(animalId).orElseThrow(
            () -> new AnimalNaoEcontradoException("Não foi possível encontrar um animal com o id: " + animalId)
        );
        return mapper.paraDto(animal);
    }

    @Transactional(readOnly = true)
    public List<AnimalResponse> buscarAnimaisPorUsuarioId(UUID usuarioId) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado.");
        }

        return repository.buscarAnimalPorUsuarioId(usuarioId)
            .stream().map(mapper::paraDto).toList();
    }

    @Transactional
    public AnimalResponse atualizar(UUID usuarioLogadoId, UUID animalId, AnimalRequest animalRequest) {
        Animal entidade = repository.findById(animalId).orElseThrow(
            () -> new AnimalNaoEcontradoException("Não foi possível encontrar um animal com o id: " + animalId)
        );

        // VALIDAÇÃO DE POSSE (Ownership): Garante que o animal pertence ao usuário logado
        if (!entidade.getUsuario().getId().equals(usuarioLogadoId)) {
            throw new UsuarioNaoAutorizadoException("Você não tem permissão para editar o cadastro deste animal.");
        }

        atualizarDadosEntidade(entidade, animalRequest);
        return mapper.paraDto(repository.save(entidade));
    }

    @Transactional
    public void excluir(UUID usuarioLogadoId, UUID animalId) {
        Animal entidade = repository.findById(animalId).orElseThrow(
            () -> new AnimalNaoEcontradoException("Não foi possível encontrar um animal com o id: " + animalId)
        );

        if (!entidade.getUsuario().getId().equals(usuarioLogadoId)) {
            throw new UsuarioNaoAutorizadoException("Você não tem permissão para excluir este animal.");
        }

        repository.delete(entidade);
    }

    private void atualizarDadosEntidade(Animal entidade, AnimalRequest dto) {
        if(dto.nome() != null) entidade.setNome(dto.nome());
        if(dto.sexo() != null) entidade.setSexo(dto.sexo());
        if(dto.corPredominante() != null) entidade.setCorPredominante(dto.corPredominante());
        if(dto.castrado() != null) entidade.setCastrado(dto.castrado());
        if(dto.vacinado() != null) entidade.setVacinado(dto.vacinado());
        if(dto.descricao() != null) entidade.setDescricao(dto.descricao());
        if(dto.fotoUrl() != null) entidade.setFotoUrl(dto.fotoUrl());
        if(dto.idade() != null) entidade.setIdade(dto.idade());
        if(dto.porte() != null) entidade.setPorte(dto.porte());
        if(dto.especie() != null) entidade.setEspecie(dto.especie());
    }
}