package com.petajuda.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.petajuda.model.Ong;

public interface OngRepository extends JpaRepository<Ong, UUID> {
}
