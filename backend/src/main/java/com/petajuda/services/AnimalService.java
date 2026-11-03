package com.petajuda.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.petajuda.dtos.request.AnimalRequest;
import com.petajuda.dtos.response.AnimalResponse;
import com.petajuda.exceptions.AnimalNaoEcontradoException;
import com.petajuda.exceptions.RecursoNaoEncontradoException;
import com.petajuda.exceptions.UsuarioNaoAutorizadoException;
import com.petajuda.mappers.AnimalMapper;
import com.petajuda.model.Animal;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.AnimalRepository;
import com.petajuda.repositories.UsuarioRepository;

@Service 
public class AnimalService {

    @Autowired
    private AnimalRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private AnimalMapper mapper;

    public AnimalResponse salvar(UUID usuarioId, AnimalRequest animalDto) {
        Optional<Usuario> optional = usuarioRepository.findById(usuarioId);
        if(optional.isEmpty()) throw new UsuarioNaoAutorizadoException("Usuario inexistente com o id: " + usuarioId);
        Animal entidade = mapper.paraEntidade(animalDto);
        entidade.setUsuario(optional.get());
        return mapper.paraDto(repository.save(entidade));
    }

    public AnimalResponse buscarPorId(UUID animalId) {
        Animal animal = repository.findById(animalId).orElseThrow(
            () -> new AnimalNaoEcontradoException("Não foi possível encontrar um animal com o id: " + animalId)
        );
        return mapper.paraDto(animal);
    }

    public List<AnimalResponse> buscarAnimaisPorUsuarioId(UUID usuarioId) {
        return repository.buscarAnimalPorUsuarioId(usuarioId)
            .stream().map(mapper::paraDto).toList();
    }

    public AnimalResponse atualizar(UUID animalId, AnimalRequest animalRequest) {
        Animal entidade = repository.findById(animalId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Não foi possível encontrar um animal com o id: " + animalId)
        );
        atualizar(entidade, animalRequest);
        return mapper.paraDto(repository.save(entidade));
    }

    public void excluir(UUID animalId) {
        Animal entidade = repository.findById(animalId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Não foi possível encontrar um animal com o id: " + animalId)
        );
        repository.delete(entidade);
    }

    private void atualizar(Animal entidade, AnimalRequest dto) {
        if(dto.nome() != null) entidade.setNome(dto.nome());
        if(dto.sexo() != null) entidade.setSexo(dto.sexo());
        if(dto.corPredominante() != null) entidade.setCorPredominante(dto.corPredominante());;
        if(dto.castrado() != null) entidade.setCastrado(dto.castrado());
        if(dto.vacinado() != null) entidade.setVacinado(dto.vacinado());
        if(dto.descricao() != null) entidade.setDescricao(dto.descricao());
        if(dto.fotoUrl() != null) entidade.setFotoUrl(dto.fotoUrl());
        if(dto.idade() != null) entidade.setIdade(dto.idade());
        if(dto.porte() != null) entidade.setPorte(dto.porte());
        if(dto.especie() != null) entidade.setEspecie(dto.especie());
    }

}
