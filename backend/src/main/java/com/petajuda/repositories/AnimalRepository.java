package com.petajuda.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.petajuda.model.Animal;

public interface AnimalRepository extends JpaRepository<Animal, UUID> {
}
