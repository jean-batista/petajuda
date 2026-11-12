package com.petajuda.controllers.docs;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;

import com.petajuda.dtos.request.DenunciaRequest;
import com.petajuda.dtos.response.DenunciaResponse;
import com.petajuda.enums.StatusDenuncia;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Denúncias", description = "Endpoints para registro anônimo e triagem administrativa de denúncias")
public interface DenunciaControllerDoc {

    @Operation(summary = "Registrar denúncia anônima", description = "Permite o envio sigiloso de relatos de maus-tratos ou abandono sem necessidade de login.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Denúncia registrada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados da denúncia inválidos")
    })
    ResponseEntity<DenunciaResponse> salvar(DenunciaRequest request, MultipartFile file);

    @Operation(summary = "Buscar denúncia por ID (ADMIN)", description = "Exibe os detalhes de uma ocorrência para triagem. Restrito a administradores.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Denúncia encontrada"),
        @ApiResponse(responseCode = "403", description = "Acesso negado"),
        @ApiResponse(responseCode = "404", description = "Denúncia não encontrada")
    })
    ResponseEntity<DenunciaResponse> buscarPorId(@Parameter(description = "ID da denúncia") UUID id);

    @Operation(summary = "Listar todas as denúncias (ADMIN)", description = "Retorna a central de triagem com todas as denúncias registradas. Restrito a administradores.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de denúncias retornada com sucesso"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    ResponseEntity<List<DenunciaResponse>> buscarTodas();

    @Operation(summary = "Alterar status da denúncia (ADMIN)", description = "Atualiza a situação da denúncia (ex: PENDENTE -> EM_ANALISE / CONCLUIDA). Restrito a administradores.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status alterado com sucesso"),
        @ApiResponse(responseCode = "403", description = "Acesso negado"),
        @ApiResponse(responseCode = "404", description = "Denúncia não encontrada")
    })
    ResponseEntity<DenunciaResponse> alterarStatus(UUID id, StatusDenuncia status);

    @Operation(summary = "Excluir denúncia (ADMIN)", description = "Remove um registro de denúncia do sistema. Restrito a administradores.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Denúncia excluída com sucesso"),
        @ApiResponse(responseCode = "403", description = "Acesso negado"),
        @ApiResponse(responseCode = "404", description = "Denúncia não encontrada")
    })
    ResponseEntity<Void> excluir(UUID id);
}