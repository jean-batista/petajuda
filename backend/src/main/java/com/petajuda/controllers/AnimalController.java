package com.petajuda.controllers;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.petajuda.controllers.docs.AnimalControllerDoc;
import com.petajuda.dtos.request.AnimalRequest;
import com.petajuda.dtos.response.AnimalResponse;
import com.petajuda.security.details.CustomUserDetails;
import com.petajuda.services.AnimalService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/animais")
public class AnimalController implements AnimalControllerDoc {

    // Dependencias da classe
    private final AnimalService animalService;

    // Injecao das dependencias via controller
    public AnimalController(AnimalService animalService) {
        this.animalService = animalService;
    }

    // Cadastra um novo animal vinculado ao usuario logado
    @Override
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnimalResponse> salvar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestPart("dados") @Valid AnimalRequest request,
            @RequestPart("foto") MultipartFile foto) {

        AnimalResponse response = animalService.salvar(userDetails.getId(), request, foto);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(uri).body(response);
    }

    // Busca um animal especifico pelo ID
    @Override
    @GetMapping("/{id}")
    public ResponseEntity<AnimalResponse> buscarPorId(@PathVariable UUID id) {
        AnimalResponse response = animalService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    // Retorna todos os animais pertencentes ao usuario logado
    @GetMapping("/meus-animais")
    @Override
    public ResponseEntity<List<AnimalResponse>> buscarMeusAnimais(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<AnimalResponse> animais = animalService.buscarAnimaisPorUsuarioId(userDetails.getId());
        return ResponseEntity.ok(animais);
    }

    // Busca os animais de um usuario específico por ID
    @GetMapping("/usuario/{usuarioId}")
    @Override
    public ResponseEntity<List<AnimalResponse>> buscarAnimaisPorUsuarioId(@PathVariable UUID usuarioId) {
        List<AnimalResponse> animais = animalService.buscarAnimaisPorUsuarioId(usuarioId);
        return ResponseEntity.ok(animais);
    }

    // Atualiza os dados de um animal do proprio usuario logado
    @PutMapping("/{id}")
    @Override
    public ResponseEntity<AnimalResponse> atualizar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody AnimalRequest request) {
        AnimalResponse response = animalService.atualizar(userDetails.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    // Remove o registro de um animal pertencente ao usuario logado
    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        animalService.excluir(userDetails.getId(), id);
        return ResponseEntity.noContent().build();
    }
}