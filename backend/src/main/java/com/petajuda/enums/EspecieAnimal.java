package com.petajuda.enums;

public enum EspecieAnimal {

    // Caninos domésticos
    CACHORRO("Cachorro"),

    // Felinos domésticos
    GATO("Gato"),

    // Aves resgatadas ou domésticas
    PASSARO("Pássaro / Ave"),

    // Equinos (cavalos, pôneis - muito comuns em resgates na região)
    EQUINO("Equino (Cavalo / Pônei)"),

    // Roedores (coelhos, hamsters, porquinhos-da-índia)
    ROEDOR("Roedor (Coelho / Hamster)"),

    // Répteis (jabutis, tartarugas)
    REPTEIS("Réptil (Jabuti / Tartaruga)"),

    // Válvula de escape para outras espécies não listadas
    OUTRO("Outro");

    private final String descricao;

    EspecieAnimal(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}