package com.petajuda.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petajuda.exceptions.response.ExceptionResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;
import java.util.Date;

public class JwtTokenFilter extends GenericFilterBean {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public JwtTokenFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain filter) throws IOException, ServletException {
        try {
            var token = "";
            HttpServletRequest httpServletRequest = (HttpServletRequest) request;
            String bearerToken = httpServletRequest.getHeader("Authorization");

            if (bearerToken != null) {
                if (bearerToken.contains("Bearer ")) token = bearerToken.substring("Bearer ".length());
            }

            if (!token.isBlank() && jwtTokenProvider.validateToken(token)) {
                Authentication authentication = jwtTokenProvider.getAuthentication(token);
                if (authentication != null) {
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
            filter.doFilter(request, response);

        } catch(UsernameNotFoundException e) {
            SecurityContextHolder.clearContext();
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            ObjectMapper mapper = new ObjectMapper();

            ExceptionResponse exceptionResponse = new ExceptionResponse(
                    new Date(),
                    "Usuário não encontrado",
                    "Token inválido"
            );

            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json; charset=UTF-8");
            httpResponse.getWriter().write(mapper.writeValueAsString(exceptionResponse));

        }

    }

}