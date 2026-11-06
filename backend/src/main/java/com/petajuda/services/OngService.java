package com.petajuda.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.petajuda.dtos.request.OngRequest;
import com.petajuda.dtos.response.OngResponse;
import com.petajuda.exceptions.RecursoNaoEncontradoException;
import com.petajuda.exceptions.UsuarioNaoAutorizadoException;
import com.petajuda.exceptions.RegraDeNegocioException;
import com.petajuda.mappers.EnderecoMapper;
import com.petajuda.mappers.OngMapper;
import com.petajuda.model.Ong;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.OngRepository;
import com.petajuda.repositories.UsuarioRepository;

@Service 
public class OngService {
    
    // Dependencias da classe
    private final OngRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final OngMapper mapper;
    private final EnderecoMapper enderecoMapper;

    // Injecao de dependencias via construtor
    public OngService(OngRepository repository, UsuarioRepository usuarioRepository, OngMapper mapper, EnderecoMapper enderecoMapper) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.mapper = mapper;
        this.enderecoMapper = enderecoMapper;
    }

    // Cadastra uma Ong
    @Transactional
    public OngResponse salvar(UUID usuarioId, OngRequest ongRequest) {

        // Verifica se o Usuario existe
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Não foi possível encontrar um usuário com o id: " + usuarioId)
        );

        // Verifica se o Usuario ja possui uma Ong cadastrada
        if (usuario.getOng() != null) {
            throw new RegraDeNegocioException("Este usuário já possui uma ONG cadastrada.");
        }

        Ong entidade = mapper.paraEntidade(ongRequest);
        entidade.setUsuario(usuario);
        
        return mapper.paraDto(repository.save(entidade));
    }

    // Busca uma Ong pelo id
    @Transactional(readOnly = true)
    public OngResponse buscarPorId(UUID ongId) {

        // Verifica se a Ong existe
        Ong ong = repository.findById(ongId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Não foi possível encontrar uma ONG com o id: " + ongId)
        );
        return mapper.paraDto(ong);
    }

    // Busca todas as Ongs cadastradas
    @Transactional(readOnly = true)
    public List<OngResponse> buscarOngs() {
        return repository.findAll().stream().map(mapper::paraDto).toList();
    }

    // Atualiza uma Ong
    @Transactional
    public OngResponse atualizar(UUID usuarioLogadoId, UUID ongId, OngRequest ongRequest) {

        // Verifica se a Ong existe 
        Ong entidade = repository.findById(ongId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Não foi possível encontrar uma ONG com o id: " + ongId)
        );

        // Verifica se o Usuario possui permissao para editar os dados da Ong
        if (!entidade.getUsuario().getId().equals(usuarioLogadoId)) {
            throw new UsuarioNaoAutorizadoException("Você não tem permissão para editar os dados desta ONG.");
        }

        atualizarDadosEntidade(entidade, ongRequest);
        return mapper.paraDto(repository.save(entidade));
    }

    // Exluir uma Ong
    @Transactional
    public void excluir(UUID usuarioLogadoId, UUID ongId) {

        // Verifica se a Ong existe
        Ong entidade = repository.findById(ongId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Não foi possível encontrar uma ONG com o id: " + ongId)
        );

        // Verifica se o Usuario possui permissao para excluir a Ong
        if (!entidade.getUsuario().getId().equals(usuarioLogadoId)) {
            throw new UsuarioNaoAutorizadoException("Você não tem permissão para excluir esta ONG.");
        }

        repository.delete(entidade);
    }

    // Metodo auxiliar para atualizar os dados da Ong
    private void atualizarDadosEntidade(Ong entidade, OngRequest dto) {
        if (dto.nome() != null) entidade.setNome(dto.nome());
        if (dto.razaoSocial() != null) entidade.setRazaoSocial(dto.razaoSocial());
        if (dto.cnpj() != null) entidade.setCnpj(dto.cnpj());
        if (dto.chavePix() != null) entidade.setChavePix(dto.chavePix());
        if (dto.descricao() != null) entidade.setDescricao(dto.descricao());
        if (dto.endereco() != null) entidade.setEndereco(enderecoMapper.paraEntidade(dto.endereco()));
    }

}