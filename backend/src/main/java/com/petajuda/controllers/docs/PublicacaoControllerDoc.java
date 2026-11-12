package com.petajuda.controllers.docs;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;

import com.petajuda.dtos.request.PublicacaoRequest;
import com.petajuda.dtos.response.PublicacaoResponse;
import com.petajuda.enums.StatusPublicacao;
import com.petajuda.security.details.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Publicações", description = "Endpoints para gestão do Feed de animais perdidos, encontrados e para adoção")
public interface PublicacaoControllerDoc {

    @Operation(summary = "Criar publicação", description = "Cria uma publicação no feed vinculando um animal previamente cadastrado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Publicação criada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados da publicação inválidos"),
        @ApiResponse(responseCode = "401", description = "Não autorizado")
    })
    ResponseEntity<PublicacaoResponse> salvar(CustomUserDetails userDetails, PublicacaoRequest request, MultipartFile file);

    @Operation(summary = "Buscar publicação por ID", description = "Exibe os detalhes de uma publicação específica do feed.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Publicação encontrada"),
        @ApiResponse(responseCode = "404", description = "Publicação não encontrada")
    })
    ResponseEntity<PublicacaoResponse> buscarPorId(@Parameter(description = "ID da publicação") UUID id);

    @Operation(summary = "Feed de publicações", description = "Retorna todas as publicações ativas no sistema.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Feed retornado com sucesso")
    })
    ResponseEntity<List<PublicacaoResponse>> buscarTodas();

    @Operation(summary = "Atualizar publicação", description = "Atualiza os dados de uma publicação pertencente ao usuário logado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Publicação atualizada com sucesso"),
        @ApiResponse(responseCode = "403", description = "Sem permissão para editar esta publicação"),
        @ApiResponse(responseCode = "404", description = "Publicação não encontrada")
    })
    ResponseEntity<PublicacaoResponse> atualizar(CustomUserDetails userDetails, UUID id, PublicacaoRequest request, MultipartFile file);

    @Operation(summary = "Alterar status da publicação", description = "Altera o status da publicação (ex: de ATIVO para RESOLVIDO).")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status alterado com sucesso"),
        @ApiResponse(responseCode = "403", description = "Sem permissão para alterar o status"),
        @ApiResponse(responseCode = "404", description = "Publicação não encontrada")
    })
    ResponseEntity<PublicacaoResponse> alterarStatus(CustomUserDetails userDetails, UUID id, StatusPublicacao status);

    @Operation(summary = "Excluir publicação", description = "Remove uma publicação do feed pertencente ao usuário logado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Publicação excluída com sucesso"),
        @ApiResponse(responseCode = "403", description = "Sem permissão para excluir esta publicação"),
        @ApiResponse(responseCode = "404", description = "Publicação não encontrada")
    })
    ResponseEntity<Void> excluir(CustomUserDetails userDetails, UUID id);
}