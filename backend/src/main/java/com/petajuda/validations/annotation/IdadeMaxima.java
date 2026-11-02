package com.petajuda.validations.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

import com.petajuda.validations.validators.IdadeMaximaValidator;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = IdadeMaximaValidator.class)
@Documented
public @interface IdadeMaxima {
    String message() default "A idade não pode ser superior a {value} anos";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    int value();
}