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

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse registrar(RegisterRequest request) {

        if (usuarioRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("El nombre de usuario ya está registrado");
        }

        Usuario usuario = Usuario.builder()
                .username(request.getUsername())
                .email(request.getUsername())
                .nombre(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol() != null ? request.getRol() : "USER")
                .build();

        usuarioRepository.save(usuario);

        // Access Token
        String token = jwtService.generateToken(usuario);

        // Refresh Token
        String refreshToken = jwtService.generateRefreshToken(usuario);

        return new AuthResponse(token, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                usuario.getPassword()
        )) {
            throw new RuntimeException("Credenciales inválidas");
        }

        // Access Token
        String token = jwtService.generateToken(usuario);

        // Refresh Token
        String refreshToken = jwtService.generateRefreshToken(usuario);

        return new AuthResponse(token, refreshToken);
    }
}