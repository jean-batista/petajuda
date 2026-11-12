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
import org.springframework.web.multipart.MultipartFile;

@Service
public class AnimalService {

    // Dependencias da classe
    private final AnimalRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final AnimalMapper mapper;

    // Dependencias externas
    private final CloudinaryService cloudinaryService;

    // Injecao das dependencias via construtor
    public AnimalService(AnimalRepository repository, UsuarioRepository usuarioRepository, AnimalMapper mapper,
                         CloudinaryService cloudinaryService) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.mapper = mapper;
        this.cloudinaryService = cloudinaryService;
    }

    // Cadastra um Animal
    @Transactional
    public AnimalResponse salvar(UUID usuarioId, AnimalRequest animalDto, MultipartFile foto) {

        // Verifica se o Usuario existe
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário inexistente com o id: " + usuarioId));

        // Upload da foto do pet para a pasta 'animais'
        String urlFoto = cloudinaryService.enviarFoto(foto, "animais");

        Animal entidade = mapper.paraEntidade(animalDto);
        entidade.setUsuario(usuario);
        entidade.setFotoUrl(urlFoto);

        return mapper.paraDto(repository.save(entidade));
    }

    // Busca um Animal usando o seu id
    @Transactional(readOnly = true)
    public AnimalResponse buscarPorId(UUID animalId) {

        // Verifica se o Animal existe
        Animal animal = repository.findById(animalId).orElseThrow(
            () -> new AnimalNaoEcontradoException("Não foi possível encontrar um animal com o id: " + animalId)
        );
        return mapper.paraDto(animal);
    }

    // Busca todos os animais que um Usuario possui cadastrado
    @Transactional(readOnly = true)
    public List<AnimalResponse> buscarAnimaisPorUsuarioId(UUID usuarioId) {

        // Verifica se o Usuario existe
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado.");
        }

        return repository.findByUsuarioId(usuarioId)
            .stream().map(mapper::paraDto).toList();
    }

    // Atualiza os dados de um Animal
    @Transactional
    public AnimalResponse atualizar(UUID usuarioLogadoId, UUID animalId, AnimalRequest animalRequest,
                                    MultipartFile novaFoto) {

        // Verifica se o Animal existe
        Animal entidade = repository.findById(animalId).orElseThrow(
            () -> new AnimalNaoEcontradoException("Não foi possível encontrar um animal com o id: " + animalId)
        );

        // Verifica se o Usuario possui permissao para editar o cadastro do Animal
        if (!entidade.getUsuario().getId().equals(usuarioLogadoId)) {
            throw new UsuarioNaoAutorizadoException("Você não tem permissão para editar o cadastro deste animal.");
        }

        // Se o usuário enviou uma nova foto:
        // 1. Sobe a nova imagem
        // 2. Apaga a foto antiga do Cloudinary para não deixar lixo na nuvem
        if (novaFoto != null && !novaFoto.isEmpty()) {
            String urlAntiga = entidade.getFotoUrl();
            String novaUrl = cloudinaryService.enviarFoto(novaFoto, "animais");
            entidade.setFotoUrl(novaUrl);

            cloudinaryService.excluirFoto(urlAntiga);
        }

        atualizarDadosEntidade(entidade, animalRequest);
        return mapper.paraDto(repository.save(entidade));
    }

    // Apaga o cadastro de um Animal
    @Transactional
    public void excluir(UUID usuarioLogadoId, UUID animalId) {

        // Verifica se o Animal existe
        Animal entidade = repository.findById(animalId).orElseThrow(
            () -> new AnimalNaoEcontradoException("Não foi possível encontrar um animal com o id: " + animalId)
        );

        // Verifica se o Usuario possui permissao para excluir o Animal
        if (!entidade.getUsuario().getId().equals(usuarioLogadoId)) {
            throw new UsuarioNaoAutorizadoException("Você não tem permissão para excluir este animal.");
        }

        String fotoUrl = entidade.getFotoUrl();

        // Remove do banco primeiro; se der sucesso, limpa a imagem na nuvem
        repository.delete(entidade);
        cloudinaryService.excluirFoto(fotoUrl);
    }

    // Metodo auxiliar para modificar os dados de um Animal
    private void atualizarDadosEntidade(Animal entidade, AnimalRequest dto) {
        if(dto.nome() != null) entidade.setNome(dto.nome());
        if(dto.sexo() != null) entidade.setSexo(dto.sexo());
        if(dto.corPredominante() != null) entidade.setCorPredominante(dto.corPredominante());
        if(dto.castrado() != null) entidade.setCastrado(dto.castrado());
        if(dto.vacinado() != null) entidade.setVacinado(dto.vacinado());
        if(dto.descricao() != null) entidade.setDescricao(dto.descricao());
        if(dto.idade() != null) entidade.setIdade(dto.idade());
        if(dto.porte() != null) entidade.setPorte(dto.porte());
        if(dto.especie() != null) entidade.setEspecie(dto.especie());
    }
}