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

import com.petajuda.controllers.docs.CampanhaControllerDoc;
import com.petajuda.dtos.request.CampanhaRequest;
import com.petajuda.dtos.response.CampanhaResponse;
import com.petajuda.security.details.CustomUserDetails;
import com.petajuda.services.CampanhaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/campanhas")
public class CampanhaController implements CampanhaControllerDoc {

    // Dependencias da classe
    private final CampanhaService campanhaService;

    // Injecao das dependencias via construtor
    public CampanhaController(CampanhaService campanhaService) {
        this.campanhaService = campanhaService;
    }

    // Cadastra uma nova campanha vinculada a ONG do usuario logado
    @Override
    @PostMapping
    public ResponseEntity<CampanhaResponse> salvar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CampanhaRequest request) {
        CampanhaResponse response = campanhaService.salvar(userDetails.getId(), request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(uri).body(response);
    }

    // Busca uma campanha especifica por ID
    @Override
    @GetMapping("/{id}")
    public ResponseEntity<CampanhaResponse> buscarPorId(@PathVariable UUID id) {
        CampanhaResponse response = campanhaService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    // Lista todas as campanhas cadastradas no sistema
    @Override
    @GetMapping
    public ResponseEntity<List<CampanhaResponse>> buscarTodas() {
        List<CampanhaResponse> campanhas = campanhaService.buscarTodas();
        return ResponseEntity.ok(campanhas);
    }

    // Busca todas as campanhas de uma ONG especifica
    @Override
    @GetMapping("/ong/{ongId}")
    public ResponseEntity<List<CampanhaResponse>> buscarPorOng(@PathVariable UUID ongId) {
        List<CampanhaResponse> campanhas = campanhaService.buscarPorOng(ongId);
        return ResponseEntity.ok(campanhas);
    }

    // Atualiza os dados de uma campanha pertencente a ONG do usuario logado
    @Override
    @PutMapping("/{id}")
    public ResponseEntity<CampanhaResponse> atualizar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody CampanhaRequest request) {
        CampanhaResponse response = campanhaService.atualizar(userDetails.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    // Altera o status (ativa/inativa) de uma campanha
    @Override
    @PatchMapping("/{id}/status")
    public ResponseEntity<CampanhaResponse> alterarStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id,
            @RequestParam Boolean ativo) {
        CampanhaResponse response = campanhaService.alterarStatus(userDetails.getId(), id, ativo);
        return ResponseEntity.ok(response);
    }

    // Exclui uma campanha da ONG do usuario logado
    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        campanhaService.excluir(userDetails.getId(), id);
        return ResponseEntity.noContent().build();
    }
}