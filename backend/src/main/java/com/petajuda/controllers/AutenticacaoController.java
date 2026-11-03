package com.petajuda.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.petajuda.dtos.request.UsuarioCredenciaisRequest;
import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.dtos.response.UsuarioAutenticacaoInfoResponse;
import com.petajuda.dtos.response.UsuarioInfoResponse;
import com.petajuda.services.AutenticacaoService;
import com.petajuda.services.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/autenticacao")
public class AutenticacaoController {

    @Autowired
    private AutenticacaoService autenticacaoService;

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<UsuarioAutenticacaoInfoResponse> login(@RequestBody @Valid UsuarioCredenciaisRequest credenciais) {
        UsuarioAutenticacaoInfoResponse response = autenticacaoService.login(credenciais);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cadastro")
    public ResponseEntity<UsuarioInfoResponse> register(@RequestBody @Valid UsuarioInfoRequest usuarioInfo) {
        UsuarioInfoResponse response = usuarioService.salvar(usuarioInfo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<UsuarioAutenticacaoInfoResponse> refreshToken(@RequestHeader("Authorization") String token) {
        UsuarioAutenticacaoInfoResponse response = autenticacaoService.refreshToken(token);
        return ResponseEntity.ok(response);
    }
}