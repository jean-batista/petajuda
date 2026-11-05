package com.petajuda.controllers;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.petajuda.dtos.request.DenunciaRequest;
import com.petajuda.dtos.response.DenunciaResponse;
import com.petajuda.enums.StatusDenuncia;
import com.petajuda.services.DenunciaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/denuncias")
public class DenunciaController {

    // Dependencias da classe
    private final DenunciaService denunciaService;

    // Injecao das dependencias via construtor
    public DenunciaController(DenunciaService denunciaService) {
        this.denunciaService = denunciaService;
    }

    // Envio de denuncia anonima
    @PostMapping
    public ResponseEntity<DenunciaResponse> salvar(@Valid @RequestBody DenunciaRequest request) {
        DenunciaResponse response = denunciaService.salvar(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(uri).body(response);
    }

    // Busca uma denuncia por ID
    @GetMapping("/{id}")
    public ResponseEntity<DenunciaResponse> buscarPorId(@PathVariable UUID id) {
        DenunciaResponse response = denunciaService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    // Lista todas as denuncias para o painel de triagem
    @GetMapping
    public ResponseEntity<List<DenunciaResponse>> buscarTodas() {
        List<DenunciaResponse> denuncias = denunciaService.buscarTodas();
        return ResponseEntity.ok(denuncias);
    }

    // Altera o status da denuncia
    @PatchMapping("/{id}/status")
    public ResponseEntity<DenunciaResponse> alterarStatus(
            @PathVariable UUID id,
            @RequestParam StatusDenuncia status) {
        DenunciaResponse response = denunciaService.alterarStatus(id, status);
        return ResponseEntity.ok(response);
    }

    // Exclui uma denuncia
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        denunciaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}