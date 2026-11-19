package com.petajuda.controllers.docs;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import com.petajuda.dtos.request.AtualizarEmailUsuarioRequest;
import com.petajuda.dtos.request.AtualizarPerfilUsuarioRequest;
import com.petajuda.dtos.request.AtualizarSenhaUsuarioRequest;
import com.petajuda.dtos.response.UsuarioAutenticacaoInfoResponse;
import com.petajuda.dtos.response.UsuarioInfoResponse;
import com.petajuda.security.details.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Usuários", description = "Endpoints para gerenciamento de perfis de usuário")
@SecurityRequirement(name = "bearerAuth")
public interface UsuarioControllerDoc {

    @Operation(summary = "Perfil do usuário logado", description = "Retorna os dados do perfil do usuário autenticado no momento.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Perfil retornado com sucesso"),
        @ApiResponse(responseCode = "401", description = "Não autorizado")
    })
    ResponseEntity<UsuarioInfoResponse> me(CustomUserDetails userDetails);

    @Operation(summary = "Atualizar perfil", description = "Atualiza os dados básicos do perfil do usuário logado.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Perfil atualizado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "401", description = "Não autorizado")
    })
    ResponseEntity<UsuarioInfoResponse> atualizarPerfil(
            CustomUserDetails userDetails,
            AtualizarPerfilUsuarioRequest request);

    @Operation(summary = "Alterar senha", description = "Altera a senha do usuário logado.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Senha alterada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Senha atual incorreta ou nova senha inválida"),
        @ApiResponse(responseCode = "401", description = "Não autorizado")
    })
    ResponseEntity<Void> atualizarSenha(
            CustomUserDetails userDetails,
            AtualizarSenhaUsuarioRequest request);

    @Operation(summary = "Alterar e-mail", description = "Altera o e-mail do usuário logado e retorna um novo token JWT atualizado.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "E-mail alterado e novo token gerado"),
        @ApiResponse(responseCode = "400", description = "E-mail já existente ou inválido"),
        @ApiResponse(responseCode = "401", description = "Não autorizado")
    })
    ResponseEntity<UsuarioAutenticacaoInfoResponse> atualizarEmail(
            CustomUserDetails userDetails,
            AtualizarEmailUsuarioRequest request);

    @Operation(summary = "Listar todos os usuários (ADMIN)", description = "Retorna uma lista paginada de usuários. Acesso restrito a administradores.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    ResponseEntity<Page<UsuarioInfoResponse>> buscarTodos(
            @Parameter(description = "Filtrar por status ativo/inativo") Boolean ativo,
            Pageable pageable);

    @Operation(summary = "Buscar usuário por ID (ADMIN)", description = "Retorna os detalhes de um usuário específico por ID. Acesso restrito a administradores.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuário encontrado"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    ResponseEntity<UsuarioInfoResponse> buscarPorId(@Parameter(description = "ID do usuário") UUID id);

    @Operation(summary = "Desativar usuário (ADMIN)", description = "Inativa a conta de um usuário. Acesso restrito a administradores.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Usuário desativado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    ResponseEntity<Void> desativar(@Parameter(description = "ID do usuário") UUID id);

    @Operation(summary = "Reativar usuário (ADMIN)", description = "Reativa a conta de um usuário inativo. Acesso restrito a administradores.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Usuário reativado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    ResponseEntity<Void> reativar(@Parameter(description = "ID do usuário") UUID id);
}