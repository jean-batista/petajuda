package com.petajuda.dtos.request;

import com.petajuda.enums.EspecieAnimal;
import com.petajuda.enums.IdadeAnimal;
import com.petajuda.enums.PorteAnimal;

public record AnimalRequest(
    String nome,
    String sexo,
    String corPredominante,
    Boolean castrado,
    Boolean vacinado,
    String descricao,
    String fotoUrl,
    IdadeAnimal idade,
    PorteAnimal porte,
    EspecieAnimal especie
) {}
