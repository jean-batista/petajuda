package com.petajuda.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.petajuda.model.Animal;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, UUID> {
    
    // Metodo para buscar os Animais de um Usuario
    List<Animal> findByUsuarioId(UUID usuarioId);

}