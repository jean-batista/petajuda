package com.petajuda.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.petajuda.model.Publicacao;

public interface PublicacaoRepository extends JpaRepository<Publicacao, UUID> {
}
