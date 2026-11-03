package com.petajuda.validations.validators;


import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;
import java.time.Period;

import com.petajuda.validations.annotation.MaiorIdade;

public class MaiorIdadeValidator implements ConstraintValidator<MaiorIdade, LocalDate> {

    @Override
    public boolean isValid(LocalDate birthDate, ConstraintValidatorContext context) {
        if (birthDate == null) {
            return false;
        }
        return Period.between(birthDate, LocalDate.now()).getYears() >= 18;
    }
}