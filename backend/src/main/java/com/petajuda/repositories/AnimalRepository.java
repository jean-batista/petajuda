package com.petajuda.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.petajuda.model.Animal;

public interface AnimalRepository extends JpaRepository<Animal, UUID> {
    
    @Query(nativeQuery = true, value = "SELECT * FROM tabela_animal WHERE usuario_id = :usuarioId")
    List<Animal> buscarAnimalPorUsuarioId(UUID usuarioId);
}
