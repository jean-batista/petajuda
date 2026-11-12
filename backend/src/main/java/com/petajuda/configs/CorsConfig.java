package com.petajuda.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    // Bean responsavel pela configuracao do cors
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        // Endpoints permitidos no cors
        List<String> allowedOriginsList = Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList();

        // Metodos permitidos no cors
        List<String> allowedMethodsList = List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");

        // Headers permitidos no cors
        List<String> allowedHeadersList = List.of("Authorization", "Content-Type", "Accept");

        CorsConfiguration configuration = new CorsConfiguration();
        // Permite as origens do React (Vite / Create React App)
        configuration.setAllowedOrigins(allowedOriginsList);
        configuration.setAllowedMethods(allowedMethodsList);
        configuration.setAllowedHeaders(allowedHeadersList);
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
