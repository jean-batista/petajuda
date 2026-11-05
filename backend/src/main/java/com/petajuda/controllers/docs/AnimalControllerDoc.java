package com.petajuda.controllers.docs;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;

import com.petajuda.dtos.request.AnimalRequest;
import com.petajuda.dtos.response.AnimalResponse;
import com.petajuda.security.details.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Animais", description = "Endpoints para cadastro e gestão de fichas de animais")
public interface AnimalControllerDoc {

    @Operation(summary = "Cadastrar animal", description = "Cadastra uma nova ficha de animal vinculada ao usuário logado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Animal cadastrado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados do animal inválidos"),
        @ApiResponse(responseCode = "401", description = "Não autorizado")
    })
    ResponseEntity<AnimalResponse> salvar(CustomUserDetails userDetails, AnimalRequest request);

    @Operation(summary = "Buscar animal por ID", description = "Retorna os detalhes de um animal cadastrado pelo seu UUID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Animal encontrado"),
        @ApiResponse(responseCode = "404", description = "Animal não encontrado")
    })
    ResponseEntity<AnimalResponse> buscarPorId(@Parameter(description = "ID do animal") UUID id);

    @Operation(summary = "Listar meus animais", description = "Retorna todos os animais cadastrados pelo usuário autenticado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de animais retornada com sucesso"),
        @ApiResponse(responseCode = "401", description = "Não autorizado")
    })
    ResponseEntity<List<AnimalResponse>> buscarMeusAnimais(CustomUserDetails userDetails);

    @Operation(summary = "Listar animais por ID de usuário", description = "Retorna todos os animais cadastrados por um usuário específico.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    ResponseEntity<List<AnimalResponse>> buscarAnimaisPorUsuarioId(@Parameter(description = "ID do usuário") UUID usuarioId);

    @Operation(summary = "Atualizar animal", description = "Atualiza as informações de um animal pertencente ao usuário logado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Animal atualizado com sucesso"),
        @ApiResponse(responseCode = "403", description = "Sem permissão para alterar este animal"),
        @ApiResponse(responseCode = "404", description = "Animal não encontrado")
    })
    ResponseEntity<AnimalResponse> atualizar(CustomUserDetails userDetails, UUID id, AnimalRequest request);

    @Operation(summary = "Excluir animal", description = "Remove o registro de um animal pertencente ao usuário logado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Animal excluído com sucesso"),
        @ApiResponse(responseCode = "403", description = "Sem permissão para excluir este animal"),
        @ApiResponse(responseCode = "404", description = "Animal não encontrado")
    })
    ResponseEntity<Void> excluir(CustomUserDetails userDetails, UUID id);
}