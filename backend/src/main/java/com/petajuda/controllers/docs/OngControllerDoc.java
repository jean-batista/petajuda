package com.petajuda.controllers.docs;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;

import com.petajuda.dtos.request.OngRequest;
import com.petajuda.dtos.response.OngResponse;
import com.petajuda.security.details.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "ONGs", description = "Endpoints para cadastro e gestão de perfis institucionais de ONGs")
public interface OngControllerDoc {

    @Operation(summary = "Cadastrar ONG", description = "Cadastra um perfil institucional de ONG vinculado à conta do usuário logado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "ONG cadastrada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados da ONG inválidos ou usuário já possui ONG"),
        @ApiResponse(responseCode = "401", description = "Não autorizado")
    })
    ResponseEntity<OngResponse> salvar(CustomUserDetails userDetails, OngRequest request);

    @Operation(summary = "Buscar ONG por ID", description = "Exibe o perfil público de uma ONG (Chave Pix, endereço e contatos).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "ONG encontrada"),
        @ApiResponse(responseCode = "404", description = "ONG não encontrada")
    })
    ResponseEntity<OngResponse> buscarPorId(@Parameter(description = "ID da ONG") UUID id);

    @Operation(summary = "Listar todas as ONGs", description = "Retorna o diretório público de todas as ONGs parceiras cadastradas.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    ResponseEntity<List<OngResponse>> buscarOngs();

    @Operation(summary = "Atualizar ONG", description = "Atualiza os dados institucionais da própria ONG do usuário logado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "ONG atualizada com sucesso"),
        @ApiResponse(responseCode = "403", description = "Sem permissão para alterar esta ONG"),
        @ApiResponse(responseCode = "404", description = "ONG não encontrada")
    })
    ResponseEntity<OngResponse> atualizar(CustomUserDetails userDetails, UUID id, OngRequest request);

    @Operation(summary = "Excluir ONG", description = "Exclui o perfil institucional da ONG do usuário logado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "ONG excluída com sucesso"),
        @ApiResponse(responseCode = "403", description = "Sem permissão para excluir esta ONG"),
        @ApiResponse(responseCode = "404", description = "ONG não encontrada")
    })
    ResponseEntity<Void> excluir(CustomUserDetails userDetails, UUID id);
}