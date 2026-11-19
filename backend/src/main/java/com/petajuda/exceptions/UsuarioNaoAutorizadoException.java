package com.petajuda.exceptions;

public class UsuarioNaoAutorizadoException extends RuntimeException {
    public UsuarioNaoAutorizadoException(String mensagem) {
        super(mensagem);
    }
}
