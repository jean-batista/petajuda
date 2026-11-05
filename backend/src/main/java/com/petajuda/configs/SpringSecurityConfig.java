package com.petajuda.configs;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.petajuda.security.jwt.JwtTokenFilter;
import com.petajuda.security.jwt.JwtTokenProvider;

@EnableWebSecurity
@Configuration
public class SpringSecurityConfig {

    // Dependencias da classe
    private final JwtTokenProvider tokenProvider;

    // Injecao das dependencias via construtor
    public SpringSecurityConfig(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    // Bean responsavel por fazer a criptografia da senha
    @Bean
    public PasswordEncoder passwordEncoder() {
        PasswordEncoder encoder = new Pbkdf2PasswordEncoder(
                "",
                8,
                185000,
                Pbkdf2PasswordEncoder.SecretKeyFactoryAlgorithm.PBKDF2WithHmacSHA256
        );
        Map<String, PasswordEncoder> encoders = new HashMap<>();
        encoders.put("pbkdf2", encoder);
        DelegatingPasswordEncoder passwordEncoder = new DelegatingPasswordEncoder("pbkdf2", encoders);
        passwordEncoder.setDefaultPasswordEncoderForMatches(encoder);
        return passwordEncoder;
    }

    // Bean responsavel por fazer a autenticacao do Usuario
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // Bean responsavel pela configuracao do cors
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        // Endpoints permitidos no cors
        List<String> allowedOrigins = List.of(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002"
        );

        CorsConfiguration configuration = new CorsConfiguration();
        // Permite as origens do React (Vite / Create React App)
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Bean responsavel por fazer as checagens de securanca
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        // Define um filtro de seguranca
        JwtTokenFilter filter = new JwtTokenFilter(tokenProvider);

        return http
                .httpBasic(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // 1. Rotas do Erro do Spring e Documentacao OpenAPI (Swagger UI)
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // 2. Rotas Publicas de Autenticacao
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/autenticacao/login",
                                "/api/v1/autenticacao/cadastro",
                                "/api/v1/autenticacao/refresh"
                        ).permitAll()

                        // 3. Leituras Publicas (Feed, Detalhes de Pet, Perfil de ONGs, Campanhas)
                        .requestMatchers(HttpMethod.GET, "/api/v1/publicacoes/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/animais/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/ongs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/campanhas/**").permitAll()

                        // 4. Envio de Denuncia Anonima (Qualquer cidadao pode enviar)
                        .requestMatchers(HttpMethod.POST, "/api/v1/denuncias").permitAll()

                        // 5. Rotas Restritas a Administradores (ADMIN)
                        .requestMatchers(HttpMethod.GET, "/api/v1/denuncias/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/denuncias/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/denuncias/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/usuarios", "/api/v1/usuarios/{id}", "/api/v1/usuarios/{id}/desativar", "/api/v1/usuarios/{id}/reativar").hasRole("ADMIN")

                        // 6. Qualquer outra requisicao exige autenticacao (Token JWT Valido)
                        .anyRequest().authenticated()
                )
                .build();
    }

}