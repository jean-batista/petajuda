package com.petajuda.exceptions;

public class EmailJaExistenteException extends RuntimeException {
    public EmailJaExistenteException(String mensagem) {
        super(mensagem);
    }
}
