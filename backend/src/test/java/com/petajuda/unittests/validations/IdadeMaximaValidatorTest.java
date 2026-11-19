package com.petajuda.unittests.validations;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.petajuda.validations.annotation.IdadeMaxima;
import com.petajuda.validations.validators.IdadeMaximaValidator;

class IdadeMaximaValidatorTest {

    private IdadeMaximaValidator validator;

    @BeforeEach
    void setUp() {
        validator = new IdadeMaximaValidator();
        inicializarValidatorComIdadeMaxima(30); // Limite máximo de 30 anos para os testes
    }

    @Test
    @DisplayName("IdadeMaximaValidator: Deve retornar true quando a data for nula (deixa validação para @NotNull)")
    void deveRetornarVerdadeiroQuandoDataForNula() {
        boolean valido = validator.isValid(null, null);

        assertThat(valido).isTrue();
    }

    @Test
    @DisplayName("IdadeMaximaValidator: Deve retornar true quando a data estiver no futuro")
    void deveRetornarVerdadeiroQuandoDataEstiverNoFuturo() {
        LocalDate dataFutura = LocalDate.now().plusDays(5);

        boolean valido = validator.isValid(dataFutura, null);

        assertThat(valido).isTrue();
    }

    @Test
    @DisplayName("IdadeMaximaValidator: Deve retornar true para idade abaixo do limite máximo")
    void deveRetornarVerdadeiroParaIdadeAbaixoDoLimite() {
        LocalDate dataNascimento = LocalDate.now().minusYears(15);

        boolean valido = validator.isValid(dataNascimento, null);

        assertThat(valido).isTrue();
    }

    @Test
    @DisplayName("IdadeMaximaValidator: Deve retornar true para idade exatamente igual ao limite máximo")
    void deveRetornarVerdadeiroParaIdadeNoLimiteExato() {
        LocalDate dataNascimento = LocalDate.now().minusYears(30);

        boolean valido = validator.isValid(dataNascimento, null);

        assertThat(valido).isTrue();
    }

    @Test
    @DisplayName("IdadeMaximaValidator: Deve retornar false para idade acima do limite máximo")
    void deveRetornarFalsoParaIdadeAcimaDoLimite() {
        LocalDate dataNascimento = LocalDate.now().minusYears(31);

        boolean valido = validator.isValid(dataNascimento, null);

        assertThat(valido).isFalse();
    }

    private void inicializarValidatorComIdadeMaxima(int maxAge) {
        IdadeMaxima annotation = mock(IdadeMaxima.class);
        when(annotation.value()).thenReturn(maxAge);

        validator.initialize(annotation);
    }
}