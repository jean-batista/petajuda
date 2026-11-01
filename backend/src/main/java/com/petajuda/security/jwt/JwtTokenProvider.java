package com.petajuda.security.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.petajuda.dtos.response.UsuarioInfoResponse;
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

    public UsuarioInfoResponse createToken(UUID id, String nomeCompleto, String usuario, Set<PerfilUsuario> perfil) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityTimeInMilliseconds);
        String issueUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();

        String token = JWT.create()
                .withClaim("id", id.toString())
                .withClaim("nomeCompleto", nomeCompleto)
                .withClaim("perfil", perfil.stream().map(PerfilUsuario::name).toList())
                .withIssuedAt(now)
                .withExpiresAt(validity)
                .withSubject(usuario)
                .withIssuer(issueUrl)
                .sign(algorithm);

        return new UsuarioInfoResponse(id, nomeCompleto, usuario, perfil, token);
    }

    public UsuarioInfoResponse refreshToken(String refreshToken) {
        if(!refreshToken.contains("Bearer ")) throw new TokenInvalidoException("Token JWT inválido");
        String token = refreshToken.substring("Bearer ".length());
        JWTVerifier verifier = JWT.require(algorithm).build();
        DecodedJWT decodedJWT = verifier.verify(token);

        UUID id = UUID.fromString(decodedJWT.getClaim("id").asString());
        String fullName = decodedJWT.getClaim("fullName").asString();
        String username = decodedJWT.getSubject();
        Set<PerfilUsuario> roles = new HashSet<>(decodedJWT.getClaim("roles").asList(PerfilUsuario.class));

        return createToken(id, fullName, username, roles);
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
