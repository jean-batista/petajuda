package com.petajuda.controllers;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.petajuda.controllers.docs.AutenticacaoControllerDoc;
import com.petajuda.dtos.request.UsuarioCredenciaisRequest;
import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.dtos.response.UsuarioAutenticacaoInfoResponse;
import com.petajuda.dtos.response.UsuarioInfoResponse;
import com.petajuda.services.AutenticacaoService;
import com.petajuda.services.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/autenticacao")
public class AutenticacaoController implements AutenticacaoControllerDoc {

    // Dependencias da classe
    private final AutenticacaoService autenticacaoService;
    private final UsuarioService usuarioService;

    // Injecao das dependencias via construtor 
    public AutenticacaoController(AutenticacaoService autenticacaoService, UsuarioService usuarioService) {
        this.autenticacaoService = autenticacaoService;
        this.usuarioService = usuarioService;
    }

    // Endpoint de Login: Autentica o usuario e gera o token JWT
    @Override
    @PostMapping("/login")
    public ResponseEntity<UsuarioAutenticacaoInfoResponse> login(@RequestBody @Valid UsuarioCredenciaisRequest credenciais) {
        UsuarioAutenticacaoInfoResponse response = autenticacaoService.login(credenciais);
        return ResponseEntity.ok(response);
    }

    // Endpoint de Cadastro: Cria uma nova conta e retorna o URI do novo usuario
    @Override
    @PostMapping("/cadastro")
    public ResponseEntity<UsuarioInfoResponse> register(@RequestBody @Valid UsuarioInfoRequest usuarioInfo) {
        UsuarioInfoResponse response = usuarioService.salvar(usuarioInfo);
        
        URI uri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/usuarios/{id}")
                .buildAndExpand(response.id())
                .toUri();
                
        return ResponseEntity.created(uri).body(response);
    }

    // Endpoint de Refresh Token: Renova um token JWT valido prestes a expirar
    @Override
    @PostMapping("/refresh")
    public ResponseEntity<UsuarioAutenticacaoInfoResponse> refreshToken(@RequestHeader("Authorization") String token) {
        UsuarioAutenticacaoInfoResponse response = autenticacaoService.refreshToken(token);
        return ResponseEntity.ok(response);
    }
}