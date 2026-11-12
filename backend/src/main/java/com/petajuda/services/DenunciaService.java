package com.petajuda.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.petajuda.dtos.request.DenunciaRequest;
import com.petajuda.dtos.response.DenunciaResponse;
import com.petajuda.enums.StatusDenuncia;
import com.petajuda.exceptions.RecursoNaoEncontradoException;
import com.petajuda.mappers.DenunciaMapper;
import com.petajuda.model.Denuncia;
import com.petajuda.repositories.DenunciaRepository;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DenunciaService {

    // Dependencias da classe
    private final DenunciaRepository repository;
    private final DenunciaMapper mapper;

    // Dependencias externas
    private final CloudinaryService cloudinaryService;

    // Injecao das dependencias via construtor
    public DenunciaService(DenunciaRepository repository, 
                           DenunciaMapper mapper,
                           CloudinaryService cloudinaryService) {
        this.repository = repository;
        this.mapper = mapper;
        this.cloudinaryService = cloudinaryService;
    }

    // Salva uma Denuncia
    @Transactional
    public DenunciaResponse salvar(DenunciaRequest request, MultipartFile foto) {

        // Upload da foto do pet para a pasta 'denuncias'
        String urlFoto = cloudinaryService.enviarFoto(foto, "denuncias");

        Denuncia entidade = mapper.paraEntidade(request);
        entidade.setStatus(StatusDenuncia.PENDENTE);
        entidade.setFotoUrl(urlFoto);
        
        return mapper.paraDto(repository.save(entidade));
    }

    // Busca uma Denuncia pelo id
    @Transactional(readOnly = true)
    public DenunciaResponse buscarPorId(UUID id) {

        // Verifica se a Denuncia existe
        Denuncia denuncia = repository.findById(id).orElseThrow(
            () -> new RecursoNaoEncontradoException("Denúncia não encontrada com o id: " + id)
        );
        return mapper.paraDto(denuncia);
    }

    // Busca todas as Denuncias cadastradas
    @Transactional(readOnly = true)
    public List<DenunciaResponse> buscarTodas() {
        return repository.findAll().stream().map(mapper::paraDto).toList();
    }


    // Altera o status da Denuncia
    @Transactional
    public DenunciaResponse alterarStatus(UUID denunciaId, StatusDenuncia novoStatus) {

        // Verifica se a Denuncia existe
        Denuncia entidade = repository.findById(denunciaId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Denúncia não encontrada com o id: " + denunciaId)
        );

        entidade.setStatus(novoStatus);
        return mapper.paraDto(repository.save(entidade));
    }

    // Exluir uma Denuncia
    @Transactional
    public void excluir(UUID denunciaId) {

        // Verifica se a Denuncia existe
        Denuncia entidade = repository.findById(denunciaId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Denúncia não encontrada com o id: " + denunciaId)
        );

        String urlFoto = entidade.getFotoUrl();

        repository.delete(entidade);
        cloudinaryService.excluirFoto(urlFoto);
    }
}