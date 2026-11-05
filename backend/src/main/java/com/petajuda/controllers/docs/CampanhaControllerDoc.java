package com.petajuda.controllers.docs;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;

import com.petajuda.dtos.request.CampanhaRequest;
import com.petajuda.dtos.response.CampanhaResponse;
import com.petajuda.security.details.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Campanhas", description = "Endpoints para divulgação de feiras, vaquinhas e campanhas institucionais de ONGs")
public interface CampanhaControllerDoc {

    @Operation(summary = "Criar campanha", description = "Cadastra uma nova campanha vinculada à ONG do usuário logado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Campanha cadastrada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados da campanha inválidos"),
        @ApiResponse(responseCode = "401", description = "Não autorizado / Usuário não possui ONG")
    })
    ResponseEntity<CampanhaResponse> salvar(CustomUserDetails userDetails, CampanhaRequest request);

    @Operation(summary = "Buscar campanha por ID", description = "Retorna os detalhes de uma campanha específica.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Campanha encontrada"),
        @ApiResponse(responseCode = "404", description = "Campanha não encontrada")
    })
    ResponseEntity<CampanhaResponse> buscarPorId(@Parameter(description = "ID da campanha") UUID id);

    @Operation(summary = "Listar todas as campanhas", description = "Retorna uma lista com todas as campanhas cadastradas.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    ResponseEntity<List<CampanhaResponse>> buscarTodas();

    @Operation(summary = "Listar campanhas por ONG", description = "Retorna as campanhas cadastradas por uma ONG específica.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
        @ApiResponse(responseCode = "404", description = "ONG não encontrada")
    })
    ResponseEntity<List<CampanhaResponse>> buscarPorOng(@Parameter(description = "ID da ONG") UUID ongId);

    @Operation(summary = "Atualizar campanha", description = "Atualiza os dados de uma campanha pertencente à ONG do usuário logado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Campanha atualizada com sucesso"),
        @ApiResponse(responseCode = "403", description = "Sem permissão para alterar esta campanha"),
        @ApiResponse(responseCode = "404", description = "Campanha não encontrada")
    })
    ResponseEntity<CampanhaResponse> atualizar(CustomUserDetails userDetails, UUID id, CampanhaRequest request);

    @Operation(summary = "Alterar status da campanha", description = "Ativa ou desativa uma campanha de arrecadação/evento.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status alterado com sucesso"),
        @ApiResponse(responseCode = "403", description = "Sem permissão para alterar esta campanha"),
        @ApiResponse(responseCode = "404", description = "Campanha não encontrada")
    })
    ResponseEntity<CampanhaResponse> alterarStatus(CustomUserDetails userDetails, UUID id, Boolean ativo);

    @Operation(summary = "Excluir campanha", description = "Remove uma campanha cadastrada da ONG do usuário logado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Campanha excluída com sucesso"),
        @ApiResponse(responseCode = "403", description = "Sem permissão para excluir esta campanha"),
        @ApiResponse(responseCode = "404", description = "Campanha não encontrada")
    })
    ResponseEntity<Void> excluir(CustomUserDetails userDetails, UUID id);
}