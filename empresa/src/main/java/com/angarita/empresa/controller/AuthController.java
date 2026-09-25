package com.angarita.empresa.controller;

import com.angarita.empresa.dto.AuthResponse;
import com.angarita.empresa.dto.LoginRequest;
import com.angarita.empresa.dto.RegisterRequest;
import com.angarita.empresa.model.Usuario;
import com.angarita.empresa.repository.UsuarioRepository;
import com.angarita.empresa.service.AuthService;
import com.angarita.empresa.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            UsuarioRepository usuarioRepository
    ) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.registrar(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody String refreshToken) {

        try {

            // 1. Comprobar que el Refresh Token sea válido
            if (!jwtService.isRefreshTokenValid(refreshToken)) {
                return ResponseEntity.badRequest()
                        .body("Refresh Token inválido o vencido");
            }

            // 2. Obtener el username desde el Refresh Token
            String username = jwtService.extractUsername(refreshToken);

            // 3. Buscar el usuario en la base de datos
            Usuario usuario = usuarioRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // 4. Generar un nuevo Access Token
            String nuevoToken = jwtService.generateToken(usuario);

            // 5. Devolver el nuevo Access Token
            return ResponseEntity.ok(
                    new AuthResponse(nuevoToken, refreshToken)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body("No se pudo renovar el token");
        }
    }
}