package com.petajuda.validations.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;
import java.time.Period;

import com.petajuda.validations.annotation.IdadeMaxima;

public class IdadeMaximaValidator implements ConstraintValidator<IdadeMaxima, LocalDate> {

    private int maxAge;

    @Override
    public void initialize(IdadeMaxima constraintAnnotation) {
        this.maxAge = constraintAnnotation.value();
    }

    @Override
    public boolean isValid(LocalDate birthDate, ConstraintValidatorContext context) {
        if (birthDate == null) {
            return true;
        }

        if (birthDate.isAfter(LocalDate.now())) {
            return true;
        }

        int age = Period.between(birthDate, LocalDate.now()).getYears();
        return age <= maxAge;
    }
}