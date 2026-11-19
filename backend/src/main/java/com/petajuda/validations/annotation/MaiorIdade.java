package com.petajuda.validations.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

import com.petajuda.validations.validators.MaiorIdadeValidator;

@Documented
@Constraint(validatedBy = MaiorIdadeValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface MaiorIdade {
    String message() default "O usuário deve ter no mínimo 18 anos de idade para se registrar";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}