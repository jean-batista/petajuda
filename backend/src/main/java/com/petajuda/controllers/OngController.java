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

import com.petajuda.controllers.docs.OngControllerDoc;
import com.petajuda.dtos.request.OngRequest;
import com.petajuda.dtos.response.OngResponse;
import com.petajuda.security.details.CustomUserDetails;
import com.petajuda.services.OngService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/ongs")
public class OngController implements OngControllerDoc {

    // Dependencias da classe
    private final OngService ongService;

    // Injecao das dependencias via controller
    public OngController(OngService ongService) {
        this.ongService = ongService;
    }

    // Cadastra uma nova ONG vinculada ao usuario logado
    @Override
    @PostMapping
    public ResponseEntity<OngResponse> salvar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody OngRequest request) {
        OngResponse response = ongService.salvar(userDetails.getId(), request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(uri).body(response);
    }

    // Busca uma ONG especifica por ID
    @Override
    @GetMapping("/{id}")
    public ResponseEntity<OngResponse> buscarPorId(@PathVariable UUID id) {
        OngResponse response = ongService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    // Lista todas as ONGs cadastradas no sistema
    @Override
    @GetMapping
    public ResponseEntity<List<OngResponse>> buscarOngs() {
        List<OngResponse> ongs = ongService.buscarOngs();
        return ResponseEntity.ok(ongs);
    }

    // Atualiza os dados da propria ONG do usuario logado
    @Override
    @PutMapping("/{id}")
    public ResponseEntity<OngResponse> atualizar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody OngRequest request) {
        OngResponse response = ongService.atualizar(userDetails.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    // Exclui a ONG do usuario logado
    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        ongService.excluir(userDetails.getId(), id);
        return ResponseEntity.noContent().build();
    }
}