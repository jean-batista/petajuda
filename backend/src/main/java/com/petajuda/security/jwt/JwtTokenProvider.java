package com.petajuda.security.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.petajuda.dtos.response.UsuarioAutenticacaoInfoResponse;
import com.petajuda.enums.PerfilUsuario;
import com.petajuda.exceptions.TokenInvalidoException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.*;

@Service
public class JwtTokenProvider {

    @Value("${security.jwt.token.secret-key}")
    private String key;

    @Value("${security.jwt.token.expire-length}")
    private Long validityTimeInMilliseconds;

    @Autowired
    private UserDetailsService userDetailsService;

    private Algorithm algorithm = null;

    @PostConstruct
    protected void init() {
        this.key = Base64.getEncoder().encodeToString(key.getBytes());
        this.algorithm = Algorithm.HMAC256(key.getBytes());
    }

    public UsuarioAutenticacaoInfoResponse createToken(UUID id, String nomeCompleto, String usuario, PerfilUsuario perfil) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityTimeInMilliseconds);
        String issueUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();

        String token = JWT.create()
                .withClaim("id", id.toString())
                .withClaim("nomeCompleto", nomeCompleto)
                .withClaim("perfil", perfil.toString())
                .withIssuedAt(now)
                .withExpiresAt(validity)
                .withSubject(usuario)
                .withIssuer(issueUrl)
                .sign(algorithm);

        return new UsuarioAutenticacaoInfoResponse(id, nomeCompleto, usuario, perfil, token);
    }

    public UsuarioAutenticacaoInfoResponse refreshToken(String refreshToken) {
        if(!refreshToken.contains("Bearer ")) throw new TokenInvalidoException("Token JWT inválido");
        String token = refreshToken.substring("Bearer ".length());
        JWTVerifier verifier = JWT.require(algorithm).build();
        DecodedJWT decodedJWT = verifier.verify(token);

        UUID id = UUID.fromString(decodedJWT.getClaim("id").asString());
        String nomeCompleto = decodedJWT.getClaim("nomeCompleto").asString();
        String email = decodedJWT.getSubject();
        PerfilUsuario perfil = decodedJWT.getClaim("perfil").as(PerfilUsuario.class);

        return createToken(id, nomeCompleto, email, perfil);
    }

    public Authentication getAuthentication(String token) {
        Algorithm alg = Algorithm.HMAC256(key.getBytes());
        JWTVerifier verifier = JWT.require(alg).build();
        DecodedJWT decodedJWT = verifier.verify(token);
        UserDetails userDetails = this.userDetailsService.loadUserByUsername(decodedJWT.getSubject());
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    public boolean validateToken(String token) {
        try {
            JWTVerifier verifier = JWT.require(algorithm).build();
            verifier.verify(token);
            return true;
        } catch(Exception e) {
            return false;
        }
    }

}
