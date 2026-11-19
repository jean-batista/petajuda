package com.petajuda.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.petajuda.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    // Metodo para buscar um Usuario pelo seu email
    Optional<Usuario> findByEmail(String email);

    // Metodo para buscar todos os Usuarios ativos
    Page<Usuario> findAllByAtivo(Boolean ativo, Pageable pageable);

    // Metodo para verificar se existe um Usuario com o telefone
    boolean existsByTelefone(String telefone);

    // Metodo para verificar se existe um Usuario com o email
    boolean existsByEmail(String email);
}
