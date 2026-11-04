package com.petajuda.services;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.petajuda.dtos.request.OngRequest;
import com.petajuda.dtos.response.OngResponse;
import com.petajuda.exceptions.RecursoNaoEncontradoException;
import com.petajuda.mappers.OngMapper;
import com.petajuda.model.Ong;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.OngRepository;
import com.petajuda.repositories.UsuarioRepository;

@Service 
public class OngService {
    
    @Autowired 
    private OngRepository repository;

    @Autowired 
    private UsuarioRepository usuarioRepository;

    @Autowired
    private OngMapper mapper;

    public OngResponse salvar(UUID usuarioId, OngRequest ongRequest) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Não foi possível encontrar um usuário com o id: " + usuarioId)
        );
        Ong entidade = mapper.paraEntidade(ongRequest);
        entidade.setUsuario(usuario);
        return mapper.paraDto(repository.save(entidade));
    }

    public OngResponse buscarPorId(UUID ongId) {
        Ong ong = repository.findById(ongId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Não foi possível encontrar uma ong com o id: " + ongId)
        );
        return mapper.paraDto(ong);
    }

    public List<Ong> buscarOngs() {
        return repository.findAll().stream().map(ong -> mapper::paraDto).toList();
    }

}
