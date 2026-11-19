package com.petajuda.controllers.docs;

import org.springframework.http.ResponseEntity;

import com.petajuda.dtos.request.UsuarioCredenciaisRequest;
import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.dtos.response.UsuarioAutenticacaoInfoResponse;
import com.petajuda.dtos.response.UsuarioInfoResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Autenticação", description = "Endpoints para Login, Cadastro de novos usuários e Renovação de Token JWT")
public interface AutenticacaoControllerDoc {

    @Operation(summary = "Realizar Login", description = "Autentica as credenciais do usuário e retorna o Token JWT com as suas autorizações.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Autenticação realizada com sucesso"),
        @ApiResponse(responseCode = "401", description = "E-mail/senha inválidos ou conta inativa")
    })
    ResponseEntity<UsuarioAutenticacaoInfoResponse> login(UsuarioCredenciaisRequest credenciais);

    @Operation(summary = "Cadastrar novo usuário", description = "Cria uma conta de cidadão comum na plataforma.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Usuário cadastrado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos, e-mail ou telefone já em uso")
    })
    ResponseEntity<UsuarioInfoResponse> register(UsuarioInfoRequest usuarioInfo);

    @Operation(summary = "Refresh Token", description = "Renova o token JWT antes que ele expire.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token renovado com sucesso"),
        @ApiResponse(responseCode = "401", description = "Token inválido ou expirado")
    })
    ResponseEntity<UsuarioAutenticacaoInfoResponse> refreshToken(String token);
}