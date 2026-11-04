package com.petajuda.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.petajuda.model.Campanha;

public interface CampanhaRepository extends JpaRepository<Campanha, UUID> {
    List<Campanha> findByOngId(UUID ongId);
}
