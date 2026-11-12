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

import com.petajuda.controllers.docs.PublicacaoControllerDoc;
import com.petajuda.dtos.request.PublicacaoRequest;
import com.petajuda.dtos.response.PublicacaoResponse;
import com.petajuda.enums.StatusPublicacao;
import com.petajuda.security.details.CustomUserDetails;
import com.petajuda.services.PublicacaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/publicacoes")
public class PublicacaoController implements PublicacaoControllerDoc {

    // Dependencias da classe
    private final PublicacaoService publicacaoService;

    // Injecao das dependencias via construtor
    public PublicacaoController(PublicacaoService publicacaoService) {
        this.publicacaoService = publicacaoService;
    }

    // Cria uma nova publicacao
    @Override
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PublicacaoResponse> salvar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestPart("dados") @Valid PublicacaoRequest request,
            @RequestPart("foto") MultipartFile file) {
        PublicacaoResponse response = publicacaoService.salvar(userDetails.getId(), request, file);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(uri).body(response);
    }

    // Busca uma publicacao específica por ID
    @Override
    @GetMapping("/{id}")
    public ResponseEntity<PublicacaoResponse> buscarPorId(@PathVariable UUID id) {
        PublicacaoResponse response = publicacaoService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    // Feed geral publico de publicacoes
    @Override
    @GetMapping
    public ResponseEntity<List<PublicacaoResponse>> buscarTodas() {
        List<PublicacaoResponse> publicacoes = publicacaoService.buscarTodas();
        return ResponseEntity.ok(publicacoes);
    }

    // Atualiza o conteudo de uma publicacao do usuario logado
    @Override
    @PutMapping("/{id}")
    public ResponseEntity<PublicacaoResponse> atualizar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id,
            @RequestPart("dados") @Valid PublicacaoRequest request,
            @RequestPart("foto") MultipartFile file) {
        PublicacaoResponse response = publicacaoService.atualizar(userDetails.getId(), id, request, file);
        return ResponseEntity.ok(response);
    }

    // Altera o status da publicacao
    @Override
    @PatchMapping("/{id}/status")
    public ResponseEntity<PublicacaoResponse> alterarStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id,
            @RequestParam StatusPublicacao status) {
        PublicacaoResponse response = publicacaoService.alterarStatus(userDetails.getId(), id, status);
        return ResponseEntity.ok(response);
    }

    // Exclui uma publicacao pertencente ao usuario logado
    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        publicacaoService.excluir(userDetails.getId(), id);
        return ResponseEntity.noContent().build();
    }
}