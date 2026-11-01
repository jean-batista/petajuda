package com.petajuda.security.details;

import com.petajuda.exceptions.UsuarioNaoEncontradoException;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // return usuarioRepository.findByEmail(username)
        //         .map(CustomUserDetails::new)
        //         .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado " + username));
        Usuario usuario = usuarioRepository.findByEmail(username);
        if(usuario == null) throw new UsuarioNaoEncontradoException("Usuário não encontrado " + username);
        return new CustomUserDetails(usuario);
    }
}
