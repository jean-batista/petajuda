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

@Service
public class DenunciaService {

    private final DenunciaRepository repository;
    private final DenunciaMapper mapper;

    public DenunciaService(DenunciaRepository repository, 
                           DenunciaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public DenunciaResponse salvar(DenunciaRequest request) {
        Denuncia entidade = mapper.paraEntidade(request);
        entidade.setStatus(StatusDenuncia.PENDENTE);
        
        return mapper.paraDto(repository.save(entidade));
    }

    @Transactional(readOnly = true)
    public DenunciaResponse buscarPorId(UUID id) {
        Denuncia denuncia = repository.findById(id).orElseThrow(
            () -> new RecursoNaoEncontradoException("Denúncia não encontrada com o id: " + id)
        );
        return mapper.paraDto(denuncia);
    }

    @Transactional(readOnly = true)
    public List<DenunciaResponse> buscarTodas() {
        return repository.findAll().stream().map(mapper::paraDto).toList();
    }

    @Transactional
    public DenunciaResponse alterarStatus(UUID denunciaId, StatusDenuncia novoStatus) {
        Denuncia entidade = repository.findById(denunciaId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Denúncia não encontrada com o id: " + denunciaId)
        );

        entidade.setStatus(novoStatus);
        return mapper.paraDto(repository.save(entidade));
    }

    @Transactional
    public void excluir(UUID denunciaId) {
        Denuncia entidade = repository.findById(denunciaId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Denúncia não encontrada com o id: " + denunciaId)
        );
        repository.delete(entidade);
    }
}