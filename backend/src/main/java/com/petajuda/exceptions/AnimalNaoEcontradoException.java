package com.petajuda.exceptions;

public class AnimalNaoEcontradoException extends RuntimeException {
    public AnimalNaoEcontradoException(String mensagem) {
        super(mensagem);
    }
}
