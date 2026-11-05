package com.petajuda.controllers;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.petajuda.dtos.request.PublicacaoRequest;
import com.petajuda.dtos.response.PublicacaoResponse;
import com.petajuda.enums.StatusPublicacao;
import com.petajuda.security.details.CustomUserDetails;
import com.petajuda.services.PublicacaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/publicacoes")
public class PublicacaoController {

    private final PublicacaoService publicacaoService;

    public PublicacaoController(PublicacaoService publicacaoService) {
        this.publicacaoService = publicacaoService;
    }

    // Cria uma nova publicacao
    @PostMapping
    public ResponseEntity<PublicacaoResponse> salvar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PublicacaoRequest request) {
        PublicacaoResponse response = publicacaoService.salvar(userDetails.getId(), request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(uri).body(response);
    }

    // Busca uma publicacao específica por ID
    @GetMapping("/{id}")
    public ResponseEntity<PublicacaoResponse> buscarPorId(@PathVariable UUID id) {
        PublicacaoResponse response = publicacaoService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    // Feed geral publico de publicacoes
    @GetMapping
    public ResponseEntity<List<PublicacaoResponse>> buscarTodas() {
        List<PublicacaoResponse> publicacoes = publicacaoService.buscarTodas();
        return ResponseEntity.ok(publicacoes);
    }

    // Atualiza o conteudo de uma publicacao do usuario logado
    @PutMapping("/{id}")
    public ResponseEntity<PublicacaoResponse> atualizar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody PublicacaoRequest request) {
        PublicacaoResponse response = publicacaoService.atualizar(userDetails.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    // Altera o status da publicacao
    @PatchMapping("/{id}/status")
    public ResponseEntity<PublicacaoResponse> alterarStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id,
            @RequestParam StatusPublicacao status) {
        PublicacaoResponse response = publicacaoService.alterarStatus(userDetails.getId(), id, status);
        return ResponseEntity.ok(response);
    }

    // Exclui uma publicacao pertencente ao usuario logado
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        publicacaoService.excluir(userDetails.getId(), id);
        return ResponseEntity.noContent().build();
    }
}