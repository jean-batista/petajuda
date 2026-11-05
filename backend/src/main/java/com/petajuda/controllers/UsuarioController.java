package com.petajuda.controllers;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.petajuda.dtos.request.AtualizarEmailUsuarioRequest;
import com.petajuda.dtos.request.AtualizarPerfilUsuarioRequest;
import com.petajuda.dtos.request.AtualizarSenhaUsuarioRequest;
import com.petajuda.dtos.response.UsuarioAutenticacaoInfoResponse;
import com.petajuda.dtos.response.UsuarioInfoResponse;
import com.petajuda.security.details.CustomUserDetails;
import com.petajuda.services.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

    // Dependencias da classe
    private final UsuarioService usuarioService;

    // Injecao das dependencias via construtor
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // Retorna o perfil do usuario logado
    @GetMapping("/me")
    public ResponseEntity<UsuarioInfoResponse> me(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UsuarioInfoResponse usuario = usuarioService.buscarPorId(userDetails.getId());
        return ResponseEntity.ok(usuario);
    }

    // Atualiza os dados basicos do perfil do proprio usuario logado
    @PutMapping("/me")
    public ResponseEntity<UsuarioInfoResponse> atualizarPerfil(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AtualizarPerfilUsuarioRequest request) {
        UsuarioInfoResponse atualizado = usuarioService.atualizar(userDetails.getId(), request);
        return ResponseEntity.ok(atualizado);
    }

    // Altera a senha do usuario logado
    @PatchMapping("/me/senha")
    public ResponseEntity<Void> atualizarSenha(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AtualizarSenhaUsuarioRequest request) {
        usuarioService.atualizarSenha(userDetails.getId(), request);
        return ResponseEntity.noContent().build();
    }

    // Altera o email do usuario logado e gera um novo token JWT
    @PatchMapping("/me/email")
    public ResponseEntity<UsuarioAutenticacaoInfoResponse> atualizarEmail(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AtualizarEmailUsuarioRequest request) {
        UsuarioAutenticacaoInfoResponse novoToken = usuarioService.atualizarEmail(userDetails.getId(), request);
        return ResponseEntity.ok(novoToken);
    }

    // Endpoint restrito a Administradores para listagem geral de usuarios
    @GetMapping
    public ResponseEntity<Page<UsuarioInfoResponse>> buscarTodos(
            @RequestParam(required = false) Boolean ativo,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<UsuarioInfoResponse> usuarios = usuarioService.buscarTodos(ativo, pageable);
        return ResponseEntity.ok(usuarios);
    }

    // Endpoint restrito a Administradores para busca individual por ID
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioInfoResponse> buscarPorId(@PathVariable UUID id) {
        UsuarioInfoResponse usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.ok(usuario);
    }

    // Endpoint restrito a Administradores para desativar um usuário
    @PatchMapping("/{id}/desativar")
    public ResponseEntity<Void> desativar(@PathVariable UUID id) {
        usuarioService.desativar(id);
        return ResponseEntity.noContent().build();
    }

    // Endpoint restrito a Administradores para reativar um usuário
    @PatchMapping("/{id}/reativar")
    public ResponseEntity<Void> reativar(@PathVariable UUID id) {
        usuarioService.reativar(id);
        return ResponseEntity.noContent().build();
    }
}