package com.petajuda.unittests.validations;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.petajuda.validations.validators.MaiorIdadeValidator;

class MaiorIdadeValidatorTest {

    private MaiorIdadeValidator validator;

    @BeforeEach
    void setUp() {
        validator = new MaiorIdadeValidator();
    }

    @Test
    @DisplayName("MaiorIdadeValidator: Deve retornar false quando a data de nascimento for nula")
    void deveRetornarFalsoQuandoDataForNula() {
        boolean valido = validator.isValid(null, null);

        assertThat(valido).isFalse();
    }

    @Test
    @DisplayName("MaiorIdadeValidator: Deve retornar false para usuário menor de 18 anos")
    void deveRetornarFalsoParaMenorDeIdade() {
        LocalDate dataNascimento = LocalDate.now().minusYears(17);

        boolean valido = validator.isValid(dataNascimento, null);

        assertThat(valido).isFalse();
    }

    @Test
    @DisplayName("MaiorIdadeValidator: Deve retornar true para usuário completando 18 anos hoje")
    void deveRetornarVerdadeiroParaQuemCompleta18AnosHoje() {
        LocalDate dataNascimento = LocalDate.now().minusYears(18);

        boolean valido = validator.isValid(dataNascimento, null);

        assertThat(valido).isTrue();
    }

    @Test
    @DisplayName("MaiorIdadeValidator: Deve retornar true para usuário maior de 18 anos")
    void deveRetornarVerdadeiroParaMaiorDeIdade() {
        LocalDate dataNascimento = LocalDate.now().minusYears(25);

        boolean valido = validator.isValid(dataNascimento, null);

        assertThat(valido).isTrue();
    }
}
