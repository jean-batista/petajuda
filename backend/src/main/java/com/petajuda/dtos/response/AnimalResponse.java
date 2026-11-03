package com.petajuda.dtos.response;

import java.util.UUID;

import com.petajuda.enums.EspecieAnimal;
import com.petajuda.enums.IdadeAnimal;
import com.petajuda.enums.PorteAnimal;

public record AnimalResponse(
    UUID id,
    String nome,
    String sexo,
    String corPredominante,
    Boolean cadastrado,
    Boolean vacinado,
    String descricao,
    String fotoUrl,
    IdadeAnimal idade,
    PorteAnimal porte,
    EspecieAnimal especie
) {}
