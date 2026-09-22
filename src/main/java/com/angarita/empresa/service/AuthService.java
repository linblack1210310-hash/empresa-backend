package com.angarita.empresa.service;

import com.angarita.empresa.dto.AuthResponse;
import com.angarita.empresa.dto.LoginRequest;
import com.angarita.empresa.dto.RegisterRequest;
import com.angarita.empresa.model.Usuario;
import com.angarita.empresa.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, 
                       PasswordEncoder passwordEncoder, 
                       JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse registrar(RegisterRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El nombre de usuario ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        
        String rol = (request.getRol() != null && !request.getRol().trim().isEmpty()) 
                     ? request.getRol() 
                     : "USER";
        usuario.setRol(rol);

        usuarioRepository.save(usuario);

        String token = jwtService.generateToken(usuario.getUsername(), usuario.getRol());
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Usuario o contraseña incorrectos");
        }

        String token = jwtService.generateToken(usuario.getUsername(), usuario.getRol());
        return new AuthResponse(token);
    }
}