package com.petajuda.controllers;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.petajuda.controllers.docs.DenunciaControllerDoc;
import com.petajuda.dtos.request.DenunciaRequest;
import com.petajuda.dtos.response.DenunciaResponse;
import com.petajuda.enums.StatusDenuncia;
import com.petajuda.services.DenunciaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/denuncias")
public class DenunciaController implements DenunciaControllerDoc {

    // Dependencias da classe
    private final DenunciaService denunciaService;

    // Injecao das dependencias via construtor
    public DenunciaController(DenunciaService denunciaService) {
        this.denunciaService = denunciaService;
    }

    // Envio de denuncia anonima
    @Override
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DenunciaResponse> salvar(
            @RequestPart("dados") @Valid DenunciaRequest request,
            @RequestPart("foto") MultipartFile foto) {
        DenunciaResponse response = denunciaService.salvar(request, foto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(uri).body(response);
    }

    // Busca uma denuncia por ID
    @Override
    @GetMapping("/{id}")
    public ResponseEntity<DenunciaResponse> buscarPorId(@PathVariable UUID id) {
        DenunciaResponse response = denunciaService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    // Lista todas as denuncias para o painel de triagem
    @Override
    @GetMapping
    public ResponseEntity<List<DenunciaResponse>> buscarTodas() {
        List<DenunciaResponse> denuncias = denunciaService.buscarTodas();
        return ResponseEntity.ok(denuncias);
    }

    // Altera o status da denuncia
    @Override
    @PatchMapping("/{id}/status")
    public ResponseEntity<DenunciaResponse> alterarStatus(
            @PathVariable UUID id,
            @RequestParam StatusDenuncia status) {
        DenunciaResponse response = denunciaService.alterarStatus(id, status);
        return ResponseEntity.ok(response);
    }

    // Exclui uma denuncia
    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        denunciaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}