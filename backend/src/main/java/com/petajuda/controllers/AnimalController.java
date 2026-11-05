package com.petajuda.controllers;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.petajuda.dtos.request.AnimalRequest;
import com.petajuda.dtos.response.AnimalResponse;
import com.petajuda.security.details.CustomUserDetails;
import com.petajuda.services.AnimalService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/animais")
public class AnimalController {

    // Dependencias da classe
    private final AnimalService animalService;

    // Injecao das dependencias via controller
    public AnimalController(AnimalService animalService) {
        this.animalService = animalService;
    }

    // Cadastra um novo animal vinculado ao usuario logado
    @PostMapping
    public ResponseEntity<AnimalResponse> salvar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AnimalRequest request) {
        AnimalResponse response = animalService.salvar(userDetails.getId(), request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(uri).body(response);
    }

    // Busca um animal especifico pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<AnimalResponse> buscarPorId(@PathVariable UUID id) {
        AnimalResponse response = animalService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    // Retorna todos os animais pertencentes ao usuario logado
    @GetMapping("/meus-animais")
    public ResponseEntity<List<AnimalResponse>> buscarMeusAnimais(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<AnimalResponse> animais = animalService.buscarAnimaisPorUsuarioId(userDetails.getId());
        return ResponseEntity.ok(animais);
    }

    // Busca os animais de um usuario específico por ID
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<AnimalResponse>> buscarAnimaisPorUsuarioId(@PathVariable UUID usuarioId) {
        List<AnimalResponse> animais = animalService.buscarAnimaisPorUsuarioId(usuarioId);
        return ResponseEntity.ok(animais);
    }

    // Atualiza os dados de um animal do proprio usuario logado
    @PutMapping("/{id}")
    public ResponseEntity<AnimalResponse> atualizar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody AnimalRequest request) {
        AnimalResponse response = animalService.atualizar(userDetails.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    // Remove o registro de um animal pertencente ao usuario logado
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        animalService.excluir(userDetails.getId(), id);
        return ResponseEntity.noContent().build();
    }
}