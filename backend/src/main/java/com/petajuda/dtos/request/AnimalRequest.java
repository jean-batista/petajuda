package com.petajuda.dtos.request;

import com.petajuda.enums.EspecieAnimal;
import com.petajuda.enums.IdadeAnimal;
import com.petajuda.enums.PorteAnimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AnimalRequest(
    
    @NotBlank(message = "O nome do animal é obrigatório.")
    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
    String nome,

    @NotBlank(message = "O sexo do animal é obrigatório.")
    @Size(max = 10, message = "O sexo deve ter no máximo 10 caracteres.")
    String sexo,

    @NotBlank(message = "A cor predominante é obrigatória.")
    @Size(max = 50, message = "A cor predominante deve ter no máximo 50 caracteres.")
    String corPredominante,

    @NotNull(message = "A informação sobre castração é obrigatória.")
    Boolean castrado,

    @NotNull(message = "A informação sobre vacinação é obrigatória.")
    Boolean vacinado,

    @NotBlank(message = "A descrição do animal é obrigatória.")
    String descricao,

    @NotNull(message = "A idade aproximada é obrigatória.")
    IdadeAnimal idade,

    @NotNull(message = "O porte do animal é obrigatório.")
    PorteAnimal porte,

    @NotNull(message = "A espécie do animal é obrigatória.")
    EspecieAnimal especie
) {}