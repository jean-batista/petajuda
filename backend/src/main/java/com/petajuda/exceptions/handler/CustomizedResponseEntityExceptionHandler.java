package com.petajuda.exceptions.handler;

import java.util.Date;
import java.util.stream.Collectors;

import com.petajuda.exceptions.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.petajuda.exceptions.response.ExceptionResponse;

@ControllerAdvice
@RestController
public class CustomizedResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(Exception.class)
    public final ResponseEntity<ExceptionResponse> handleAllExceptions(Exception ex, WebRequest request) {
        ExceptionResponse exceptionResponse = new ExceptionResponse(
            new Date(),
            ex.getMessage(),
            request.getDescription(false));
        return new ResponseEntity<>(exceptionResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public final ResponseEntity<ExceptionResponse> handleResourceNotFoundExceptions(Exception ex, WebRequest request) {
        ExceptionResponse exceptionResponse = new ExceptionResponse(
            new Date(),
            ex.getMessage(),
            request.getDescription(false));
        return new ResponseEntity<>(exceptionResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TokenInvalidoException.class)
    public final ResponseEntity<ExceptionResponse> handleInvalidTokenExceptions(Exception ex, WebRequest request) {
        ExceptionResponse exceptionResponse = new ExceptionResponse(
            new Date(),
            ex.getMessage(),
            request.getDescription(false));
        return new ResponseEntity<>(exceptionResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(SenhaInvalidaException.class)
    public final ResponseEntity<ExceptionResponse> handleInvalidPasswordExceptions(Exception ex, WebRequest request) {
        ExceptionResponse exceptionResponse = new ExceptionResponse(
            new Date(),
            ex.getMessage(),
            request.getDescription(false));
        return new ResponseEntity<>(exceptionResponse, HttpStatus.UNPROCESSABLE_CONTENT);
    }

    @ExceptionHandler(EmailInvalidoException.class)
    public final ResponseEntity<ExceptionResponse> handleInvalidUsernameExceptions(Exception ex, WebRequest request) {
        ExceptionResponse exceptionResponse = new ExceptionResponse(
            new Date(),
            ex.getMessage(),
            request.getDescription(false));
        return new ResponseEntity<>(exceptionResponse, HttpStatus.UNPROCESSABLE_CONTENT);
    }

    @ExceptionHandler(UsuarioNaoAutorizadoException.class)
    public final ResponseEntity<ExceptionResponse> handleUnauthorizedUserExceptions(Exception ex, WebRequest request) {
        ExceptionResponse exceptionResponse = new ExceptionResponse(
            new Date(),
            ex.getMessage(),
            request.getDescription(false));
        return new ResponseEntity<>(exceptionResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(UsuarioInativoException.class)
    public final ResponseEntity<ExceptionResponse> handleInactiveUserExceptions(Exception ex, WebRequest request) {
        ExceptionResponse exceptionResponse = new ExceptionResponse(
            new Date(),
            ex.getMessage(),
            request.getDescription(false));
        return new ResponseEntity<>(exceptionResponse, HttpStatus.UNPROCESSABLE_CONTENT);
    }

    @ExceptionHandler(EmailJaExistenteException.class)
    public final ResponseEntity<ExceptionResponse> handleEmailJaExistenteExceptionExceptions(Exception ex, WebRequest request) {
        ExceptionResponse exceptionResponse = new ExceptionResponse(
            new Date(),
            ex.getMessage(),
            request.getDescription(false));
        return new ResponseEntity<>(exceptionResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(AnimalNaoEcontradoException.class)
    public final ResponseEntity<ExceptionResponse> handleAnimalNaoEcontradoExceptionExceptions(Exception ex, WebRequest request) {
        ExceptionResponse exceptionResponse = new ExceptionResponse(
            new Date(),
            ex.getMessage(),
            request.getDescription(false));
        return new ResponseEntity<>(exceptionResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(RegraDeNegocioException.class)
    public final ResponseEntity<ExceptionResponse> handleRegraDeNegocioExceptionExceptions(Exception ex, WebRequest request) {
        ExceptionResponse exceptionResponse = new ExceptionResponse(
                new Date(),
                ex.getMessage(),
                request.getDescription(false));
        return new ResponseEntity<>(exceptionResponse, HttpStatus.BAD_REQUEST);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        
        String errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        ExceptionResponse exceptionResponse = new ExceptionResponse(
                new Date(),
                "Validation Failed: " + errors,
                request.getDescription(false));
        
        return new ResponseEntity<>(exceptionResponse, HttpStatus.BAD_REQUEST);
    }

}