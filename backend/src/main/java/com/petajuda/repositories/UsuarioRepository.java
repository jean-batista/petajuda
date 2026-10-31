package com.petajuda.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.petajuda.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
}
