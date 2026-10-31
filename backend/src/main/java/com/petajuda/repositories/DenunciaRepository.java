package com.petajuda.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.petajuda.model.Denuncia;

public interface DenunciaRepository extends JpaRepository<Denuncia, UUID> {
}
